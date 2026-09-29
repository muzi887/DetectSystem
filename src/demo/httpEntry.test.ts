import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('http entry uses the static client in production and keeps axios out of that branch', () => {
  const src = readFileSync(new URL('../utils/http.ts', import.meta.url), 'utf8')
  assert.match(src, /import\.meta\.env\.PROD/)
  assert.match(src, /createStaticHttp\(demoSnapshot\)/)
  assert.match(src, /import\('\.\/liveHttp'\)/)
  assert.equal(src.includes("baseURL: '/api'"), false)
})
