'use strict'

const config = require('./config')
const cache = require('./cache')

const express = require('express')
const router = express.Router()

const Bostad = require('./bostad')
const bostad = new Bostad()

const GeocodingService = require('./geocoding-service')
const geocodingService = new GeocodingService()

const MultiMap = require('collections/multi-map')

let readyState = false
geocodingService.open('data/geocoding.db', (err) => {
  if (err) throw err
  readyState = true
})

// This will set the cache control header to public
// (which will allow the browser to cache the request for a while)
function outputCache(duration) {
  return (req, res, next) => {
    res.setHeader('Cache-Control', `public, max-age=${duration * 60}`)
    next()
  }
}

const NUMBER_PATTERN = /\d+(?:(?:\.|,)\d+)?/
function parseNumber(s) {
  const m = NUMBER_PATTERN.exec(s)
  if (m) {
    return parseFloat(m[0].replace(',', '.'))
  }
  return Number.NaN
}

function filterResults(results, query) {
  // grep number
  const minRum = parseNumber(query['min-rum'])
  if (isFinite(minRum)) {
    results = results.filter((entry) => (minRum - parseNumber(entry.rum)) <= 0) 
  }
  const maxRum = parseNumber(query['max-rum'])
  if (isFinite(maxRum)) {
    results = results.filter((entry) => (parseNumber(entry.rum) - maxRum) <= 0)
  }
  return results
}

function groupBy(arr, keySelector) {
  let g = new MultiMap()
  for (let i = 0; i < arr.length; i++) {
    g.get(keySelector(arr[i])).push(arr[i])
  }
  return g
}

function getGeocodingResult(geocodingResult) {
  if (geocodingResult.status === 'OK') {
    const result = geocodingResult.results[0]
    if (result) {
      return {
        geometry: {
          location: result.geometry.location
        }
      }
    }
  }
  // Det är inte alla adresser som vi lyckas översätta till koordinater,
  // ibland därför platser inte finns hos Google men också pga. att vi 
  // har många nya adresser som inte bokförts. 
  // Viktigt att dessa ändå visualiseras i resultatet.
  return null
}

function geocode(results) {
  return new Promise((resolve, reject) => {
    const g = groupBy(results, (x) => x.geocodeQuery)
    const keys = g.keys()
    geocodingService
      .geocodeMany(keys)
      .then((geocodingData) => {
        const resultsWithGeocodingData = []
        for (let i = 0; i < keys.length; i++) {
          resultsWithGeocodingData.push({
            geocode: getGeocodingResult(geocodingData[i]),
            entries: g.get(keys[i])
          })
        }
        resolve(resultsWithGeocodingData)
      })
      .catch(reject)
  })
}

router.get('/now', outputCache(15), (req, res) => {
  if (!readyState) {
    res.status(503).end()
    return
  }
  const cachedResults = cache.getCacheEntry(req.originalUrl, 15 * 60 * 1000)
  if (cachedResults) {
    console.log(`GET ${req.originalUrl} (served from cache)`)
    res.json(cachedResults)
    return
  }
  bostad.getSökBostad()
    .then((results) => {
      results = filterResults(results, req.query)
      if (req.query.geocode && req.query.geocode !== '0') {
        return geocode(results)
          .then((results) => {
            cache.putCacheEntry(req.originalUrl, results)
            res.json(results)
          })
      } else {
        cache.putCacheEntry(req.originalUrl, results)
        res.json(results)
      }
    })
    .catch((err) => res.status(500).send(err.message).end())
})

router.get('/statistik/:year', outputCache(1440), (req, res) => {
  if (!readyState) {
    res.status(503).end()
    return
  }
  const cachedResults = cache.getCacheEntry(req.originalUrl, 1440 * 60 * 1000)
  if (cachedResults) {
    console.log(`GET ${req.originalUrl} (served from cache)`)
    res.json(cachedResults)
    return
  }
  const params = { year: req.params.year }
  if (req.query) {
    if (typeof req.query.buildingType !== 'undefined') {
      params.buildingType = req.query.buildingType
    }
  }
  bostad.getStatistikMany(params)
    .then((results) => {
      results = filterResults(results, req.query)
      if (req.query.geocode && req.query.geocode !== '0') {
        return geocode(results)
          .then((results) => {
            cache.putCacheEntry(req.originalUrl, results)
            res.json(results)
          })
      } else {
        cache.putCacheEntry(req.originalUrl, results)
        res.json(results)
      }
    })
    .catch((err) => res.status(500).send(err.message).end())
})

module.exports = router