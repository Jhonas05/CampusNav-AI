import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { resolveSupabaseConfig } from "../src/lib/supabaseClient.js"

const parseEnvFile = (contents) => Object.fromEntries(contents
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#") && line.includes("="))
  .map((line) => {
    const separator = line.indexOf("=")
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
  }))

export const loadCloudTestConfig = async () => {
  const projectRoot = fileURLToPath(new URL("..", import.meta.url))
  const fileEnv = parseEnvFile(await readFile(resolve(projectRoot, ".env.local"), "utf8"))
  const config = resolveSupabaseConfig({ ...fileEnv, ...process.env })
  if (!config.configured) throw new Error(`Supabase cloud test configuration is unavailable: ${config.reason}`)
  return config
}

