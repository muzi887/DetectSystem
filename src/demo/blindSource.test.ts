import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const forbidden = [
  ['www.', 'dizhongkeji', '.cn'].join(''),
  ['82.157', '.234', '.123'].join(''),
  ['河北', '地质', '大学'].join(''),
  ['坤灵智巡', '创工队'].join(''),
  ['信息', '工程学院'].join(''),
  ['hgu', '.edu', '.cn'].join(''),
  ['kunling', '-smart'].join(''),
  ['指导', '教师'].join(''),
  ['刘兴', '冉'].join(''),
  ['孙丞', '淼'].join(''),
  ['中国', '科学院'].join(''),
  ['西北', '农林'].join('')
]

test('index, about page, and README do not name the school, advisors, or retired hosts', () => {
  const files = ['../../index.html', '../views/user/About.vue', '../../README.md']
  for (const file of files) {
    const text = readFileSync(new URL(file, import.meta.url), 'utf8')
    for (const word of forbidden) {
      assert.equal(text.includes(word), false, `${file} contains ${word}`)
    }
  }
})
