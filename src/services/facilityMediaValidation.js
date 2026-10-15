import { getFacilityById } from "../data/facilities.js"
import { createFacilityResult, FACILITY_AVAILABILITY, normalizeFacilityProvenance } from "../data/facilityContracts.js"

// Local candidate preflight only. Nothing here authorizes storage or publication.
export const FACILITY_MEDIA_LIMITS = Object.freeze({
  maxBytes: 5 * 1024 * 1024,
  maxDimension: 4096,
  maxPixels: 12_000_000,
  decodeTimeoutMs: 5000,
  mimeTypes: Object.freeze(["image/jpeg", "image/png", "image/webp"]),
})

const messages = Object.freeze({
  MEDIA_FACILITY_INVALID: "Select an existing canonical facility.",
  MEDIA_TYPE_INVALID: "Choose a JPEG, PNG or WebP image.",
  MEDIA_SIZE_INVALID: "Choose a non-empty image no larger than 5 MiB.",
  MEDIA_CONTENT_INVALID: "The image content is invalid or unsupported.",
  MEDIA_METADATA_REJECTED: "This image contains unsupported embedded metadata. Prepare a reviewed metadata-free copy.",
  MEDIA_ANIMATION_REJECTED: "Animated images are not supported.",
  MEDIA_DIMENSIONS_INVALID: "Images must fit within 4096 pixels per side and 12 million pixels.",
  MEDIA_DECODE_UNAVAILABLE: "Image validation is unavailable in this environment.",
  MEDIA_DECODE_TIMEOUT: "Image validation timed out. Try a smaller image.",
  MEDIA_DRAFT_INVALID: "Check the facility, alternative text and media metadata.",
})
const reject = (code) => { throw Object.assign(new Error(messages[code]), { code }) }
const failure = (code) => createFacilityResult({ ok: false, availability: FACILITY_AVAILABILITY.UNAVAILABLE, data: null, error: { code, message: messages[code], retryable: false } })
const success = (data) => createFacilityResult({ ok: true, availability: FACILITY_AVAILABILITY.UNAVAILABLE, data, error: null })
const dimensions = (width, height) => {
  if (![width, height].every((n) => Number.isInteger(n) && n > 0 && n <= FACILITY_MEDIA_LIMITS.maxDimension)
    || width * height > FACILITY_MEDIA_LIMITS.maxPixels) reject("MEDIA_DIMENSIONS_INVALID")
  return { width, height }
}
const ascii = (bytes, start, length) => String.fromCharCode(...bytes.subarray(start, start + length))
const u16 = (b, i) => b[i] * 256 + b[i + 1]
const u32 = (b, i) => b[i] * 0x1000000 + b[i + 1] * 0x10000 + b[i + 2] * 256 + b[i + 3]
const le32 = (b, i) => b[i] + b[i + 1] * 256 + b[i + 2] * 0x10000 + b[i + 3] * 0x1000000
const le24 = (b, i) => b[i] + b[i + 1] * 256 + b[i + 2] * 0x10000
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1
  return n >>> 0
})
const crc32 = (bytes, start, end) => {
  let value = 0xffffffff
  for (let i = start; i < end; i++) value = crcTable[(value ^ bytes[i]) & 255] ^ (value >>> 8)
  return (value ^ 0xffffffff) >>> 0
}

const inspectPng = (bytes) => {
  let offset = 8, size = null, imageData = false, imageDataEnded = false
  const allowed = new Set(["IHDR", "PLTE", "IDAT", "IEND", "tRNS", "gAMA", "cHRM", "sRGB", "pHYs"])
  while (offset < bytes.length) {
    if (offset + 12 > bytes.length) reject("MEDIA_CONTENT_INVALID")
    const length = u32(bytes, offset), type = ascii(bytes, offset + 4, 4), end = offset + 8 + length
    if (end + 4 > bytes.length || crc32(bytes, offset + 4, end) !== u32(bytes, end)) reject("MEDIA_CONTENT_INVALID")
    if (["acTL", "fcTL", "fdAT"].includes(type)) reject("MEDIA_ANIMATION_REJECTED")
    if (!allowed.has(type)) reject("MEDIA_METADATA_REJECTED")
    if (offset === 8 && (type !== "IHDR" || length !== 13)) reject("MEDIA_CONTENT_INVALID")
    if (type === "IHDR") {
      if (size || offset !== 8 || length !== 13) reject("MEDIA_CONTENT_INVALID")
      size = dimensions(u32(bytes, offset + 8), u32(bytes, offset + 12))
    }
    if (type === "IDAT") {
      if (imageDataEnded) reject("MEDIA_CONTENT_INVALID")
      imageData = true
    } else if (imageData) imageDataEnded = true
    if (type === "IEND") {
      if (length !== 0 || end + 4 !== bytes.length || !size || !imageData) reject("MEDIA_CONTENT_INVALID")
      return size
    }
    offset = end + 4
  }
  reject("MEDIA_CONTENT_INVALID")
}

const inspectJpeg = (bytes) => {
  let offset = 2, size = null, scan = false, sawScan = false
  while (offset < bytes.length) {
    if (scan) {
      while (offset < bytes.length && bytes[offset] !== 255) offset++
      if (offset + 1 >= bytes.length) reject("MEDIA_CONTENT_INVALID")
      if (bytes[offset + 1] === 0 || (bytes[offset + 1] >= 0xd0 && bytes[offset + 1] <= 0xd7)) { offset += 2; continue }
    }
    if (bytes[offset++] !== 255) reject("MEDIA_CONTENT_INVALID")
    while (bytes[offset] === 255) offset++
    const marker = bytes[offset++]
    if (marker === 0xd9) {
      if (!size || !sawScan || offset !== bytes.length) reject("MEDIA_CONTENT_INVALID")
      return size
    }
    if (marker === 0 || marker === 0xd8 || marker === 1 || (marker >= 0xd0 && marker <= 0xd7) || offset + 2 > bytes.length) reject("MEDIA_CONTENT_INVALID")
    const length = u16(bytes, offset), end = offset + length
    if (length < 2 || end > bytes.length) reject("MEDIA_CONTENT_INVALID")
    // EXIF/XMP/IPTC/comments/unknown application data are rejected, not stripped.
    if ((marker >= 0xe1 && marker <= 0xef) || marker === 0xfe) reject("MEDIA_METADATA_REJECTED")
    if (![0xc0, 0xc1, 0xc2, 0xc4, 0xdb, 0xdd, 0xda, 0xe0].includes(marker)) reject("MEDIA_METADATA_REJECTED")
    if (marker === 0xe0 && (length !== 16 || ascii(bytes, offset + 2, 5) !== "JFIF\0")) reject("MEDIA_METADATA_REJECTED")
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      if (size || length < 8) reject("MEDIA_CONTENT_INVALID")
      size = dimensions(u16(bytes, offset + 5), u16(bytes, offset + 3))
    }
    if (marker === 0xda) { if (!size) reject("MEDIA_CONTENT_INVALID"); scan = true; sawScan = true }
    else scan = false
    offset = end
  }
  reject("MEDIA_CONTENT_INVALID")
}

const inspectWebp = (bytes) => {
  if (bytes.length < 20 || le32(bytes, 4) + 8 !== bytes.length) reject("MEDIA_CONTENT_INVALID")
  let offset = 12, extended = null, size = null, alpha = false
  while (offset < bytes.length) {
    if (offset + 8 > bytes.length) reject("MEDIA_CONTENT_INVALID")
    const type = ascii(bytes, offset, 4), length = le32(bytes, offset + 4), start = offset + 8, end = start + length
    if (!length || end + (length & 1) > bytes.length || ((length & 1) && bytes[end] !== 0)) reject("MEDIA_CONTENT_INVALID")
    if (["ANIM", "ANMF"].includes(type)) reject("MEDIA_ANIMATION_REJECTED")
    if (["EXIF", "XMP ", "ICCP"].includes(type)) reject("MEDIA_METADATA_REJECTED")
    if (type === "VP8X") {
      if (offset !== 12 || length !== 10 || extended || size) reject("MEDIA_CONTENT_INVALID")
      if (bytes[start] & 2) reject("MEDIA_ANIMATION_REJECTED")
      if (bytes[start] & 0x2c) reject("MEDIA_METADATA_REJECTED")
      if ((bytes[start] & ~0x10) || bytes[start + 1] || bytes[start + 2] || bytes[start + 3]) reject("MEDIA_CONTENT_INVALID")
      extended = dimensions(le24(bytes, start + 4) + 1, le24(bytes, start + 7) + 1)
    } else if (type === "ALPH") {
      if (!extended || size || alpha) reject("MEDIA_CONTENT_INVALID")
      alpha = true
    } else if (type === "VP8 " || type === "VP8L") {
      if (size) reject("MEDIA_CONTENT_INVALID")
      if (type === "VP8 ") {
        if (length < 10 || (bytes[start] & 1) || ascii(bytes, start + 3, 3) !== "\x9d\x01\x2a") reject("MEDIA_CONTENT_INVALID")
        size = dimensions((bytes[start + 6] + bytes[start + 7] * 256) & 0x3fff, (bytes[start + 8] + bytes[start + 9] * 256) & 0x3fff)
      } else {
        if (length < 5 || bytes[start] !== 0x2f || (bytes[start + 4] & 0xe0) || alpha) reject("MEDIA_CONTENT_INVALID")
        const packed = le32(bytes, start + 1)
        size = dimensions((packed & 0x3fff) + 1, ((packed >>> 14) & 0x3fff) + 1)
      }
    } else reject("MEDIA_METADATA_REJECTED")
    offset = end + (length & 1)
  }
  if (!size || (extended && (size.width !== extended.width || size.height !== extended.height))) reject("MEDIA_CONTENT_INVALID")
  return size
}

/** Bounded structural preflight; a success is NOT proof that pixels decode. */
export const inspectFacilityMediaBytes = (bytes, mimeType) => {
  try {
    if (!(bytes instanceof Uint8Array) || !bytes.length || bytes.length > FACILITY_MEDIA_LIMITS.maxBytes) reject("MEDIA_SIZE_INVALID")
    if (!FACILITY_MEDIA_LIMITS.mimeTypes.includes(mimeType)) reject("MEDIA_TYPE_INVALID")
    let actual = null, size
    if ([137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)) actual = "image/png"
    else if (bytes[0] === 255 && bytes[1] === 0xd8) actual = "image/jpeg"
    else if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") actual = "image/webp"
    if (actual !== mimeType) reject("MEDIA_TYPE_INVALID")
    if (actual === "image/png") size = inspectPng(bytes)
    else if (actual === "image/jpeg") size = inspectJpeg(bytes)
    else size = inspectWebp(bytes)
    return success({ mimeType: actual, byteSize: bytes.length, ...size, validationScope: "STRUCTURE_ONLY" })
  } catch (error) { return failure(Object.hasOwn(messages, error?.code) ? error.code : "MEDIA_CONTENT_INVALID") }
}

const closeBitmap = (bitmap) => { try { bitmap?.close?.() } catch { /* Cleanup cannot expose decoder internals. */ } }

/** Local browser validation only. The future trusted server must independently
 * decode/sanitize, authorize, reserve storage identity, audit and verify rights. */
export const validateFacilityMediaFile = async (facilityId, file, { decode = globalThis.createImageBitmap } = {}) => {
  if (typeof facilityId !== "string" || !getFacilityById(facilityId)) return failure("MEDIA_FACILITY_INVALID")
  let bitmap, timer, abandoned = false
  try {
    if (!(file instanceof Blob) || !file.size || file.size > FACILITY_MEDIA_LIMITS.maxBytes) return failure("MEDIA_SIZE_INVALID")
    const checked = inspectFacilityMediaBytes(new Uint8Array(await file.arrayBuffer()), file.type)
    if (!checked.ok) return checked
    if (typeof decode !== "function") return failure("MEDIA_DECODE_UNAVAILABLE")
    const pending = Promise.resolve().then(() => decode(file)).then((decoded) => { if (abandoned) closeBitmap(decoded); return decoded })
    bitmap = await Promise.race([pending, new Promise((_, rejectTimeout) => {
      timer = setTimeout(() => rejectTimeout(Object.assign(new Error(), { code: "MEDIA_DECODE_TIMEOUT" })), FACILITY_MEDIA_LIMITS.decodeTimeoutMs)
    })])
    const decoded = dimensions(bitmap?.width, bitmap?.height)
    if (decoded.width !== checked.data.width || decoded.height !== checked.data.height) reject("MEDIA_CONTENT_INVALID")
    return success({ ...checked.data, validationScope: "LOCAL_CANDIDATE_ONLY" })
  } catch (error) { return failure(error?.code === "MEDIA_DECODE_TIMEOUT" ? error.code : "MEDIA_CONTENT_INVALID") }
  finally { abandoned = true; clearTimeout(timer); closeBitmap(bitmap) }
}

const draftFields = new Set(["facilityId", "altText", "caption", "displayOrder", "sourceReference", "sourceLabel", "rightsEvidenceReference", "consentEvidenceReference"])
const plainText = (value, maximum, required = false) => {
  if ((value === undefined || value === null) && !required) return null
  if (typeof value !== "string") reject("MEDIA_DRAFT_INVALID")
  const text = value.trim()
  if ((required && !text) || text.length > maximum || /[<>\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/u.test(text)) reject("MEDIA_DRAFT_INVALID")
  return text || null
}
const evidenceReference = (value) => {
  const text = plainText(value, 160)
  if (text && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(text)) reject("MEDIA_DRAFT_INVALID")
  return text
}

/** Validates an input DTO, not a stored record or an approval. Client actor IDs,
 * storage URLs, lifecycle/publication flags and verified states are forbidden. */
export const validateFacilityMediaDraft = (input) => {
  try {
    if (!input || ![Object.prototype, null].includes(Object.getPrototypeOf(input)) || Reflect.ownKeys(input).some((key) => typeof key !== "string" || !draftFields.has(key))) reject("MEDIA_DRAFT_INVALID")
    if (typeof input.facilityId !== "string" || !getFacilityById(input.facilityId)) return failure("MEDIA_FACILITY_INVALID")
    const order = input.displayOrder ?? 0
    if (!Number.isInteger(order) || order < 0 || order > 1000) reject("MEDIA_DRAFT_INVALID")
    return success({
      facilityId: input.facilityId, altText: plainText(input.altText, 240, true), caption: plainText(input.caption, 500), displayOrder: order,
      rightsEvidenceReference: evidenceReference(input.rightsEvidenceReference), consentEvidenceReference: evidenceReference(input.consentEvidenceReference),
      publicVisibility: false,
      provenance: normalizeFacilityProvenance({ lifecycle: "DRAFT", verification_status: "PENDING_VERIFICATION", data_status: "PENDING_VERIFICATION", source_type: "ADMIN_INPUT", source_id: evidenceReference(input.sourceReference), source_label: plainText(input.sourceLabel, 160) }),
    })
  } catch { return failure("MEDIA_DRAFT_INVALID") }
}
