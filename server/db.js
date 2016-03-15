'use strict'

const fs = require('fs')
const readline = require('readline')
const Dict = require("collections/dict")
const Deque = require("collections/deque")

function writeQueueTick(q) {
  q.tick()
}

// The write queue is used to serialize all writes, 
// so even if we get concurrent I/O requests 
// they will happen sequentially without overlap
class WriteQueue {
  constructor(fn) {
    this._fn = fn
    this._backlog = new Deque()
    this._pending = false
  }
  append(data, callback) {
    this._backlog.push({ data, callback })
    if (!this._pending) {
      process.nextTick(writeQueueTick, this)
      this._pending = true
    }
  }
  tick() {
    // we can batch things here (if the backlog is bigger)
    if (this._backlog.length > 0) {
      const item = this._backlog.shift()
      const data = item.data
      const callback = item.callback
      fs.appendFile(this._fn, data, (err) => {
        process.nextTick(writeQueueTick, this)
        if (err) return callback(err)
        callback(null)
      })
      return
    }
    this._pending = false
  }
}

class DBImpl {
  constructor() {
    this._db = null
    this._wq = null
  }
  init() {
    this._db = new Dict()
    this._wq = null
  }
  open(fn, callback) {
    const readable = fs.createReadStream(fn)
    readable.on('error', (err) => {
      if (err.code !== 'ENOENT') return callback(err)
      // init
      this.init()
      this._wq = new WriteQueue(fn)
      // done
      callback(null)
    })
    // init
    this.init()
    this._wq = new WriteQueue(fn)
    // load
    const rl = readline.createInterface({
      input: readable
    })
    rl.on('line', (line) => {
      try {
        // parse document
        const kv = JSON.parse(line)
        this.merge(kv.k, kv.v)
      } catch (err) {
        console.warn('# Entry is corrupt and has been discarded.', err)
      }
    })
    rl.on('close', () => {
      // done
      callback(null)
    })
  }
  getSync(key) {
    return this._db.get(key)
  }
  put(key, value, callback) {
    if (typeof key !== 'string') throw new Error('key must be string')
    const data = JSON.stringify({ k: key, v: value }) + '\n'
    this._wq.append(data, (err) => {
      if (err) return callback(err)
      this.merge(key, value)
      callback(null)
    })
  }
  merge(key, value) {
    if (value !== null) {
      this._db.set(key, value)
    } else { // a value of null represents a delete operation
      this._db.delete(key)
    }
  }
  close() {
    this._db = null
    this._wq = null
  }
}

class DB {
  constructor() {
    this._impl = new DBImpl()
  }
  init() {
    this._impl.init()
  }
  open(fn, callback) {
    const temp = new DB()
    temp._impl.open(fn, (err) => {
      if (err) return callback(err)
      this.swap(temp)
      callback(null)
    })
  }
  getSync(key) {
    return this._impl.getSync(key)
  }
  put(key, value, callback) {
    this._impl.put(key, value, callback)
  }
  delete(key, callback) {
    this._impl.put(key, null, callback)
  }
  close() {
    this._impl.close()
  }
  swap(other) {
    if (!(other && other.constructor === DB)) throw new TypeError('other must be DB')
    const temp = this._impl
    this._impl = other._impl
    other._impl = temp
  }
}

module.exports = DB
