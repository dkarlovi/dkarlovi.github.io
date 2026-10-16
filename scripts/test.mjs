// Running in one process also exposes individual test results on Node 22.
import { readdir } from "node:fs/promises";
for (const file of (await readdir(new URL("../tests/", import.meta.url)))
    .filter((file) => file.endsWith(".test.ts"))
    .sort()) {
    await import(new URL(`../tests/${file}`, import.meta.url));
}
