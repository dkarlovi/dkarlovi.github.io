---
title: Testing speech recognition with Playwright
slug: testing-speech-recognition
summary: How to automate testing in-browser speech recognition, so you can stop talking to the computer and go back mumbling to yourself.
publishedAt: "2025-11-10"
image: ./robot.png
discussReddit: 1ou4q0b
categories:
- "@=yassg_get('categories', '/engineering.md')"
- "@=yassg_get('categories', '/programming.md')"
- "@=yassg_get('categories', '/quality.md')"
series: []
keywords:
- quality
- testing
- qa
- speech
- speech recognition
- playwright
---

While working on my [voice-controlled teleprompter app](https://urq.app/), which was my first experience with
speech-related APIs, I discovered a new type of test that's worse than flaky tests, worse than
manual tests, even worse than flaky manual tests.

I've discovered the **out loud** flaky manual test.

## The problem

As you're working, you need to be constantly speaking into the microphone
because that's what you're testing. This makes people around you constantly wonder 
if you're talking to them this time or not, you're interrupting their work and bringing
attention to how you pronounce the word "little".

## The solution

Since we're already using [Playwright](https://playwright.dev/), it turns out
we can make Chrome listen to our prerecorded voicemail.

Key part are these Chrome flags:
1. `--use-fake-ui-for-media-stream`  
    avoids granting permissions to the microphone
2. `--use-fake-device-for-media-stream`  
    creates a dummy device
3. `--use-file-for-fake-audio-capture=path/to/audio.wav`  
    plays a pre-recorded file on the said fake device
4. `--disable-audio-input`  
    disables any actual microphones you might have so you know you're listening to the correct (fake) device
5. use `channel: "chrome"` to refer to Chrome in the Playwright settings to ensure speech recognition API is enabled, 
    using `channel: "chromium"` (or nothing) will not work as of this writing.

We can now run a test with Playwright in Chrome and, when we start voice recognition (or any microphone-related operation),
it will play our WAV file.

The end.

## The new problem

But wait, this will play the same WAV file every time, so how do we test different phrases?

What if I need to speak in English and then in Croatian?

## The solution #2

What we do is we:

1. create multiple WAV files
2. for each, we create a separate [Playwright project](https://playwright.dev/docs/test-projects)
3. ensure the specific test is bound to the specific project and nothing else, since we'll be asserting exactly what we want to do

This is very tedious to do manually, so let's engineer a small helper which does it automagically:

1. we put all our WAV files into `tests/fixtures`, all of them named like `speech-<phrase said>.wav`
2. for each file we find, we create the already mentioned Playwright project, making sure to tag the project with the file name:  
    ^^^
    ```javascript
    return {
        name: name,
        use: {
            ...devices["Desktop Chrome"],
            channel: "chrome", // !important
            launchOptions: {
                args: [
                    "--disable-audio-input",
                    "--use-fake-device-for-media-stream",
                    "--use-fake-ui-for-media-stream",
                    `--use-file-for-fake-audio-capture=${filePath}`,
                ],
            },
        },
        // only target tests which have our name as their tag
        grep: new RegExp(`@${name}`),
    };
    ```
    ^^^ [Example]: Playwright project for a specific speech WAV file
3. in our test, we tag it with the file name so it only runs in the correct project:  
    ^^^
    ```javascript
    test(
        "should progress prompter position as speech is recognized",
        // opt-in to a very specific file to use
        { tag: "@speech-hello-world-how-are-you" },
        async ({ page }) => {
            await page.fill(
                "#script-input",
                "hello world, how are you doing today?",
            );
            await page.locator('[role="speech-control"]').click();
            // wait for the length of the audio file
            await page.waitForTimeout(5000);
            await page.locator('[role="speech-control"]').click();

            const currentWord = await page
                .locator(".word.current")
                .textContent();
            expect(currentWord).toBe("doing");
        },
    );
    ```
    ^^^ [Example]: Playwright testing speech recognition using a very specific file
4. make sure to exclude the speech-related tests from your "normal" Playwright projects:
   ^^^
   ```javascript 
    {
        name: "Chrome",
        use: { ...devices["Desktop Chrome"], channel: "chrome" },
        // anything tagged with speech* is skipped in the non-audio projects
        grepInvert: /@speech/,
    },
    ```
   ^^^ [Example]: exclude speech tests from your regular Playwright projects

<aside title="Don't actually store WAV files in your repo">
Since WAV files are basically raw audio data with a mustache, we don't want to
keep them as is in our repo since we'll be adding a lot of them and the repo size would balloon, but annoyingly
Chrome needs a WAV file specifically so we MUST have it once it runs, even though it supports playback of other formats.

What we do is we keep the audio files in a compressed format (FLAC) and uncompress them
on-demand into the same dir before the tests run, if they're not already decoded. This is done in pure Node so we don't need any external dependencies like `ffmpeg`.

^^^
```javascript
async function decodeFlacToWav(
    flacPath: string,
    wavPath: string,
): Promise<void> {
    // Skip if WAV exists and is newer than FLAC
    if (existsSync(wavPath)) {
        const flacStat = readFileSync(flacPath);
        const wavStat = readFileSync(wavPath);
        if (wavStat.length > 0) {
            return;
        }
    }

    console.log(`Decoding FLAC to WAV: ${flacPath} -> ${wavPath}`);

    // Read FLAC file
    const flacData = readFileSync(flacPath);

    // Decode FLAC
    const decoder = new FLACDecoder();
    await decoder.ready;

    const decoded = await decoder.decodeFile(flacData);
    decoder.free();

    // Convert Float32Array to Int16Array for 16-bit WAV
    const interleaved = interleaveChannels(decoded.channelData);
    const pcmData = float32ToInt16(interleaved);

    // Create WAV file
    const numChannels = decoded.channelData.length;
    const bitDepth = 16; // Converting to 16-bit
    const dataSize = pcmData.length * 2; // 2 bytes per sample for 16-bit

    const wavHeader = createWavHeader(
        decoded.sampleRate,
        numChannels,
        bitDepth,
        dataSize,
    );

    // Write WAV file
    const wavBuffer = Buffer.concat([wavHeader, Buffer.from(pcmData.buffer)]);
    writeFileSync(wavPath, wavBuffer);

    console.log(`Successfully decoded: ${wavPath}`);
}
```
^^^ [Example]: decode FLAC to WAV before tests run, use your imagination for the missing functions
</aside>

## Full example of `playwright.config.js`

^^^
```javascript
async function generateSpeechProjects() {
    const fixturesDir = join(__dirname, "tests/fixtures");

    try {
        const files = readdirSync(fixturesDir);

        // Find all FLAC files and decode them to WAV if needed
        const flacFiles = files.filter(
            (file) => parse(file).ext.toLowerCase() === ".flac",
        );

        for (const flacFile of flacFiles) {
            const { name } = parse(flacFile);
            const flacPath = join(fixturesDir, flacFile);
            const wavPath = join(fixturesDir, `${name}.wav`);

            await decodeFlacToWav(flacPath, wavPath);
        }

        // Now find all WAV files (including newly decoded ones)
        const updatedFiles = readdirSync(fixturesDir);
        const wavFiles = updatedFiles.filter(
            (file) => parse(file).ext.toLowerCase() === ".wav",
        );

        return wavFiles.map((file) => {
            const { name } = parse(file);
            const filePath = join(fixturesDir, file);

            return {
                name: name,
                use: {
                    ...devices["Desktop Chrome"],
                    channel: "chrome",
                    launchOptions: {
                        args: [
                            "--disable-audio-input",
                            "--use-fake-device-for-media-stream",
                            "--use-fake-ui-for-media-stream",
                            `--use-file-for-fake-audio-capture=${filePath}`,
                        ],
                    },
                },
                grep: new RegExp(`@${name}`),
            };
        });
    } catch (error) {
        console.warn(
            `Warning: Could not process fixtures: ${error instanceof Error ? error.message : String(error)}`,
        );
        return [];
    }
}

export default defineConfig({
    projects: [
        // regular tests
        {
            name: "Chrome",
            use: { ...devices["Desktop Chrome"], channel: "chrome" },
            grepInvert: /@speech/,
        },
        // audio tests
        ...await generateSpeechProjects(),
    ],
});

```
^^^ [Example]: Full Playwright config for speech recognition testing

That's it, now we're able to add new speech recognition tests by just adding as many new fixture files as we need 
and asserting against them.

Bonjour.
