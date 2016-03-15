'use strict'

const test = require('tape')
const fs = require('fs')
const DB = require('./db')
const FILE_NAME_LIST = []
function nextString(len) {
  const xs = 'abcdefghijklmnopqrstuvwxyz'
  let x = ''
  for (let i = 0; i < len; i++) {
    x += xs[parseInt(xs.length * Math.random())]
  }
  return x
}
function nextFn(len) {
  const fn = `test-${nextString(len)}.db`
  FILE_NAME_LIST.push(fn)
  return fn
}
function rm(fn) {
  try {
    fs.unlinkSync(fn)
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
}
test.onFinish(() => FILE_NAME_LIST.forEach(rm))

test('open non-existing db', (t) => {
  const fn = nextFn(11)
  var db = new DB()
  db.open(fn, t.end)
})

test('open empty db', (t) => {
  const fn = nextFn(11)
  fs.appendFileSync(fn, '')
  var db = new DB()
  db.open(fn, t.end)
})

test('put document', (t) => {
  t.plan(1)
  const fn = nextFn(11)
  var db = new DB()
  db.open(fn, () => {
    db.put('key', 'value', (err) => {
      if (err) t.end(err)
      t.ok(fs.statSync(fn).size > 0)
    })
  })
})

test('put then get document', (t) => {
  t.plan(1)
  const fn = nextFn(11)
  var db = new DB()
  db.open(fn, () => {
    const testVector = nextString(11)
    db.put('key', testVector, () => {
      t.equal(db.getSync('key'), testVector)
    })
  })
})

test('put, close, reopen then get document', (t) => {
  t.plan(1)
  const fn = nextFn(11)
  var db = new DB()
  db.open(fn, () => {
    const testVector = nextString(11)
    db.put('key', testVector, () => {
      db.close()
      db.open(fn, () => {
        t.equal(db.getSync('key'), testVector)
      })
    })
  })
})

test('put many', (t) => {
  t.plan(3)
  const fn = nextFn(11)
  var db = new DB()
  db.open(fn, () => {
    const testVector = [nextString(11), nextString(11), nextString(11)]
    db.put('key1', testVector[0], () => {
      db.put('key2', testVector[1], () => {
        db.put('key3', testVector[2], () => {
          db.close()
          db.open(fn, () => {
            t.equal(db.getSync('key1'), testVector[0])
            t.equal(db.getSync('key2'), testVector[1])
            t.equal(db.getSync('key3'), testVector[2])
          })
        })
      })
    })
  })
})
