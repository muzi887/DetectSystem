import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

test('app layout renders the shared demo footer', () => {
  const layout = readFileSync(new URL('../layouts/AppLayout.vue', import.meta.url), 'utf8')
  const footer = readFileSync(new URL('../components/SiteDemoFooter.vue', import.meta.url), 'utf8')
  assert.equal(layout.includes('SiteDemoFooter'), true)
  assert.equal(footer.includes('FOOTER_DISCLAIMER'), true)
})
