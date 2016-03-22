'use strict'

const Dict = require('collections/dict')

// This is a private but otherwise app-wide global cache
const privateCache = new Dict()

function getCacheEntry(key, maxAge) {
  const entry = privateCache.get(key)
  if (entry) {
    if ((new Date().getTime() - entry.t.getTime()) <= maxAge) {
      return entry.value
    }
  }
  return null
}

function putCacheEntry(key, value) {
  privateCache.set(key, { t: new Date(), value: value })
}

module.exports = {
  getCacheEntry,
  putCacheEntry
}