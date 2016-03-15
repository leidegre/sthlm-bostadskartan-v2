'use strict'

const config = require('./config')
const HttpClient = require('./http')

function makeRequestUrl(q) {
  const address = encodeURIComponent(q)
  const components = encodeURIComponent('country:se')
  const key = encodeURIComponent(config.GOOGLE_MAPS_GEOCODE_API_KEY)
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&components=${components}&key=${key}`
}

class Geocoding {
  constructor() {
    this._http = new HttpClient()
  }
  geocode(address) {
    return this._http.get(makeRequestUrl(address)).then((res) => res.body)
  }
}

module.exports = Geocoding
