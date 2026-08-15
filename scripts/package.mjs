import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"));
const outputDirectory = resolve(root, "release");
const output = resolve(outputDirectory, `group-tabs-on-demand-v${manifest.version}.zip`);

mkdirSync(outputDirectory, { recursive: true });
rmSync(output, { force: true });

execFileSync(
  "zip",
  [
    "-q",
    "-r",
    output,
    "manifest.json",
    "service-worker.js",
    "icons/icon-16.png",
    "icons/icon-32.png",
    "icons/icon-48.png",
    "icons/icon-128.png"
  ],
  { cwd: root }
);

console.log(`Created ${output}`);
