import assert from 'node:assert/strict'
import { test } from 'node:test'
import { droughtIndex } from './droughtIndex.ts'

test('dry soil raises index', () => {
  assert.equal(droughtIndex(15, 0), 20)
  assert.equal(droughtIndex(0, 20), 100)
})
