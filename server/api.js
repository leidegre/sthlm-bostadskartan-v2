'use strict'

const config = require('./config')

const express = require('express')
const router = express.Router()

const Bostad = require('./bostad')
const bostad = new Bostad()

const GeocodingService = require('./geocoding-service')
const geocodingService = new GeocodingService()

const MultiMap = require('collections/multi-map')
const Dict = require('collections/dict')

let readyState = false
geocodingService.open('data/geocoding.db', (err) => {
  if (err) throw err
  readyState = true
})

// var cache = new Dict()
function outputCache(duration) {
  return (req, res, next) => {
    res.setHeader('Cache-Control', `public, max-age=${duration * 60}`)
    next()
  }
}

function filterResults(results, query) {
  if (query['min-rum']) {
    const minRum = query['min-rum']
    results = results.filter((entry) => minRum.localeCompare(entry.rum) <= 0)
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

const cache = new Dict()

router.get('/now', outputCache(15), (req, res) => {
  if (!readyState) {
    res.status(503).end()
    return
  }
  const cachedResults = cache.get(req.originalUrl)
  if (cachedResults) {
    res.json(cachedResults)
    return
  }
  bostad.getSökBostad()
    .then((results) => {
      results = filterResults(results, req.query)
      if (req.query.geocode && req.query.geocode !== '0') {
        return geocode(results)
          .then((results) => {
            cache.set(req.originalUrl, results)
            res.json(results)
          })
      } else {
        cache.set(req.originalUrl, results)
        res.json(results)
      }
    })
    .catch((err) => res.status(500).send(err.message).end())
})

router.get('/statistik/:year', outputCache(60), (req, res) => {
  if (!readyState) {
    res.status(503).end()
    return
  }
  const cachedResults = cache.get(req.originalUrl)
  if (cachedResults) {
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
            cache.set(req.originalUrl, results)
            res.json(results)
          })
      } else {
        cache.set(req.originalUrl, results)
        res.json(results)
      }
    })
    .catch((err) => res.status(500).send(err.message).end())
})

module.exports = router