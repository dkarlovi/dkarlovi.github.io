---
title: Introducing Diapason
slug: introducing-diapason
summary: "Diapason is a monophonic pitch-to-MIDI browser tool allowing you to hum or whistle a tune into your mic and get a MIDI out."
publishedAt: 2026-11-03
draft: true
categories: [engineering]
series: []
keywords: []
experience:
    aspect: 12/7 # Diapason's recommended 720 × 420 frame
image:
    url: ../../../assets/puzzle.jpeg
    credit: Photograph by Dalibor Karlović
---

If you're anything like me, you love music.

You constantly listen to it while working or relaxing,
you whistle some while driving your bike, you hum it to yourself while showering.

Unfortunately, you don't play it on an instrument because life hasn't found it necessary to burden you
with the ability to do so. You did at some point buy a second-hand guitar, went through some lessons, but
that didn't last because your progress was much slower than you'd hoped for. You've since forgotten all the chords,
and it's sitting in a closet somewhere next to the umbrellas.

This is unfortunate because you keep having various tunes stuck in your head and have no real way to get them out.
If you want to make a tune, you need to go to [BandLab](https://www.bandlab.com/) and click on random keyboard keys
until it sounds right because you don't read/write notes or know what "in key" means.

No more!

## What's Diapason

[Diapason](https://dkarlovi.github.io/diapason/) is a small in-browser tool which allows you to whistle or hum a tune
into your mic, then have it intuit what you were going for as best as it can, giving you a solid MIDI file.

The name comes from _[diapason](https://en.wikipedia.org/wiki/Diapason)_,
which is a [tuning fork](https://en.wikipedia.org/wiki/Tuning_fork) in Italian and French.

Features include:

- **totally private**, everything is on your device unless you explicitly share it
- recording a mic feed with live view with a wizard-like UI, optimized for whistling and humming
- sophisticated audio processing allowing for automatically detecting the audio key, pitch and timing correction
- various presets allow to easily apply various corrections or change the mood in bulk
- detailed sliders and dropdowns to continue fine-tuning what the presets start with, adjustable instrument, octave, or key
- integration with actual MIDI instruments using [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- embeddable, styleable, usable on desktops, tables, phones, touch, mouse, keyboard

## How was Diapason built

Diapason was built in a fully agentic way (AKA _vibe coded_) to test out various SOTA approaches and skills available for
this type of development. The agents using it were Anthropic's Claude Code using `opus-5.5` and OpenAI's Codex using `sol-6.1`.

The primary skills used were [`superpowers`](https://github.com/obra/superpowers) and [`impeccable`](https://github.com/pbakaus/impeccable).
The artifacts the skills created can be seen in [the repo](https://github.com/dkarlovi/diapason) itself.

### The workflow

The rule I've used on this and other projects with great success is realizing coding agent's `AGENTS.md` is just a pinky promise:
it's just a text file stating a goal. The agent doesn't need to follow that goal, it might choose not to or forget about it
as the context gets filled.

This is why [my `AGENTS.md`](https://github.com/dkarlovi/diapason/blob/main/AGENTS.md?plain=1#L11-L21) always includes:

> This rule applies to every suggestion, refactor, or new pattern you introduce — always.
>
> Executable tool > Agent skill > Written guideline > Nothing
>
> When proposing or implementing any rule, convention, or best practice, assign it to the highest tier you can reach.

Agents must try to figure out a way to do the work without themselves doing it. If there's a tool which can find an issue
(ie `oxlint` with a custom AST rule), the agent must prefer that over just updating a skill file or doing it manually.

This makes the skills executable by the developer, CI and subsequent agentic sessions, highly improving the output.

## Try it yourself

This is a fully functional demo:

<iframe data-diapason-src="https://dkarlovi.github.io/diapason/new?embed=1&amp;afterRecording=edit" title="Diapason: whistle a tune and turn it into MIDI" allow="microphone; midi" loading="lazy" style="aspect-ratio: 12/7; max-width: 50rem; min-height: 26rem; box-shadow: 0 0.75rem 2rem #0002"></iframe>
