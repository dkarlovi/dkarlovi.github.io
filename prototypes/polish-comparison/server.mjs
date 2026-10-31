import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const port = Number(process.env.PROTOTYPE_PORT || 4327);
const baseline = resolve(process.env.POLISH_BASELINE || resolve(tmpdir(), "colour-field-polish-baseline")) + "/";
const suggested = fileURLToPath(new URL("../../dist/", import.meta.url));
const screenshots = resolve(tmpdir(), "colour-polish-before-after");
const screenshotFiles = {
    "/screenshots/": "index.html",
    "/screenshots/mobile-hero.png": "mobile-hero.png",
    "/screenshots/small-screen-writing.png": "small-screen-writing.png",
    "/screenshots/article-end.png": "article-end.png",
    "/screenshots/mobile-article-attribution.png": "mobile-article-attribution.png",
};
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
    ".json": "application/json", ".webp": "image/webp", ".png": "image/png",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const routes = JSON.parse(await readFile(new URL("../theme-comparison/palettes.json", import.meta.url), "utf8")).routes;
const manifest = Object.fromEntries(Object.entries(routes).filter(([p]) => p !== "/colour-field-experiment"));
const assets = { "/": ["index.html", "text/html"], "/study.js": ["study.js", "text/javascript"],
    "/study.css": ["../theme-comparison/study.css", "text/css"],
    "/node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2": ["../../node_modules/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff2", "font/woff2"],
    "/node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2": ["../../node_modules/@fontsource/dm-sans/files/dm-sans-latin-600-normal.woff2", "font/woff2"] };
async function snapshot(path, root, prefix) {
    let file = resolve(root, "." + decodeURIComponent(path));
    if (file !== root.slice(0, -1) && !file.startsWith(root)) throw new Error("Invalid snapshot path");
    if ((await stat(file)).isDirectory()) file = resolve(file, "index.html");
    const type = types[extname(file)] || "application/octet-stream";
    const data = await readFile(file);
    return { type, data: /text\//.test(type) ? data.toString().replaceAll("/_astro/", prefix + "/_astro/") : data };
}
function forceTheme(scheme) {
    const roles = ["paper", "ink", "muted", "accent", "accent-ink", "panel", "line"];
    return `html{color-scheme:${scheme}!important}body{${roles.map(r => `--${r}:var(--${r}-${scheme})!important`).join(";")}}.destination-link{${roles.map(r => `--target-${r}:var(--target-${r}-${scheme})!important`).join(";")}}astro-dev-toolbar{display:none!important}`;
}
createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://localhost:${port}`);
        if (url.pathname === "/screenshots") {
            res.writeHead(302, { Location: "/screenshots/" }); res.end(); return;
        }
        if (screenshotFiles[url.pathname]) {
            const file = screenshotFiles[url.pathname];
            const data = await readFile(resolve(screenshots, file));
            res.writeHead(200, { "Content-Type": types[extname(file)], "Cache-Control": "no-store" });
            res.end(data); return;
        }
        if (url.pathname === "/manifest.json") {
            res.writeHead(200, { "Content-Type": "application/json" }); res.end(JSON.stringify(manifest)); return;
        }
        if (assets[url.pathname]) {
            const [file, type] = assets[url.pathname];
            res.writeHead(200, { "Content-Type": type + ";charset=utf-8" });
            res.end(await readFile(new URL(file, import.meta.url))); return;
        }
        if (url.pathname.startsWith("/__baseline/") || url.pathname.startsWith("/__suggested/")) {
            const prefix = url.pathname.startsWith("/__baseline/") ? "/__baseline" : "/__suggested";
            const result = await snapshot(url.pathname.slice(prefix.length), prefix === "/__baseline" ? baseline : suggested, prefix);
            res.writeHead(200, { "Content-Type": result.type }); res.end(result.data); return;
        }
        if (url.pathname !== "/frame") {
            try {
                const result = await snapshot(url.pathname, suggested, "/__suggested");
                res.writeHead(200, { "Content-Type": result.type }); res.end(result.data);
            } catch {
                res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Preview resource not found");
            }
            return;
        }
        const path = url.searchParams.get("path") || "/";
        if (!manifest[path]) throw new Error("Unknown comparison page");
        const side = url.searchParams.get("side") === "current" ? "current" : "suggested";
        const scheme = url.searchParams.get("scheme") === "dark" ? "dark" : "light";
        let html = (await snapshot(path, side === "current" ? baseline : suggested, side === "current" ? "/__baseline" : "/__suggested")).data;
        const config = JSON.stringify({ path, side, scheme, revision: url.searchParams.get("revision"), paths: Object.keys(manifest) });
        const script = `<script>const comparison=${config};document.addEventListener('DOMContentLoaded',()=>{document.body.dataset.comparisonRevision=comparison.revision;document.querySelectorAll('img').forEach(i=>i.loading='eager');document.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{const u=new URL(a.href);if(u.hash&&u.pathname==='/frame')return;e.preventDefault();if(comparison.paths.includes(u.pathname))parent.postMessage({type:'polish-navigate',path:u.pathname},location.origin)}));window.addEventListener('message',e=>{if(e.origin!==location.origin||e.data?.type!=='polish-position')return;const target=e.data.position==='reading'?document.querySelector('.article-content,.home-writing,.listing-layout,.taxonomy-grid,.simple-content'):e.data.position==='footer'?document.querySelector('.site-footer'):document.body;window.scrollTo({top:target?.getBoundingClientRect().top+scrollY||0,behavior:'instant'})});});</script>`;
        html = html.replace("</body>", `<style>${forceTheme(scheme)}</style>${script}</body>`);
        res.writeHead(200, { "Content-Type": "text/html;charset=utf-8", "Cache-Control": "no-store" }); res.end(html);
    } catch (error) {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end(`Comparison could not load: ${error.message}. See prototypes/polish-comparison/README.md.`);
    }
}).listen(port, "127.0.0.1", () => console.log(`Polish comparison: http://localhost:${port}`));
