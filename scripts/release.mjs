#!/usr/bin/env node
// Cuts a release: bumps the package version, commits, tags, pushes.
//
// It does NOT publish. Pushing the tag is what publishes — .github/workflows/
// release.yml picks it up, re-runs the full test suite on a clean checkout and
// publishes from CI with provenance. Nothing is ever published from a laptop.
//
//   node scripts/release.mjs <patch|minor|major|prerelease|1.2.3> [--preid beta] [--dry-run]
//
// Starting a beta line for the next minor needs `preminor`, not `prerelease`
// (1.4.2 + prerelease = 1.4.3-beta.0, which is not the release you meant):
//
//   pnpm release:beta:first   1.4.2       -> 1.5.0-beta.0
//   pnpm release:beta         1.5.0-beta.0 -> 1.5.0-beta.1
//   pnpm release:minor        1.5.0-beta.1 -> 1.5.0
//
// Or pass the exact version when you want to name it yourself:
//   node scripts/release.mjs 1.5.0-beta.1

import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PKG_DIR = resolve(ROOT, 'packages/input-otp')
const RELEASE_BRANCH = 'master'

const run = (cmd, args, opts = {}) =>
  execFileSync(cmd, args, { cwd: ROOT, encoding: 'utf8', ...opts }).trim()

const die = msg => {
  console.error(`\n  ✗ ${msg}\n`)
  process.exit(1)
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const preidIndex = args.indexOf('--preid')
const preid = preidIndex === -1 ? null : args[preidIndex + 1]
// Skip the value that belongs to --preid, but only when --preid was passed;
// otherwise indexOf's -1 would make this swallow the first positional arg.
const preidValueIndex = preidIndex === -1 ? -1 : preidIndex + 1
const bump = args.find((a, i) => !a.startsWith('--') && i !== preidValueIndex)

if (!bump) {
  die(
    'usage: node scripts/release.mjs <patch|minor|major|prerelease|1.2.3> [--preid beta] [--dry-run]',
  )
}

// --- guards ---------------------------------------------------------------
// A release tag has to point at code that is already on origin and already
// green. Anything else and CI builds something nobody reviewed.

if (run('git', ['status', '--porcelain'])) {
  die('Working tree is dirty. Commit or stash first.')
}

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
if (branch !== RELEASE_BRANCH) {
  die(`Releases are cut from ${RELEASE_BRANCH}, but you are on ${branch}.`)
}

run('git', ['fetch', 'origin', RELEASE_BRANCH, '--tags'])
const [behind, ahead] = run('git', [
  'rev-list',
  '--left-right',
  '--count',
  `origin/${RELEASE_BRANCH}...HEAD`,
]).split(/\s+/)

if (behind !== '0')
  die(`${RELEASE_BRANCH} is ${behind} commit(s) behind origin. Pull first.`)
if (ahead !== '0') {
  die(
    `${RELEASE_BRANCH} has ${ahead} unpushed commit(s). Push them and let CI go green before tagging.`,
  )
}

// --- version --------------------------------------------------------------

const versionArgs = [
  'version',
  bump,
  '--no-git-tag-version',
  // The root package.json declares npm workspaces while the apps depend on
  // input-otp via pnpm's `workspace:*` protocol, which npm cannot parse —
  // without this flag `npm version` walks the workspace and dies with
  // EUNSUPPORTEDPROTOCOL before touching the version.
  '--workspaces=false',
  ...(preid ? ['--preid', preid] : []),
]
const revert = () =>
  run('git', ['checkout', '--', 'packages/input-otp/package.json'])

let version
try {
  version = run('npm', versionArgs, { cwd: PKG_DIR }).replace(/^v/, '')
} catch (err) {
  // npm may have written the bump before failing — leave the tree clean.
  revert()
  die(
    `npm could not apply the bump "${bump}":\n    ` +
      String(err.stderr || err.message)
        .trim()
        .replace(/^npm error /gm, '')
        .split('\n')[0],
  )
}
const tag = `v${version}`

const existingTags = run('git', ['tag', '--list', tag])
if (existingTags) {
  revert()
  die(`Tag ${tag} already exists.`)
}

// The changelog is hand-written prose, and it stays that way — but a release
// without an entry is a release nobody can read, so require it up front.
const changelog = readFileSync(resolve(ROOT, 'CHANGELOG.md'), 'utf8')
const hasEntry = new RegExp(
  `^##\\s*\\[?${version.replace(/[.\\+]/g, '\\$&')}\\]?`,
  'm',
).test(changelog)

if (!hasEntry) {
  revert()
  die(
    `CHANGELOG.md has no section for ${version}.\n` +
      `    Add one first:  ## [${version}]`,
  )
}

const npmTag = version.includes('-')
  ? version.split('-')[1].split('.')[0]
  : 'latest'

console.log(`
  ${tag}  →  npm dist-tag "${npmTag}"
  ${version.includes('-') ? 'Pre-release: `latest` is left untouched.' : 'Stable: this becomes `latest`.'}
`)

if (dryRun) {
  revert()
  console.log('  --dry-run: nothing committed, package.json restored.\n')
  process.exit(0)
}

// --- cut ------------------------------------------------------------------

run('git', ['add', 'packages/input-otp/package.json'])
run('git', ['commit', '-m', `chore(release): ${tag}`])
run('git', ['tag', '-a', tag, '-m', tag])
run('git', ['push', '--follow-tags', 'origin', RELEASE_BRANCH])

console.log(`
  Pushed ${tag}. CI is publishing:
  https://github.com/guilhermerodz/input-otp/actions/workflows/release.yml
`)
