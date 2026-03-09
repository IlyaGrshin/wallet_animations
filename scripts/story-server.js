import { createServer } from "http"
import { chromium } from "playwright"

const PORT = Number(process.env.STORY_PORT) || 3001
const APP_PORT = Number(process.env.APP_PORT) || 3000
const BASE_PATH = process.env.BASE_PATH || ""

const DEFAULTS = {
	coinName: "TOKEN",
	coinIcon: "",
	direction: "Long",
	leverage: "1",
	pnl: "0",
	entryPrice: "0.00",
	closePrice: "0.00",
	timestamp: new Date().toISOString(),
}

let browser
let warmPage

async function initBrowser() {
	browser = await chromium.launch({ headless: true })
	warmPage = await createWarmPage()
}

async function createWarmPage() {
	const page = await browser.newPage({
		viewport: { width: 360, height: 800 },
		deviceScaleFactor: 3,
	})
	const params = new URLSearchParams(DEFAULTS)
	const url = `http://localhost:${APP_PORT}${BASE_PATH}/#/story?${params}`
	await page.goto(url, { waitUntil: "load" })
	await page.evaluate(() => document.fonts.ready)
	return page
}

async function takeScreenshot(searchParams) {
	const params = {}
	for (const key of Object.keys(DEFAULTS)) {
		params[key] = searchParams.get(key) || DEFAULTS[key]
	}

	const query = new URLSearchParams(params)
	const url = `http://localhost:${APP_PORT}${BASE_PATH}/#/story?${query}`

	const page = warmPage
	await page.goto(url, { waitUntil: "load" })
	await page.evaluate(() => document.fonts.ready)

	const card = page.locator("[data-story-card]")
	return card.screenshot({ type: "png" })
}

createServer(async (req, res) => {
	const url = new URL(req.url, `http://localhost:${PORT}`)

	if (url.pathname !== "/story.png") {
		res.writeHead(404)
		res.end("Not found")
		return
	}

	try {
		const png = await takeScreenshot(url.searchParams)

		res.writeHead(200, {
			"Content-Type": "image/png",
			"Content-Length": png.byteLength,
			"Cache-Control": "public, max-age=60",
		})
		res.end(png)
	} catch (err) {
		console.error("Screenshot failed:", err)
		res.writeHead(500)
		res.end("Screenshot failed")
	}
}).listen(PORT, async () => {
	await initBrowser()
	console.log(`Story screenshot server: http://localhost:${PORT}/story.png`)
})
