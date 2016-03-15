'use strict'

const test = require('tape')

const GeocodingService = require('./geocoding-service')

test('geocodeMany', (t) => {
  const geocodingService = new GeocodingService()
  geocodingService.open('data/geocoding.db', (err) => {
    if (err) return t.end(err)
    geocodingService.geocodeMany(['Göteborg', 'Stockholm', 'Malmö']).then((results) => {
      t.end()
    }).catch(t.end)
  })
})