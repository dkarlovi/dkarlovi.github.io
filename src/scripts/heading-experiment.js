"use strict";
(() => {
    const canvas = document.querySelector("[data-heading-experiment] canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d"),
        button = document.querySelector("[data-experiment-motion]"),
        slider = document.querySelector("[data-experiment-light]"),
        motion = matchMedia("(prefers-reduced-motion: reduce)");
    let paused = motion.matches,
        visible = false,
        frame = 0,
        previous = 0,
        time = 0,
        cw = 0,
        ch = 0;
    let palette = { light: "#edcd89", ink: "#1a211b" };
    function cachePalette() {
        const s = getComputedStyle(document.body);
        palette.light = s.getPropertyValue("--accent-dark").trim() || "#edcd89";
        palette.ink = s.getPropertyValue("--paper-dark").trim() || "#1a211b";
        draw();
    }
    function state() {
        button.textContent = paused ? "Play" : "Pause";
        button.setAttribute("aria-pressed", String(paused));
    }
    function draw() {
        const w = canvas.clientWidth,
            h = canvas.clientHeight;
        if (!w || !h) return;
        const ratio = Math.min(devicePixelRatio || 1, 2);
        if (cw !== w || ch !== h) {
            cw = w;
            ch = h;
            canvas.width = Math.round(w * ratio);
            canvas.height = Math.round(h * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        }
        const light = Number(slider.value) / 100,
            sx = w * (0.16 + 0.68 * light),
            sy = h * (0.25 + Math.sin(light * Math.PI) * 0.07);
        ctx.fillStyle = palette.ink;
        ctx.fillRect(0, 0, w, h);
        const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.46);
        glow.addColorStop(0, palette.light + "65");
        glow.addColorStop(0.28, palette.light + "20");
        glow.addColorStop(1, palette.light + "00");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = palette.light;
        ctx.beginPath();
        ctx.arc(sx, sy, h * 0.045, 0, Math.PI * 2);
        ctx.fill();
        const horizon = h * 0.44;
        for (let row = 0; row < 32; row++) {
            const depth = row / 31,
                y = horizon + Math.pow(depth, 1.7) * h * 0.61;
            ctx.strokeStyle = palette.light;
            ctx.globalAlpha = 0.15 + depth * 0.55;
            ctx.lineWidth = 0.55 + depth * 0.25;
            ctx.beginPath();
            for (let x = -12; x <= w + 12; x += 6) {
                const nx = x / w,
                    amp = (0.015 + depth * 0.065) * h,
                    wave =
                        Math.sin(nx * 9 + time * 0.00025 + row * 0.1) * amp +
                        Math.sin(nx * 17 - time * 0.00013 + row * 0.08) * amp * 0.55;
                const yy = y + wave;
                if (x === -12) {
                    ctx.moveTo(x, yy);
                } else {
                    ctx.lineTo(x, yy);
                }
            }
            ctx.stroke();
        }
        for (let column = -13; column <= 13; column++) {
            ctx.globalAlpha = 0.12;
            ctx.beginPath();
            for (let row = 0; row < 32; row++) {
                const depth = row / 31,
                    x = w * 0.5 + column * w * 0.045 * (0.12 + depth * 1.8),
                    nx = x / w,
                    amp = (0.015 + depth * 0.065) * h,
                    y =
                        horizon +
                        Math.pow(depth, 1.7) * h * 0.61 +
                        Math.sin(nx * 9 + time * 0.00025 + row * 0.1) * amp +
                        Math.sin(nx * 17 - time * 0.00013 + row * 0.08) * amp * 0.55;
                if (row === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
    function tick(now) {
        frame = 0;
        if (paused || !visible || document.hidden) {
            previous = 0;
            return;
        }
        time += previous ? Math.min(now - previous, 40) : 16;
        previous = now;
        draw();
        frame = requestAnimationFrame(tick);
    }
    function stop() {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        previous = 0;
    }
    function start() {
        if (!frame && !paused && visible && !document.hidden) frame = requestAnimationFrame(tick);
    }
    button.addEventListener("click", () => {
        paused = !paused;
        state();
        stop();
        start();
    });
    slider.addEventListener("input", draw);
    function point(event) {
        const r = canvas.getBoundingClientRect();
        slider.value = String(
            Math.round(Math.max(0, Math.min(100, ((event.clientX - r.left) / r.width) * 100))),
        );
        draw();
    }
    canvas.addEventListener("pointerdown", point);
    canvas.addEventListener("pointermove", (event) => {
        if (event.buttons === 1 && event.pointerType === "mouse") point(event);
    });
    motion.addEventListener("change", () => {
        paused = motion.matches;
        state();
        stop();
        draw();
        start();
    });
    document.addEventListener("visibilitychange", () => {
        stop();
        start();
    });
    new IntersectionObserver((entries) => {
        visible = entries[0].isIntersecting;
        stop();
        start();
    }).observe(canvas);
    new ResizeObserver(draw).observe(canvas);
    new MutationObserver(cachePalette).observe(document.body, {
        attributes: true,
        attributeFilter: ["style"],
    });
    state();
    cachePalette();
})();
