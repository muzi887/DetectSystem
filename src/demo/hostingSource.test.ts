import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('build copies satellite maps and hosts rewrite to index.html', () => {
  const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
    scripts: { build: string }
  }
  assert.equal(pkg.scripts.build, 'vite build && node scripts/copy-satellite-maps.mjs')
  const vercel = readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')
  const netlify = readFileSync(new URL('../../netlify.toml', import.meta.url), 'utf8')
  const redirects = readFileSync(new URL('../../public/_redirects', import.meta.url), 'utf8')
  assert.equal(vercel.includes('/index.html'), true)
  assert.equal(netlify.includes('/index.html'), true)
  assert.equal(netlify.includes('status = 200'), true)
  assert.match(redirects, /\/index\.html\s+200/)
})
