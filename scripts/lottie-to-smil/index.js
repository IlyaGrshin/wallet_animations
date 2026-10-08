// Converts the TabBar Lottie icons into self-contained SVGs animated with SMIL.
// The Lottie JSON stays the source of truth: re-run after editing an icon.
//
//   yarn icons:lottie
import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { sampleLottie } from "./sample.js"
import { emitSvg } from "./emit.js"

const ICONS_DIR = join(
    dirname(fileURLToPath(import.meta.url)),
    "../../src/icons/lottie"
)

const files = (await readdir(ICONS_DIR, { recursive: true }))
    .filter((f) => f.endsWith(".json"))
    .sort()

for (const file of files) {
    const data = JSON.parse(await readFile(join(ICONS_DIR, file), "utf8"))
    // Playback metadata for the runtime (frame-based segments as in Lottie).
    const meta = ` data-fps="${data.fr}" data-frames="${data.op - data.ip}"`
    const svg = emitSvg(sampleLottie(data)).replace("<svg", `<svg${meta}`)
    const out = file.replace(/\.json$/, ".svg")
    await writeFile(join(ICONS_DIR, out), `${svg}\n`)
    console.log(`${out.padEnd(36)} ${(svg.length / 1024).toFixed(1)} kB`)
}
