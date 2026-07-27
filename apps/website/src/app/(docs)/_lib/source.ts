import fs from 'fs'
import path from 'path'

const DEMOS_DIR = path.join(process.cwd(), 'src/app/(docs)/_demos')

function clean(source: string) {
  return source.replace(/^'use client'\n+/, '').trimEnd()
}

/**
 * Read a demo's own source off disk so the code block can never drift from the
 * component rendered right above it — the snippet a reader copies is
 * byte-for-byte the component they just interacted with.
 *
 * The `'use client'` directive is stripped because it belongs to this site's
 * routing setup, not to the example.
 */
export function readDemoSource(name: string) {
  return clean(fs.readFileSync(path.join(DEMOS_DIR, `${name}.tsx`), 'utf8'))
}

/** Read any file in the website app, relative to `apps/website`. */
export function readProjectSource(relativePath: string) {
  return clean(fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8'))
}
