import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const origin = process.env.ASTRO_URL || "http://localhost:4321";
const port = Number(process.env.PROTOTYPE_PORT || 4325);
const roles = ["paper", "ink", "muted", "accent", "accentInk", "panel", "line"];
const cssName = name => name.replace(/[A-Z]/g, c => "-" + c.toLowerCase());
const registry = JSON.parse(await readFile(new URL("palettes.json", import.meta.url), "utf8"));
const assets = { "/": ["index.html", "text/html"], "/study.css": ["study.css", "text/css"],
    "/study.js": ["study.js", "text/javascript"], "/palettes.json": ["palettes.json", "application/json"] };
function paletteRules(palette, prefix = "") {
    return Object.entries(palette).flatMap(([mode, values]) => Object.entries(values)
        .map(([key, value]) => `--${prefix}${cssName(key)}-${mode}:${value}`)).join(";");
}

createServer(async (req, res) => {
    try {
        const url = new URL(req.url, `http://localhost:${port}`);
        if (assets[url.pathname]) {
            const [file, type] = assets[url.pathname];
            res.writeHead(200, { "Content-Type": type + "; charset=utf-8", "Cache-Control": "no-store" });
            res.end(await readFile(new URL(file, import.meta.url)));
            return;
        }
        const frame = url.pathname === "/frame";
        const path = frame ? url.searchParams.get("path") || "/" : req.url;
        if (!path.startsWith("/") || path.startsWith("//")) throw new Error("Invalid local path");
        const upstream = await fetch(new URL(path, origin), { headers: { "Accept-Encoding": "identity" } });
        const contentType = upstream.headers.get("content-type") || "application/octet-stream";
        res.writeHead(upstream.status, { "Content-Type": contentType, "Cache-Control": "no-store" });
        if (!frame || !contentType.includes("text/html")) { res.end(Buffer.from(await upstream.arrayBuffer())); return; }
        const engine = ["current", "material", "warm"].includes(url.searchParams.get("engine")) ? url.searchParams.get("engine") : "current";
        const scheme = url.searchParams.get("scheme") === "dark" ? "dark" : "light";
        const entry = registry.routes[path];
        if (!entry) { res.end("Unknown prototype route"); return; }
        let css = `html{color-scheme:${scheme}!important}body{${paletteRules(entry[engine]).split(";").map(v => v + "!important").join(";")};${roles.map(r => `--${cssName(r)}:var(--${cssName(r)}-${scheme})!important`).join(";")}}`;
        css += `.destination-link{${roles.map(r => `--target-${cssName(r)}:var(--target-${cssName(r)}-${scheme})!important`).join(";")}}`;
        for (const [route, target] of Object.entries(registry.routes)) {
            css += `[data-target-palette=${JSON.stringify(route)}]{${paletteRules(target[engine], "target-").split(";").map(v => v + "!important").join(";")}}`;
        }
        css += "astro-dev-toolbar{display:none!important}";
        const data = JSON.stringify({ path, engine, scheme, revision: url.searchParams.get("revision"), routes: registry.routes });
        const script = `<script>const study=${data};document.addEventListener('DOMContentLoaded',()=>{document.documentElement.dataset.scheme=study.scheme;document.body.dataset.studyRevision=study.revision;document.body.dataset.studyPath=study.path;document.body.dataset.studyEngine=study.engine;document.body.dataset.studyScheme=study.scheme;document.querySelectorAll('img').forEach(i=>i.loading='eager');document.querySelectorAll('.photo-palette span').forEach((s,i)=>{const k=['paper','ink','accent','panel'][i%4];s.style.background=study.routes[study.path][study.engine][study.scheme][k];s.title=k+': '+s.style.background});document.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{const u=new URL(a.href);if(u.hash&&u.pathname==='/frame')return;e.preventDefault();if(study.routes[u.pathname])parent.postMessage({type:'study-navigate',path:u.pathname},location.origin)}));});</script>`;
        res.end((await upstream.text()).replace("</body>", `<style>${css}</style>${script}</body>`));
    } catch (error) {
        if (!res.headersSent) res.writeHead(502, { "Content-Type": "text/plain" });
        res.end(`Prototype could not load the local Astro site: ${error.message}. Start npm run dev.`);
    }
}).listen(port, "127.0.0.1", () => console.log(`Theme comparison: http://localhost:${port}\nAstro source: ${origin}`));
