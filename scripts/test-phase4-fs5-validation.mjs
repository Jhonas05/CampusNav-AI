import assert from 'node:assert/strict'
import fs from 'node:fs'
import { deflateSync } from 'node:zlib'
import { facilities } from '../src/data/facilities.js'
import { FACILITY_MEDIA_LIMITS as limits, inspectFacilityMediaBytes as inspect, validateFacilityMediaFile as validate, validateFacilityMediaDraft as draft } from '../src/services/facilityMediaValidation.js'

let count = 0
const check = async (label, run) => { await run(); console.log(`PASS ${++count}: ${label}`) }
const fail = (result, code) => { assert.equal(result.ok, false); assert.equal(result.data, null); assert.equal(result.error.code, code); assert.equal(result.availability, 'UNAVAILABLE'); assert.equal(result.error.retryable, false) }
const concat = (...buffers) => Buffer.concat(buffers.map(b => Buffer.from(b)))
const be32 = n => { const b = Buffer.alloc(4); b.writeUInt32BE(n); return b }
const le32 = n => { const b = Buffer.alloc(4); b.writeUInt32LE(n); return b }
const crc32 = b => { let c = 0xffffffff; for (const n of b) { c ^= n; for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1 } return (c ^ 0xffffffff) >>> 0 }
const chunk = (type, data = []) => { const body = concat(Buffer.from(type), data); return concat(be32(data.length), body, be32(crc32(body))) }
const signature = [137, 80, 78, 71, 13, 10, 26, 10]
const png = (width = 2, height = 3, extras = []) => concat(signature, chunk('IHDR', concat(be32(width), be32(height), [8, 2, 0, 0, 0])), ...extras, chunk('IDAT', deflateSync(Buffer.alloc(21))), chunk('IEND'))
// JPEG/WebP below are structural fixtures only. Real pixel decoding is verified
// separately with browser-generated images; injected decoders are not RLS proof.
const jpeg = (extra = []) => concat([255, 216], extra, [255, 192, 0, 11, 8, 0, 3, 0, 2, 1, 1, 0x11, 0], [255, 218, 0, 8, 1, 1, 0, 0, 63, 0, 0x11, 255, 217])
const riffChunk = (type, data) => concat(Buffer.from(type), le32(data.length), data, data.length & 1 ? [0] : [])
const webp = (...chunks) => { const body = concat(Buffer.from('WEBP'), ...chunks); return concat(Buffer.from('RIFF'), le32(body.length), body) }
const vp8 = riffChunk('VP8 ', [0x10, 0, 0, 0x9d, 1, 0x2a, 2, 0, 3, 0])
const vp8l = riffChunk('VP8L', [0x2f, 1, 0x80, 0, 0])
const vp8x = flags => riffChunk('VP8X', [flags, 0, 0, 0, 1, 0, 0, 2, 0, 0])
const basicDraft = { facilityId: 'library', altText: 'Synthetic empty room fixture — not official' }
const blob = (bytes = png(), type = 'image/png') => new Blob([bytes], { type })
const fakeDecoder = () => ({ width: 2, height: 3, close() {} })

await check('Owner envelope is immutable: JPEG/PNG/WebP, 5 MiB, bounded dimensions', () => { assert.deepEqual(limits.mimeTypes, ['image/jpeg', 'image/png', 'image/webp']); assert.equal(limits.maxBytes, 5242880); assert.ok(Object.isFrozen(limits)); assert.ok(Object.isFrozen(limits.mimeTypes)) })
for (const [mime, bytes] of [['image/png', png()], ['image/jpeg', jpeg()], ['image/webp', webp(vp8)], ['image/webp', webp(vp8l)], ['image/webp', webp(vp8x(0), vp8)]]) await check(`${mime} structural dimensions`, () => { const r = inspect(bytes, mime); assert.equal(r.ok, true); assert.equal(r.data.width, 2); assert.equal(r.data.height, 3); assert.equal(r.data.validationScope, 'STRUCTURE_ONLY') })
for (const mime of ['image/svg+xml', 'image/gif', 'image/bmp', 'application/pdf', 'application/octet-stream', '', 'image/png; charset=utf-8']) await check(`Reject declared ${mime || 'missing'} MIME`, () => fail(inspect(png(), mime), 'MEDIA_TYPE_INVALID'))
for (const bytes of [Buffer.from('<svg onload="alert(1)"/>'), Buffer.from('MZ executable'), Buffer.from('%PDF-1.7'), Buffer.from('GIF89a')]) await check('Reject spoofed executable/vector/document content', () => fail(inspect(bytes, 'image/jpeg'), 'MEDIA_TYPE_INVALID'))
await check('MIME must agree with signature', () => fail(inspect(png(), 'image/jpeg'), 'MEDIA_TYPE_INVALID'))
await check('Reject empty image', () => fail(inspect(new Uint8Array(), 'image/png'), 'MEDIA_SIZE_INVALID'))
await check('Reject image above 5 MiB before parsing', () => fail(inspect(new Uint8Array(limits.maxBytes + 1), 'image/png'), 'MEDIA_SIZE_INVALID'))
await check('The exact 5 MiB boundary is not rejected as oversized', () => assert.notEqual(inspect(new Uint8Array(limits.maxBytes), 'image/png').error.code, 'MEDIA_SIZE_INVALID'))
await check('Reject non-byte input', () => fail(inspect('PNG', 'image/png'), 'MEDIA_SIZE_INVALID'))
for (const [w, h] of [[0, 2], [2, 0], [4097, 2], [2, 4097], [4000, 4000]]) await check(`Reject unsafe ${w}x${h} dimensions before decoding`, () => fail(inspect(png(w, h), 'image/png'), 'MEDIA_DIMENSIONS_INVALID'))
await check('PNG checksum failure is rejected', () => { const p = png(); p[32] ^= 1; fail(inspect(p, 'image/png'), 'MEDIA_CONTENT_INVALID') })
await check('PNG truncated container is rejected', () => fail(inspect(png().subarray(0, -2), 'image/png'), 'MEDIA_CONTENT_INVALID'))
await check('PNG trailing bytes are rejected', () => fail(inspect(concat(png(), Buffer.from('PRIVATE')), 'image/png'), 'MEDIA_CONTENT_INVALID'))
for (const name of ['eXIf', 'tEXt', 'zTXt', 'iTXt', 'iCCP', 'zzZZ']) await check(`PNG ${name} metadata fails closed`, () => fail(inspect(png(2, 3, [chunk(name, Buffer.from('PRIVATE_GPS_CANARY'))]), 'image/png'), 'MEDIA_METADATA_REJECTED'))
await check('Animated PNG fails closed', () => fail(inspect(png(2, 3, [chunk('acTL', Buffer.alloc(8))]), 'image/png'), 'MEDIA_ANIMATION_REJECTED'))
for (const marker of [0xe1, 0xe2, 0xed, 0xfe]) await check(`JPEG private segment ${marker} rejected`, () => fail(inspect(jpeg([255, marker, 0, 4, 65, 66]), 'image/jpeg'), 'MEDIA_METADATA_REJECTED'))
await check('JPEG metadata after scan is rejected too', () => { const j = jpeg(); fail(inspect(concat(j.subarray(0, -2), [255, 0xe1, 0, 4, 65, 66], [255, 217]), 'image/jpeg'), 'MEDIA_METADATA_REJECTED') })
await check('JPEG trailing payload rejected', () => fail(inspect(concat(jpeg(), [0]), 'image/jpeg'), 'MEDIA_CONTENT_INVALID'))
await check('JPEG missing end marker rejected', () => fail(inspect(jpeg().subarray(0, -1), 'image/jpeg'), 'MEDIA_CONTENT_INVALID'))
await check('JPEG arbitrary APP0 payload rejected', () => fail(inspect(jpeg([255, 0xe0, 0, 4, 65, 66]), 'image/jpeg'), 'MEDIA_METADATA_REJECTED'))
await check('JPEG unknown/reserved segment fails closed', () => fail(inspect(jpeg([255, 0xf0, 0, 4, 65, 66]), 'image/jpeg'), 'MEDIA_METADATA_REJECTED'))
for (const type of ['EXIF', 'XMP ', 'ICCP', 'JUNK']) await check(`WebP ${type} metadata rejected`, () => fail(inspect(webp(vp8, riffChunk(type, [1, 2])), 'image/webp'), 'MEDIA_METADATA_REJECTED'))
for (const flags of [4, 8, 32]) await check(`WebP metadata flag ${flags} rejected`, () => fail(inspect(webp(vp8x(flags), vp8), 'image/webp'), 'MEDIA_METADATA_REJECTED'))
await check('WebP animated feature rejected', () => fail(inspect(webp(vp8x(2), vp8), 'image/webp'), 'MEDIA_ANIMATION_REJECTED'))
await check('WebP trailing payload rejected', () => fail(inspect(concat(webp(vp8), [0]), 'image/webp'), 'MEDIA_CONTENT_INVALID'))
await check('WebP duplicate image frames rejected', () => fail(inspect(webp(vp8, vp8), 'image/webp'), 'MEDIA_CONTENT_INVALID'))
await check('WebP nonzero padding rejected', () => { const b = webp(vp8l); b[b.length - 1] = 1; fail(inspect(b, 'image/webp'), 'MEDIA_CONTENT_INVALID') })
await check('Canonical facility required before file work', async () => fail(await validate('not-a-facility', blob()), 'MEDIA_FACILITY_INVALID'))
await check('Browser validation cannot be forged with a file-like object', async () => fail(await validate('library', { type: 'image/png', size: 1, arrayBuffer() { throw Error('PRIVATE') } }), 'MEDIA_SIZE_INVALID'))
await check('Oversized Blob is rejected before reading bytes', async () => { const f = new Blob([new Uint8Array(limits.maxBytes + 1)], { type: 'image/png' }); Object.defineProperty(f, 'arrayBuffer', { value() { throw Error('must not read') } }); fail(await validate('library', f), 'MEDIA_SIZE_INVALID') })
await check('Hostile Blob property failure is sanitized', async () => { const f = blob(); Object.defineProperty(f, 'size', { get() { throw Error('PRIVATE_SIZE_CANARY') } }); const r = await validate('library', f); fail(r, 'MEDIA_CONTENT_INVALID'); assert.doesNotMatch(JSON.stringify(r), /PRIVATE_SIZE_CANARY/) })
await check('No decoder means unavailable, never successful upload validation', async () => fail(await validate('library', blob(), { decode: null }), 'MEDIA_DECODE_UNAVAILABLE'))
await check('Injected decoder failure has sanitized errors', async () => { const r = await validate('library', blob(), { decode() { throw Error('PRIVATE_SERVICE_SECRET') } }); fail(r, 'MEDIA_CONTENT_INVALID'); assert.doesNotMatch(JSON.stringify(r), /PRIVATE/) })
await check('Successful local pixel check closes bitmap and does not authorize upload', async () => { let closed = 0; const r = await validate('library', blob(), { decode: () => ({ width: 2, height: 3, close() { closed++ } }) }); assert.equal(r.ok, true); assert.equal(r.availability, 'UNAVAILABLE'); assert.equal(r.data.validationScope, 'LOCAL_CANDIDATE_ONLY'); assert.equal(closed, 1); assert.equal('uploadUrl' in r.data, false) })
await check('Decoded/header dimension mismatch rejects and closes bitmap', async () => { let closed = 0; fail(await validate('library', blob(), { decode: () => ({ width: 3, height: 3, close() { closed++ } }) }), 'MEDIA_CONTENT_INVALID'); assert.equal(closed, 1) })
await check('Preflight rejects metadata before a decoder can run', async () => { let calls = 0; fail(await validate('library', blob(png(2, 3, [chunk('eXIf', [1])])), { decode() { calls++; return fakeDecoder() } }), 'MEDIA_METADATA_REJECTED'); assert.equal(calls, 0) })
await check('Decoder timeout fails closed and releases a late bitmap', async () => { let release, closed = 0; const pending = validate('library', blob(), { decode: () => new Promise(resolve => { release = resolve }) }); fail(await pending, 'MEDIA_DECODE_TIMEOUT'); release({ width: 2, height: 3, close() { closed++ } }); await new Promise(resolve => setTimeout(resolve, 0)); assert.equal(closed, 1) })
await check('Original filename is not read or returned as storage authority', async () => { const f = blob(); Object.defineProperty(f, 'name', { get() { throw Error('filename read') } }); assert.equal((await validate('library', f, { decode: fakeDecoder })).ok, true) })
await check('All canonical facility identities are accepted for metadata, without route inference', () => { for (const f of facilities) assert.equal(draft({ ...basicDraft, facilityId: f.id }).ok, true) })
await check('Draft stays private/pending regardless of supplied rights references', () => { const r = draft({ ...basicDraft, rightsEvidenceReference: 'DEMO-RIGHTS-1', consentEvidenceReference: 'DEMO-CONSENT-1' }); assert.equal(r.ok, true); assert.equal(r.data.publicVisibility, false); assert.equal(r.data.provenance.lifecycle, 'DRAFT'); assert.equal(r.data.provenance.verificationStatus, 'PENDING_VERIFICATION'); assert.equal(r.data.provenance.dataStatus, 'PENDING_VERIFICATION'); assert.equal(r.data.provenance.publishedAt, null) })
for (const field of ['id', 'objectPath', 'url', 'signedUrl', 'uploadedBy', 'approvedBy', 'lifecycle', 'publicVisibility', 'verificationStatus', 'dataStatus', 'geometry', 'role', 'updatedAt']) await check(`Reject forged/unknown draft field ${field}`, () => fail(draft({ ...basicDraft, [field]: 'FORGED' }), 'MEDIA_DRAFT_INVALID'))
for (const value of ['', ' ', '<img src=x onerror=alert(1)>', 'x\u0000y', 'x\u202ey', 'a'.repeat(241)]) await check('Reject missing, injected or oversized alternative text', () => fail(draft({ ...basicDraft, altText: value }), 'MEDIA_DRAFT_INVALID'))
for (const value of ['https://example.test/private', '../private', 'javascript:evil', 'x\u0000y']) await check('Rights evidence is an opaque reference, not a path/URL', () => fail(draft({ ...basicDraft, rightsEvidenceReference: value }), 'MEDIA_DRAFT_INVALID'))
for (const value of [-1, 1001, 0.5, '1']) await check('Display order must be a bounded integer', () => fail(draft({ ...basicDraft, displayOrder: value }), 'MEDIA_DRAFT_INVALID'))
await check('Draft invalid facility is explicit', () => fail(draft({ ...basicDraft, facilityId: '../library' }), 'MEDIA_FACILITY_INVALID'))
await check('Draft rejects inherited authority and symbol fields', () => { fail(draft(Object.assign(Object.create({ role: 'SUPER_ADMIN' }), basicDraft)), 'MEDIA_DRAFT_INVALID'); fail(draft({ ...basicDraft, [Symbol('published')]: true }), 'MEDIA_DRAFT_INVALID') })
await check('Draft normalization does not mutate input or create identity', () => { const input = { ...basicDraft, altText: '  Synthetic fixture  ', caption: '  Sample only  ' }; const before = JSON.stringify(input), r = draft(input); assert.equal(JSON.stringify(input), before); assert.equal(r.data.altText, 'Synthetic fixture'); assert.equal(r.data.caption, 'Sample only'); assert.equal('id' in r.data, false); assert.equal('uploadedBy' in r.data, false) })
await check('No backend/network/storage/route/status/publication implementation is introduced', () => { const source = fs.readFileSync(new URL('../src/services/facilityMediaValidation.js', import.meta.url), 'utf8'); assert.doesNotMatch(source, /\bfetch\s*\(|supabase|localStorage|sessionStorage|indexedDB|createObjectURL|calculateFacilityRoute|evaluateFacilityStatus|\.upload\s*\(|\.createSignedUrl\s*\(/); assert.match(source, /LOCAL_CANDIDATE_ONLY/) })
await check('Bounded random malformed containers fail without throwing', () => { let seed = 12345; for (let n = 0; n < 500; n++) { const b = new Uint8Array(n % 150); for (let i = 0; i < b.length; i++) { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; b[i] = seed & 255 } assert.equal(inspect(b, limits.mimeTypes[n % 3]).ok, false) } })
await check('Mutated signed containers and segment lengths never throw raw parser errors', () => { for (const [mime, original] of [['image/png', png()], ['image/jpeg', jpeg()], ['image/webp', webp(vp8)]]) for (let i = 2; i < original.length; i++) { const copy = Buffer.from(original); copy[i] ^= 255; assert.equal(typeof inspect(copy, mime).ok, 'boolean') } })
console.log(`FS-5 independent local media candidate/draft validation: ${count}/${count} PASS; storage/RLS/upload/publication are NOT implemented or verified`)
