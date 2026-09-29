import assert from 'node:assert/strict'
import { test } from 'node:test'
import { initialMonitorRegion } from '../constants/monitorRegions.ts'
import { seedStaticDemoSession } from './session.ts'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem(key: string) {
      return data.get(key) ?? null
    },
    setItem(key: string, value: string) {
      data.set(key, value)
    }
  }
}

test('production seeds one agronomist session', () => {
  const storage = memoryStorage()
  seedStaticDemoSession(true, storage)
  assert.equal(storage.getItem('token'), 'demo-static')
  assert.deepEqual(JSON.parse(storage.getItem('userInfo') || '{}'), {
    id: 1,
    name: '演示农技员',
    phone: '13800000000',
    role: 'agronomist'
  })
  storage.setItem('token', 'keep-me')
  seedStaticDemoSession(true, storage)
  assert.equal(storage.getItem('token'), 'keep-me')
})

test('development does not seed a session', () => {
  const storage = memoryStorage()
  seedStaticDemoSession(false, storage)
  assert.equal(storage.getItem('token'), null)
})

test('production opens on the Jing-Jin-Ji region', () => {
  assert.equal(initialMonitorRegion(true), 'jjj')
  assert.equal(initialMonitorRegion(false), 'northeast')
})
