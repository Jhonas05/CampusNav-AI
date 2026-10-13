import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { inflateSync } from "node:zlib"

const root = new URL("../", import.meta.url)
const readText = (path) => readFile(new URL(path, root), "utf8")

const paeth = (left, above, upperLeft) => {
  const estimate = left + above - upperLeft
  const leftDistance = Math.abs(estimate - left)
  const aboveDistance = Math.abs(estimate - above)
  const upperLeftDistance = Math.abs(estimate - upperLeft)
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left
  return aboveDistance <= upperLeftDistance ? above : upperLeft
}

const readPng = async (path) => {
  const bytes = await readFile(new URL(path, root))
  assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], `${path} is a PNG`)
  assert.ok(bytes.length > 10_000, `${path} contains nonempty detailed image data`)

  let offset = 8
  let header = null
  const compressed = []
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset)
    const type = bytes.toString("ascii", offset + 4, offset + 8)
    const data = bytes.subarray(offset + 8, offset + 8 + length)
    if (type === "IHDR") {
      header = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data[8],
        colorType: data[9],
        interlace: data[12],
      }
    }
    if (type === "IDAT") compressed.push(data)
    offset += length + 12
  }

  assert.ok(header, `${path} has an IHDR chunk`)
  assert.equal(header.bitDepth, 8, `${path} uses 8-bit channels`)
  assert.equal(header.colorType, 2, `${path} is opaque RGB without launcher-edge transparency`)
  assert.equal(header.interlace, 0, `${path} uses deterministic non-interlaced scanlines`)

  const channels = 3
  const rowLength = header.width * channels
  const inflated = inflateSync(Buffer.concat(compressed))
  const pixels = Buffer.alloc(header.width * header.height * channels)
  let sourceOffset = 0
  for (let y = 0; y < header.height; y += 1) {
    const filter = inflated[sourceOffset]
    sourceOffset += 1
    const targetOffset = y * rowLength
    for (let x = 0; x < rowLength; x += 1) {
      const raw = inflated[sourceOffset + x]
      const left = x >= channels ? pixels[targetOffset + x - channels] : 0
      const above = y > 0 ? pixels[targetOffset - rowLength + x] : 0
      const upperLeft = y > 0 && x >= channels ? pixels[targetOffset - rowLength + x - channels] : 0
      const predictor = filter === 0 ? 0
        : filter === 1 ? left
          : filter === 2 ? above
            : filter === 3 ? Math.floor((left + above) / 2)
              : filter === 4 ? paeth(left, above, upperLeft)
                : Number.NaN
      assert.ok(Number.isFinite(predictor), `${path} uses a supported PNG filter`)
      pixels[targetOffset + x] = (raw + predictor) & 0xff
    }
    sourceOffset += rowLength
  }

  return {
    ...header,
    pixels,
    pixelAt(x, y) {
      const pixelOffset = (y * header.width + x) * channels
      return [...pixels.subarray(pixelOffset, pixelOffset + channels)]
    },
  }
}

const nonWhiteBounds = (image, threshold = 245) => {
  let minX = image.width
  let minY = image.height
  let maxX = -1
  let maxY = -1
  let count = 0
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      if (image.pixelAt(x, y).some((channel) => channel < threshold)) {
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
        count += 1
      }
    }
  }
  return { minX, minY, maxX, maxY, count }
}

const [manifestText, indexHtml, icon192, icon512, maskable512, appleTouch] = await Promise.all([
  readText("public/manifest.json"),
  readText("index.html"),
  readPng("public/branding/campusnav-app-icon-192.png"),
  readPng("public/branding/campusnav-app-icon-512.png"),
  readPng("public/branding/campusnav-app-icon-maskable-512.png"),
  readPng("public/branding/apple-touch-icon.png"),
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
assert.equal(manifest.icons.length, 3, "manifest contains exactly the approved PNG icon set")
assert.deepEqual(icons.get("/branding/campusnav-app-icon-192.png"), {
  src: "/branding/campusnav-app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any",
})
assert.deepEqual(icons.get("/branding/campusnav-app-icon-512.png"), {
  src: "/branding/campusnav-app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any",
})
assert.deepEqual(icons.get("/branding/campusnav-app-icon-maskable-512.png"), {
  src: "/branding/campusnav-app-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable",
})
assert.deepEqual({ width: icon192.width, height: icon192.height }, { width: 192, height: 192 })
assert.deepEqual({ width: icon512.width, height: icon512.height }, { width: 512, height: 512 })
assert.deepEqual({ width: maskable512.width, height: maskable512.height }, { width: 512, height: 512 })
assert.deepEqual({ width: appleTouch.width, height: appleTouch.height }, { width: 180, height: 180 })

const standardBounds = nonWhiteBounds(icon512)
assert.ok(standardBounds.count > icon512.width * icon512.height * 0.35, "standard icon retains detailed campus artwork")

const maskableBounds = nonWhiteBounds(maskable512)
assert.ok(maskableBounds.count > maskable512.width * maskable512.height * 0.2, "maskable icon retains visible campus artwork")
assert.ok(maskableBounds.minX >= 60 && maskableBounds.minY >= 60, "maskable artwork has a safe-zone inset")
assert.ok(maskableBounds.maxX <= 451 && maskableBounds.maxY <= 451, "maskable artwork stays inside the safe-zone inset")
for (const [x, y] of [[0, 0], [511, 0], [0, 511], [511, 511]]) {
  assert.deepEqual(maskable512.pixelAt(x, y), [255, 255, 255], "maskable icon has an intentional solid background")
}

assert.match(indexHtml, /rel="manifest" href="\/manifest\.json"/)
assert.match(indexHtml, /rel="icon" type="image\/png" sizes="192x192" href="\/branding\/campusnav-app-icon-192\.png"/)
assert.match(indexHtml, /rel="apple-touch-icon" sizes="180x180" href="\/branding\/apple-touch-icon\.png"/)
assert.match(indexHtml, /name="apple-mobile-web-app-title" content="CampusNav"/)
assert.match(indexHtml, /name="apple-mobile-web-app-capable" content="yes"/)
assert.match(indexHtml, /name="mobile-web-app-capable" content="yes"/)
assert.ok(!manifestText.includes(".svg"), "manifest does not reference an approximate vector replacement")
assert.ok(!indexHtml.includes("campusnav-app-icon.svg"), "HTML does not reference the retired vector icon")
assert.ok(!manifestText.includes("campusnav-og"), "social-preview art is not reused as an app icon")
assert.match(indexHtml, /branding\/campusnav-og\.png/, "owner-approved social preview remains unchanged")

console.log("PWA manifest identity, approved raster icons, maskable safe zone, and iOS metadata: PASS")
