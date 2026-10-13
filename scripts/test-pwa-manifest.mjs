import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const root = new URL("../", import.meta.url)
const readText = (path) => readFile(new URL(path, root), "utf8")

const pngDimensions = async (path) => {
  const bytes = await readFile(new URL(path, root))
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${path} is a PNG`)
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

const [manifestText, indexHtml, iconSvg] = await Promise.all([
  readText("public/manifest.json"),
  readText("index.html"),
  readText("public/branding/campusnav-app-icon.svg"),
])
const manifest = JSON.parse(manifestText)

assert.equal(manifest.id, "/")
assert.equal(manifest.name, "CampusNav AI")
assert.equal(manifest.short_name, "CampusNav")
assert.equal(manifest.start_url, "/")
assert.equal(manifest.scope, "/")
assert.equal(manifest.display, "standalone")
assert.deepEqual(manifest.display_override, ["window-controls-overlay", "standalone"])
assert.equal(manifest.background_color, "#ffffff")
assert.equal(manifest.theme_color, "#0a0a0a")
assert.ok(manifest.categories.includes("education") && manifest.categories.includes("navigation"))

const icons = new Map(manifest.icons.map((icon) => [icon.src, icon]))
assert.deepEqual(icons.get("/branding/campusnav-app-icon-192.png"), {
  src: "/branding/campusnav-app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any",
})
assert.deepEqual(icons.get("/branding/campusnav-app-icon-512.png"), {
  src: "/branding/campusnav-app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any",
})
assert.deepEqual(icons.get("/branding/campusnav-app-icon-maskable-512.png"), {
  src: "/branding/campusnav-app-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable",
})
assert.deepEqual(await pngDimensions("public/branding/campusnav-app-icon-192.png"), { width: 192, height: 192 })
assert.deepEqual(await pngDimensions("public/branding/campusnav-app-icon-512.png"), { width: 512, height: 512 })
assert.deepEqual(await pngDimensions("public/branding/campusnav-app-icon-maskable-512.png"), { width: 512, height: 512 })
assert.deepEqual(await pngDimensions("public/branding/apple-touch-icon.png"), { width: 180, height: 180 })

assert.match(iconSvg, /fill="#0a0a0a"/)
assert.match(iconSvg, /fill="#fff"/)
assert.match(indexHtml, /rel="manifest" href="\/manifest\.json"/)
assert.match(indexHtml, /rel="apple-touch-icon" sizes="180x180" href="\/branding\/apple-touch-icon\.png"/)
assert.match(indexHtml, /name="apple-mobile-web-app-title" content="CampusNav"/)
assert.match(indexHtml, /name="apple-mobile-web-app-capable" content="yes"/)
assert.match(indexHtml, /name="mobile-web-app-capable" content="yes"/)
assert.ok(!manifestText.includes("campusnav-og"), "social-preview art is not reused as an app icon")

console.log("PWA manifest identity, installability metadata, and icon assets: PASS")
