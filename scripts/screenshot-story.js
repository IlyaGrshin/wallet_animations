import { chromium } from "playwright"
import { spawn } from "child_process"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { parseArgs as nodeParseArgs } from "node:util"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, "..")
const APP_PORT = Number(process.env.APP_PORT) || 3000
const PREVIEW_PORT = 4173

function waitForServer(url, timeout = 15000) {
	const start = Date.now()
	return new Promise((resolve, reject) => {
		const check = () => {
			fetch(url)
				.then(() => resolve())
				.catch(() => {
					if (Date.now() - start > timeout) {
						reject(new Error(`Server not ready at ${url}`))
					} else {
						setTimeout(check, 300)
					}
				})
		}
		check()
	})
}

async function startPreviewServer() {
	const server = spawn("yarn", ["preview", "--port", String(PREVIEW_PORT)], {
		cwd: ROOT,
		stdio: "pipe",
		shell: true,
	})

	server.stdout.resume()
	server.stderr.on("data", (data) => {
		const msg = data.toString()
		if (msg.includes("Error")) console.error(msg)
	})

	await waitForServer(`http://localhost:${PREVIEW_PORT}`)
	return server
}

export async function screenshotStory(options = {}) {
	const {
		coinName = "TOKEN",
		coinIcon = "",
		direction = "Long",
		leverage = "1",
		pnl = "0",
		entryPrice = "0.00",
		closePrice = "0.00",
		timestamp = new Date().toISOString(),
		output,
		dev = false,
		browser: externalBrowser,
	} = options

	const port = dev ? APP_PORT : PREVIEW_PORT
	let server = null
	const browser = externalBrowser || await chromium.launch({ headless: true })

	try {
		if (!dev) {
			server = await startPreviewServer()
		}

		const params = new URLSearchParams({
			coinName,
			coinIcon,
			direction,
			leverage,
			pnl,
			entryPrice,
			closePrice,
			timestamp,
		})

		const basePath = process.env.BASE_PATH || ""
		const url = `http://localhost:${port}${basePath}/#/story?${params}`

		const page = await browser.newPage({
			viewport: { width: 360, height: 800 },
			deviceScaleFactor: 3,
		})

		await page.goto(url, { waitUntil: "load" })
		await page.evaluate(() => document.fonts.ready)

		const card = page.locator("[data-story-card]")
		const screenshotOpts = { type: "png" }
		if (output) screenshotOpts.path = output

		const buffer = await card.screenshot(screenshotOpts)
		await page.close()

		if (output) console.log(`Screenshot saved: ${output}`)
		return output || buffer
	} finally {
		if (!externalBrowser) await browser.close().catch(() => {})
		if (server) server.kill()
	}
}

// CLI entry point — only runs when invoked directly
const __filename = fileURLToPath(import.meta.url)
if (process.argv[1] === __filename) {
	const { values: args } = nodeParseArgs({
		options: {
			coinName: { type: "string" },
			coinIcon: { type: "string" },
			direction: { type: "string" },
			leverage: { type: "string" },
			pnl: { type: "string" },
			entryPrice: { type: "string" },
			closePrice: { type: "string" },
			timestamp: { type: "string" },
			output: { type: "string" },
			dev: { type: "boolean", default: false },
		},
		strict: false,
	})
	screenshotStory({ output: "story.png", ...args })
}
