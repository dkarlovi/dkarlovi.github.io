export function initializeAsides() {
    const asides = document.querySelectorAll<HTMLDetailsElement>("details.collapsible-aside");
    if (!asides.length) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const running = new Set<Animation>();
    const cancel = () => {
        for (const animation of running) animation.cancel();
        running.clear();
    };
    const play = (target: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
        const animation = target.animate(frames, options);
        running.add(animation);
        animation.onfinish = () => running.delete(animation);
    };
    reduced.addEventListener("change", cancel);
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) cancel();
    });

    for (const aside of asides) {
        const summary = aside.querySelector<HTMLElement>(":scope > summary");
        if (!summary || aside.classList.contains("is-enhanced")) continue;
        const label = document.createElement("span");
        label.className = "aside-label";
        while (summary.firstChild) label.append(summary.firstChild);
        const badge = document.createElement("span");
        badge.className = "aside-alert";
        badge.setAttribute("aria-hidden", "true");
        badge.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none"><path d="M12 5.5v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18" r="1.2" fill="currentColor"/></svg>';
        const toggle = document.createElement("span");
        toggle.className = "aside-toggle";
        toggle.setAttribute("aria-hidden", "true");
        toggle.innerHTML =
            '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path class="vertical" d="M8 3v10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
        const sweep = document.createElement("span");
        sweep.className = "aside-sweep";
        sweep.setAttribute("aria-hidden", "true");
        const bands = document.createElement("span");
        bands.className = "aside-sweep-bands";
        bands.innerHTML =
            '<span class="aside-sweep-band"></span><span class="aside-sweep-band"></span>';
        sweep.append(bands);
        summary.append(sweep, badge, label, toggle);
        aside.classList.add("is-enhanced");

        aside.addEventListener("toggle", () => {
            cancel();
            if (reduced.matches) return;
            const header = summary.getBoundingClientRect();
            const button = toggle.getBoundingClientRect();
            const origin = button.left + button.width / 2 - header.left;
            const sweepStart = origin + header.height / 2;
            const sweepEnd = -150 - header.height / 2;
            const travel = sweepStart - sweepEnd;
            const sweepDuration = 500 + Math.min(1, Math.max(0, (travel - 600) / 750)) * 1000;
            sweep.style.clipPath = `inset(0 ${Math.max(0, header.width - origin)}px 0 0)`;
            const duration = aside.open ? 450 : 300;
            play(
                toggle,
                [
                    { transform: "scale(1) rotate(0)" },
                    { transform: "scale(0.84) rotate(-7deg)", offset: 0.12 },
                    { transform: "scale(1.13) rotate(4deg)", offset: 0.35 },
                    { transform: "scale(1) rotate(0)" },
                ],
                { duration, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
            );
            play(
                bands,
                [
                    { transform: `translateX(${sweepStart}px)`, opacity: 0 },
                    { opacity: 0.09, offset: 0.08 },
                    { opacity: 0.09, offset: 0.2 },
                    { opacity: 0, offset: 0.55 },
                    { transform: `translateX(${sweepEnd}px)`, opacity: 0 },
                ],
                { duration: sweepDuration, delay: duration * 0.12, easing: "linear" },
            );
        });
    }
}
