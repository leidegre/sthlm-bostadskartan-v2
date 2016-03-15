'use strict'

const Geocoding = require('./geocoding')
const DB = require('./db')
const Promise = require('any-promise')

class GeocodingService {
  constructor() {
    this._geocoding = new Geocoding()
    this._cache = new DB()
  }
  open(fn, callback) {
    this._cache.open(fn, callback)
  }
  geocode(address) {
    let result = this._cache.getSync(address)
    if (result) {
      return Promise.resolve(result)
    }
    return new Promise((resolve, reject) => {
      let doRequest, retryCount = 0
      doRequest = () => {
        this._geocoding.geocode(address).then((res) => {
          switch (res.status) {
            case 'OK': {
              this._cache.put(address, res, (err) => {
                if (err) return reject(err)
                resolve(res)
              })
              break
            }
            case 'ZERO_RESULTS': {
              // not an error, don't cache
              resolve(res)
              break
            }
            case 'OVER_QUERY_LIMIT': {
              if (!(retryCount < 10)) {
                reject(new Error(`Cannot geocode address ${address}. Max retry count exceeded.`))
                return
              }
              setTimeout(() => {
                doRequest()
              }, 1000 + retryCount++ * 1000)
              break
            }
            default: {
              reject(new Error(`Bad geocoding status ${res.status}!`))
              break
            }
          }
        })
      }
      doRequest() // init
    })
  }
  geocodeMany(addresses) {
    if (!Array.isArray(addresses)) throw new TypeError('addresses must be array')
    let results = []
    return new Promise((resolve, reject) => {
      let i = 0
      if (i < addresses.length) {
        let next = (result) => {
          results.push(result)
          i++
          if (i < addresses.length) {
            this.geocode(addresses[i]).then(next, reject)
          } else {
            resolve(results)
          }
        }
        this.geocode(addresses[i]).then(next, reject)
      } else {
        resolve(results)
      }
    })
  }
}

module.exports = GeocodingService
