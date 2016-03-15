'use strict'

var path = require('path')
var fs = require('fs')
var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

function getConfigParam(key) {
  return process.env[key] || config[key]
}

module.exports = {
  GOOGLE_MAPS_GEOCODE_API_KEY: getConfigParam('GOOGLE_MAPS_GEOCODE_API_KEY')
}
