import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import { DEFAULT_THEME_PREFERENCE, normalizeThemePreference, readStoredThemePreference, resolveTheme, THEME_COLOR, THEME_PREFERENCES, THEME_STORAGE_KEY, writeStoredThemePreference } from "../src/lib/theme.js"

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

// Preference rules
assert.equal(THEME_STORAGE_KEY, "campusnav-theme")
assert.deepEqual([...THEME_PREFERENCES], ["light", "dark", "system"])
assert.equal(DEFAULT_THEME_PREFERENCE, "system")
for (const invalid of [null, undefined, "", "DARK", "auto", 1, {}]) assert.equal(normalizeThemePreference(invalid), "system")
assert.equal(resolveTheme("light", true), "light")
assert.equal(resolveTheme("dark", false), "dark")
assert.equal(resolveTheme("system", true), "dark")
assert.equal(resolveTheme("system", false), "light")
assert.equal(resolveTheme("garbage", true), "dark")

// Persistence, including unavailable storage
const memory = new Map()
const storage = { getItem: (key) => (memory.has(key) ? memory.get(key) : null), setItem: (key, value) => memory.set(key, value) }
assert.equal(readStoredThemePreference(storage), "system")
assert.equal(writeStoredThemePreference(storage, "dark"), true)
assert.equal(memory.get("campusnav-theme"), "dark")
assert.equal(readStoredThemePreference(storage), "dark")
writeStoredThemePreference(storage, "nonsense")
assert.equal(readStoredThemePreference(storage), "system")
const broken = { getItem: () => { throw new Error("blocked") }, setItem: () => { throw new Error("blocked") } }
assert.equal(readStoredThemePreference(broken), "system")
assert.equal(writeStoredThemePreference(broken, "dark"), false)
assert.equal(readStoredThemePreference(undefined), "system")

// The pre-paint script and the token sheet stay in step with the helpers.
const [indexHtml, css, tailwind] = await Promise.all([readProjectFile("index.html"), readProjectFile("src/index.css"), readProjectFile("tailwind.config.js")])
assert.match(indexHtml, /localStorage\.getItem\("campusnav-theme"\)/)
assert.match(indexHtml, /prefers-color-scheme: dark/)
assert.match(indexHtml, /classList\.add\("dark"\)/)
assert.ok(indexHtml.indexOf("campusnav-theme") < indexHtml.indexOf("/src/main.jsx"), "theme is applied before the app bundle loads")
assert.ok(indexHtml.includes(THEME_COLOR.dark) && indexHtml.includes(THEME_COLOR.light))

const rootBlock = css.slice(css.indexOf(":root {"), css.indexOf(".dark {"))
const darkBlock = css.slice(css.indexOf(".dark {"), css.indexOf("@layer base {", css.indexOf(".dark {")))
const TOKENS = ["canvas", "canvas-raised", "surface", "subtle", "fill", "fill-strong", "line", "line-strong", "ink", "ink-strong", "ink-mid", "ink-soft", "ink-faint", "ink-ghost", "on-ink"]
for (const token of TOKENS) {
  const pattern = new RegExp(`--${token}: \\d+ \\d+ \\d+;`)
  assert.match(rootBlock, pattern, `light token --${token}`)
  assert.match(darkBlock, pattern, `dark token --${token}`)
  assert.ok(tailwind.includes(`rgb(var(--${token}) / <alpha-value>)`), `tailwind maps --${token}`)
}
assert.match(css, /prefers-reduced-motion: reduce/)
assert.match(css, /html\.motion-ok \.motion-reveal/)

// Application chrome must not reintroduce hard-coded palette classes.
const { readdir } = await import("node:fs/promises")
const walk = async (dir) => (await Promise.all((await readdir(new URL(dir, import.meta.url), { withFileTypes: true })).map((entry) => entry.isDirectory() ? walk(`${dir}${entry.name}/`) : [`${dir}${entry.name}`]))).flat()
const sources = (await walk("../src/")).filter((file) => /\.(jsx|js)$/.test(file) && !/\/components\/ui\/|\/data\/|\/providers\/|\/services\//.test(file))
const offenders = []
for (const file of sources) {
  const text = await readFile(new URL(file, import.meta.url), "utf8")
  const matches = text.match(/(?:bg|text|border|ring)-\[#[0-9A-Fa-f]{3,8}\]/g)
  if (matches) offenders.push(`${file}: ${[...new Set(matches)].join(", ")}`)
}
assert.deepEqual(offenders, [], "components use semantic theme tokens instead of hex color classes")

console.log("Theme preference, persistence, pre-paint script, light/dark token parity, and semantic-token usage: PASS")
