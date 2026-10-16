/** A silent, cancellable hover easter egg. Navigation and accessible names stay static. */
const beat = 60_000 / 138;
const phrase = beat * 2;
const timing = {
    lead: 1000,
    impact: 650,
    hold: 1400,
    lightFade: 360,
    lightGap: 460,
    morph: 650,
    calm: 5000,
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const hover = matchMedia("(hover: hover)");

class ReadDisco {
    private label: HTMLElement;
    private stage: HTMLElement;
    private idle: HTMLElement;
    private beams: HTMLElement[];
    private timers = new Set<ReturnType<typeof setTimeout>>();
    private animations = new Set<Animation>();
    private pointer = false;
    private focus = false;
    private running = false;

    constructor(private link: HTMLAnchorElement) {
        this.label = link.querySelector<HTMLElement>(".read-more-chorus")!;
        this.stage = link.querySelector<HTMLElement>(".read-more-stage")!;
        this.idle = link.querySelector<HTMLElement>(".read-more-idle")!;
        this.beams = [...link.querySelectorAll<HTMLElement>(".read-more-beam")];
        link.addEventListener("pointerenter", (event) => {
            if (hover.matches && event.pointerType !== "touch") {
                this.pointer = true;
                this.sync();
            }
        });
        link.addEventListener("pointerleave", () => {
            this.pointer = false;
            this.sync();
        });
        link.addEventListener("focus", () => {
            this.focus = link.matches(":focus-visible");
            this.sync();
        });
        link.addEventListener("blur", () => {
            this.focus = false;
            this.sync();
        });
        link.addEventListener("pointerdown", () => this.stop());
    }

    private later(action: () => void, delay: number) {
        const timer = setTimeout(() => {
            this.timers.delete(timer);
            action();
        }, delay);
        this.timers.add(timer);
    }

    private animate(node: HTMLElement, frames: Keyframe[], options: KeyframeAnimationOptions = {}) {
        // Keep completed fill effects until cleanup, so a faded lamp stays off.
        this.animations.add(
            node.animate(frames, {
                duration: phrase,
                easing: "cubic-bezier(.2,.8,.2,1)",
                ...options,
            }),
        );
    }

    private cancelAnimations() {
        for (const animation of this.animations) animation.cancel();
        this.animations.clear();
    }

    stop() {
        for (const timer of this.timers) clearTimeout(timer);
        this.timers.clear();
        this.cancelAnimations();
        this.link.classList.remove("is-dancing", "is-finale");
        delete this.link.dataset.disco;
        this.label.replaceChildren();
        this.running = this.pointer = this.focus = false;
    }

    private sync() {
        if (reduced.matches || document.hidden || !(this.pointer || this.focus)) {
            this.stop();
            return;
        }
        if (this.running) return;
        this.running = true;
        this.link.dataset.disco = "armed";
        this.later(() => this.chorus(), timing.lead);
    }

    private chorus() {
        this.cancelAnimations();
        this.link.classList.add("is-dancing");
        this.link.dataset.disco = "playing";
        this.beams.forEach((beam, i) =>
            this.animate(
                beam,
                [
                    { transform: `rotate(${i ? -27 : 27}deg)` },
                    { transform: `rotate(${i ? 27 : -27}deg)` },
                    { transform: `rotate(${i ? -27 : 27}deg)` },
                ],
                { duration: phrase * 4, easing: "ease-in-out" },
            ),
        );
        for (let i = 0; i < 4; i++) this.later(() => this.line(i), phrase * i);
        this.later(() => this.finale(), phrase * 4);
    }

    private line(index: number) {
        const read = document.createElement("span"),
            it = document.createElement("span");
        read.textContent = "Read";
        it.textContent = "it!";
        this.label.replaceChildren(read, it);
        const direction = index % 2 ? -1 : 1;
        [read, it].forEach((word, i) =>
            this.animate(
                word,
                [
                    {
                        transform: `translateY(${i ? -18 : 18}px) rotate(${direction * 8}deg)`,
                        opacity: 0,
                    },
                    { transform: "translateY(-4px) rotate(-4deg)", opacity: 1, offset: 0.2 },
                    { transform: "translateY(3px) rotate(4deg)", offset: 0.5 },
                    { transform: "translateY(-3px) rotate(-3deg)", offset: 0.76 },
                    { transform: "none" },
                ],
                { delay: i * 80, duration: phrase - i * 80 },
            ),
        );
    }

    private finale() {
        this.cancelAnimations();
        this.link.classList.add("is-finale");
        this.link.dataset.disco = "finale";
        this.label.textContent = "JUST READ IT!";
        this.animate(
            this.label,
            [
                { transform: "translateY(-1.5rem) scale(1.55,.8)", opacity: 0 },
                { transform: "translateY(.25rem) scale(1.14,.77)", opacity: 1, offset: 0.23 },
                { transform: "translateY(-.1875rem) scale(.97,1.08)", offset: 0.47 },
                { transform: "translateY(.0625rem) scale(1.02,.97)", offset: 0.7 },
                { transform: "none" },
            ],
            { duration: timing.impact },
        );
        for (const beam of this.beams)
            this.animate(
                beam,
                [
                    { transform: "rotate(0deg)", opacity: 0.7 },
                    { transform: "rotate(0deg)", opacity: 0.34 },
                ],
                { duration: timing.impact, fill: "forwards" },
            );
        this.later(() => this.lightsOut(), timing.impact + timing.hold);
    }

    private lightsOut() {
        this.link.dataset.disco = "lights-out";
        this.beams.forEach((beam, i) =>
            this.animate(
                beam,
                [
                    { opacity: 0.34, transform: "rotate(0deg)" },
                    { opacity: 0, transform: `rotate(${i ? 12 : -12}deg)` },
                ],
                { delay: i * timing.lightGap, duration: timing.lightFade, fill: "forwards" },
            ),
        );
        this.later(() => this.morph(), timing.lightFade + timing.lightGap);
    }

    private morph() {
        this.link.dataset.disco = "morph";
        this.animate(
            this.label,
            [
                { opacity: 1, transform: "none" },
                { opacity: 0, transform: "translateX(-.4rem) scale(.72)" },
            ],
            { duration: timing.morph, fill: "forwards" },
        );
        this.animate(this.stage, [{ opacity: 1 }, { opacity: 0 }], {
            duration: timing.morph,
            fill: "forwards",
        });
        this.animate(
            this.idle,
            [
                { opacity: 0, transform: "translateY(.2rem) scale(.96)" },
                { opacity: 1, transform: "none" },
            ],
            { delay: 150, duration: timing.morph - 150, fill: "forwards" },
        );
        this.later(() => {
            this.link.classList.remove("is-dancing", "is-finale");
            this.cancelAnimations();
            this.label.replaceChildren();
            this.link.dataset.disco = "calm";
            this.later(() => this.chorus(), timing.calm);
        }, timing.morph);
    }
}

const discos = [...document.querySelectorAll<HTMLAnchorElement>("[data-read-disco]")].map(
    (link) => new ReadDisco(link),
);
const stopAll = () => discos.forEach((disco) => disco.stop());
reduced.addEventListener("change", stopAll);
document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAll();
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") stopAll();
});
