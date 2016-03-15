'use strict'

const test = require('tape')

const Bostad = require('./bostad')

test('getSökBostad', (t) => {
  var bostad = new Bostad()
  bostad.getSökBostad().then((result) => {
    t.end()
  }).catch(t.end)
})

test('getStatistik', (t) => {
  var bostad = new Bostad()
  bostad.getStatistik().then((result) => {
    t.end()
  }).catch(t.end)
}) 
