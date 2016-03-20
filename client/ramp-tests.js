
import test from 'tape'

import { ramp } from './ramp'

var suggestions = ['a', 'b', null, 'c', 'd']

test('ramp+1', (t) => {
  t.plan(5)

  t.equal(ramp(-2 - 1, { avg: -1, stdev: 1 }, suggestions), 'a')
  t.equal(ramp(-1 - 1, { avg: -1, stdev: 1 }, suggestions), 'b')
  t.equal(ramp(0 - 1, { avg: -1, stdev: 1 }, suggestions), null)
  t.equal(ramp(1 - 1, { avg: -1, stdev: 1 }, suggestions), 'c')
  t.equal(ramp(2 - 1, { avg: -1, stdev: 1 }, suggestions), 'd')
})

test('ramp', (t) => {
  t.plan(5)

  t.equal(ramp(-2, { avg: 0, stdev: 1 }, suggestions), 'a')
  t.equal(ramp(-1, { avg: 0, stdev: 1 }, suggestions), 'b')
  t.equal(ramp(0, { avg: 0, stdev: 1 }, suggestions), null)
  t.equal(ramp(1, { avg: 0, stdev: 1 }, suggestions), 'c')
  t.equal(ramp(2, { avg: 0, stdev: 1 }, suggestions), 'd')
})

test('ramp+1', (t) => {
  t.plan(5)

  t.equal(ramp(-2 + 1, { avg: 1, stdev: 1 }, suggestions), 'a')
  t.equal(ramp(-1 + 1, { avg: 1, stdev: 1 }, suggestions), 'b')
  t.equal(ramp(0 + 1, { avg: 1, stdev: 1 }, suggestions), null)
  t.equal(ramp(1 + 1, { avg: 1, stdev: 1 }, suggestions), 'c')
  t.equal(ramp(2 + 1, { avg: 1, stdev: 1 }, suggestions), 'd')
})

test('ramp+1~0.5stdev', (t) => {
  t.plan(5)

  t.equal(ramp(-2 - 1, { avg: -1, stdev: 0.5 }, suggestions), 'a')
  t.equal(ramp(-1 - 1, { avg: -1, stdev: 0.5 }, suggestions), 'a')
  t.equal(ramp(0 - 1, { avg: -1, stdev: 0.5 }, suggestions), null)
  t.equal(ramp(1 - 1, { avg: -1, stdev: 0.5 }, suggestions), 'd')
  t.equal(ramp(2 - 1, { avg: -1, stdev: 0.5 }, suggestions), 'd')
})

test('ramp~0.5stdev', (t) => {
  t.plan(5)

  t.equal(ramp(-2, { avg: 0, stdev: 0.5 }, suggestions), 'a')
  t.equal(ramp(-1, { avg: 0, stdev: 0.5 }, suggestions), 'a')
  t.equal(ramp(0, { avg: 0, stdev: 0.5 }, suggestions), null)
  t.equal(ramp(1, { avg: 0, stdev: 0.5 }, suggestions), 'd')
  t.equal(ramp(2, { avg: 0, stdev: 0.5 }, suggestions), 'd')
})

test('ramp+1~0.5stdev', (t) => {
  t.plan(5)

  t.equal(ramp(-2 + 1, { avg: 1, stdev: 0.5 }, suggestions), 'a')
  t.equal(ramp(-1 + 1, { avg: 1, stdev: 0.5 }, suggestions), 'a')
  t.equal(ramp(0 + 1, { avg: 1, stdev: 0.5 }, suggestions), null)
  t.equal(ramp(1 + 1, { avg: 1, stdev: 0.5 }, suggestions), 'd')
  t.equal(ramp(2 + 1, { avg: 1, stdev: 0.5 }, suggestions), 'd')
})


test('ramp+1~2stdev', (t) => {
  t.plan(5)

  t.equal(ramp(-2 - 1, { avg: -1, stdev: 2 }, suggestions), 'b')
  t.equal(ramp(-1 - 1, { avg: -1, stdev: 2 }, suggestions), 'b')
  t.equal(ramp(0 - 1, { avg: -1, stdev: 2 }, suggestions), null)
  t.equal(ramp(1 - 1, { avg: -1, stdev: 2 }, suggestions), 'c')
  t.equal(ramp(2 - 1, { avg: -1, stdev: 2 }, suggestions), 'c')
})

test('ramp~2stdev', (t) => {
  t.plan(5)

  t.equal(ramp(-2, { avg: 0, stdev: 2 }, suggestions), 'b')
  t.equal(ramp(-1, { avg: 0, stdev: 2 }, suggestions), 'b')
  t.equal(ramp(0, { avg: 0, stdev: 2 }, suggestions), null)
  t.equal(ramp(1, { avg: 0, stdev: 2 }, suggestions), 'c')
  t.equal(ramp(2, { avg: 0, stdev: 2 }, suggestions), 'c')
})

test('ramp+1~2stdev', (t) => {
  t.plan(5)

  t.equal(ramp(-2 + 1, { avg: 1, stdev: 2 }, suggestions), 'b')
  t.equal(ramp(-1 + 1, { avg: 1, stdev: 2 }, suggestions), 'b')
  t.equal(ramp(0 + 1, { avg: 1, stdev: 2 }, suggestions), null)
  t.equal(ramp(1 + 1, { avg: 1, stdev: 2 }, suggestions), 'c')
  t.equal(ramp(2 + 1, { avg: 1, stdev: 2 }, suggestions), 'c')
})

test('ramp+1~stdev=0', (t) => {
  t.plan(5)

  t.equal(ramp(-2 - 1, { avg: -1, stdev: 0 }, suggestions), 'a')
  t.equal(ramp(-1 - 1, { avg: -1, stdev: 0 }, suggestions), 'b')
  t.equal(ramp(0 - 1, { avg: -1, stdev: 0 }, suggestions), null)
  t.equal(ramp(1 - 1, { avg: -1, stdev: 0 }, suggestions), 'c')
  t.equal(ramp(2 - 1, { avg: -1, stdev: 0 }, suggestions), 'd')
})

test('ramp~stdev=0', (t) => {
  t.plan(5)

  t.equal(ramp(-2, { avg: 0, stdev: 0 }, suggestions), 'a')
  t.equal(ramp(-1, { avg: 0, stdev: 0 }, suggestions), 'b')
  t.equal(ramp(0, { avg: 0, stdev: 0 }, suggestions), null)
  t.equal(ramp(1, { avg: 0, stdev: 0 }, suggestions), 'c')
  t.equal(ramp(2, { avg: 0, stdev: 0 }, suggestions), 'd')
})

test('ramp+1~stdev=0', (t) => {
  t.plan(5)

  t.equal(ramp(-2 + 1, { avg: 1, stdev: 0 }, suggestions), 'a')
  t.equal(ramp(-1 + 1, { avg: 1, stdev: 0 }, suggestions), 'b')
  t.equal(ramp(0 + 1, { avg: 1, stdev: 0 }, suggestions), null)
  t.equal(ramp(1 + 1, { avg: 1, stdev: 0 }, suggestions), 'c')
  t.equal(ramp(2 + 1, { avg: 1, stdev: 0 }, suggestions), 'd')
})