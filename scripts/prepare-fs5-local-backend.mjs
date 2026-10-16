import fs from 'node:fs'
import path from 'node:path'
import { randomUUID, createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MARKER = 'campusnav-fs5-local-sandbox-v1'
export const FS5_LOCAL_PORTS = Object.freeze({ api: 55321, db: 55322, shadow: 55320 })
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const fail = message => { throw new Error(message) }
const inside = (parent, child) => { const relative = path.relative(parent, child); return !relative || (!relative.startsWith('..' + path.sep) && relative !== '..' && !path.isAbsolute(relative)) }
const regular = file => {
  const stat = fs.lstatSync(file)
  if (!stat.isFile() || stat.isSymbolicLink()) fail('Expected a regular source/snapshot file.')
  return fs.readFileSync(file)
}
const externalDirectory = value => {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\u0000-\u001f]/u.test(value) || /^[\\/]{2}/.test(value)) fail('Supply an absolute existing local directory, not a network share.')
  const resolved = fs.realpathSync(value)
  if (/^[\\/]{2}/.test(resolved) || !fs.statSync(resolved).isDirectory() || resolved === path.parse(resolved).root || inside(ROOT, resolved)) fail('Use an external non-root local directory, not the repository.')
  for (let current = resolved; ; current = path.dirname(current)) {
    if (fs.existsSync(path.join(current, '.git'))) fail('A sandbox must not be prepared inside any Git workspace.')
    if (current === path.dirname(current)) break
  }
  return resolved
}
const sourceFiles = () => {
  const migrations = fs.readdirSync(path.join(ROOT, 'supabase/migrations')).filter(name => name.endsWith('.sql')).sort()
  if (migrations.some(name => !/^\d{14}_[a-z0-9_]+\.sql$/.test(name))) fail('Unrecognized canonical migration name; review before preparation.')
  const tests = fs.readdirSync(path.join(ROOT, 'supabase/tests')).filter(name => name.endsWith('_test.sql')).sort()
  if (!migrations.length || !tests.length) fail('Canonical migration/security-test inventory is unavailable.')
  for (const name of tests) {
    const sql = regular(path.join(ROOT, 'supabase/tests', name)).toString('utf8').trim()
    if (!/^begin;/i.test(sql) || !/rollback;$/i.test(sql) || !/select\s+(?:no_plan|plan)\(/i.test(sql) || !/select\s+\*\s+from\s+finish\(\);/i.test(sql)) fail('Security suite is not recognized as rollback-only pgTAP.')
  }
  return [...migrations.map(name => 'supabase/migrations/' + name), ...tests.map(name => 'supabase/tests/' + name)]
}
const configuration = projectId => `# File-only disposable FS-5 development configuration. No remote project link.
project_id = "${projectId}"
[api]
enabled = true
port = 55321
schemas = ["public", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000
[db]
port = 55322
shadow_port = 55320
major_version = 17
[db.migrations]
enabled = true
schema_paths = []
[db.seed]
enabled = false
sql_paths = []
[db.pooler]
enabled = false
[studio]
enabled = false
[inbucket]
enabled = false
[realtime]
enabled = false
[storage]
enabled = true
file_size_limit = "5MiB"
[auth]
enabled = true
site_url = "http://127.0.0.1:5173"
additional_redirect_urls = []
enable_signup = false
[analytics]
enabled = false
[edge_runtime]
enabled = false
`

/** Creates only a fresh external file snapshot. Never executes a CLI, opens a
 * connection, imports environment credentials, starts services or applies SQL. */
export const prepareFs5LocalBackend = parentDirectory => {
  const parent = externalDirectory(parentDirectory)
  const files = sourceFiles().map(relative => ({ relative, bytes: regular(path.join(ROOT, relative)) }))
  const projectId = 'campusnav_fs5_' + randomUUID().replaceAll('-', '').slice(0, 12)
  const directory = fs.mkdtempSync(path.join(parent, 'campusnav-fs5-'))
  const write = (relative, bytes) => {
    const destination = path.join(directory, relative)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.writeFileSync(destination, bytes, { flag: 'wx' })
  }
  // On failure preserve this new directory for inspection; never delete a caller path.
  for (const { relative, bytes } of files) write(relative, bytes)
  write('supabase/config.toml', configuration(projectId))
  const manifest = {
    kind: MARKER, directory, projectId, network: projectId + '_loopback', cliVersion: '2.79.0',
    status: 'FILES_PREPARED_BACKEND_NOT_STARTED', ports: FS5_LOCAL_PORTS,
    configSha256: digest(configuration(projectId)),
    files: Object.fromEntries(files.map(({ relative, bytes }) => [relative, digest(bytes)])),
    excluded: ['seed.sql', '.temp', '.branches', '.env files', 'non-pgTAP Realtime setup/cleanup and fixture-audit scripts'],
  }
  write('fs5-sandbox.json', JSON.stringify(manifest, null, 2) + '\n')
  return manifest
}

/** Checks snapshot identity/content, not database/storage health or RLS. */
export const inspectFs5LocalBackend = directory => {
  const resolved = externalDirectory(directory)
  if (!fs.lstatSync(directory).isDirectory() || fs.lstatSync(directory).isSymbolicLink()) fail('Sandbox directory must not be a symbolic link.')
  const manifest = JSON.parse(regular(path.join(resolved, 'fs5-sandbox.json')).toString('utf8'))
  if (manifest.kind !== MARKER || manifest.directory !== resolved || !/^campusnav_fs5_[a-f0-9]{12}$/.test(manifest.projectId)
    || manifest.network !== manifest.projectId + '_loopback' || manifest.cliVersion !== '2.79.0'
    || manifest.status !== 'FILES_PREPARED_BACKEND_NOT_STARTED' || JSON.stringify(manifest.ports) !== JSON.stringify(FS5_LOCAL_PORTS)) fail('Sandbox identity/target contract mismatch.')
  if (JSON.stringify(Object.keys(manifest.files || {}).sort()) !== JSON.stringify(sourceFiles().sort())) fail('Snapshot inventory differs from the canonical source.')
  for (const relative of ['supabase', 'supabase/migrations', 'supabase/tests']) {
    const stat = fs.lstatSync(path.join(resolved, relative))
    if (!stat.isDirectory() || stat.isSymbolicLink()) fail('Snapshot directories must not be symbolic links.')
  }
  const config = regular(path.join(resolved, 'supabase/config.toml'))
  if (config.toString('utf8') !== configuration(manifest.projectId) || digest(config) !== manifest.configSha256) fail('Local configuration changed; review before use.')
  for (const [relative, expected] of Object.entries(manifest.files)) {
    if (digest(regular(path.join(resolved, relative))) !== expected || digest(regular(path.join(ROOT, relative))) !== expected) fail('Canonical migration/test snapshot changed or became stale.')
  }
  const expectedEntries = new Set(['supabase', 'fs5-sandbox.json'])
  if (fs.readdirSync(resolved).some(name => !expectedEntries.has(name))) fail('Unexpected sandbox root content; inspect without deleting it.')
  const supabaseEntries = new Set(['config.toml', 'migrations', 'tests'])
  if (fs.readdirSync(path.join(resolved, 'supabase')).some(name => !supabaseEntries.has(name))) fail('Sandbox has runtime/link/seed state; do not treat it as a fresh snapshot.')
  for (const folder of ['migrations', 'tests']) {
    const expected = Object.keys(manifest.files).filter(name => name.startsWith('supabase/' + folder + '/')).map(name => path.basename(name)).sort()
    if (JSON.stringify(fs.readdirSync(path.join(resolved, 'supabase', folder)).sort()) !== JSON.stringify(expected)) fail('Unexpected migration/test files in snapshot.')
  }
  return { ...manifest, snapshotVerification: 'PASS_FILE_SNAPSHOT_ONLY', backendVerification: 'NOT_EXECUTED' }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [mode, directory, ...extra] = process.argv.slice(2)
  try {
    if (mode === '--help' && !directory) console.log('Usage: node scripts/prepare-fs5-local-backend.mjs --parent <absolute-existing-external-directory> | --inspect <fresh-sandbox-directory>\nFile preparation/inspection only; does not start Docker/Supabase, connect, apply SQL or certify backend security.')
    else if (extra.length || !directory || !['--parent', '--inspect'].includes(mode)) fail('Use --help for explicit file-only preparation/inspection options.')
    else console.log(JSON.stringify(mode === '--parent' ? prepareFs5LocalBackend(directory) : inspectFs5LocalBackend(directory), null, 2))
  } catch { console.error('FS-5 sandbox preparation/inspection failed. No backend operation was attempted; preserve any new snapshot and inspect the path/configuration.'); process.exitCode = 1 }
}
