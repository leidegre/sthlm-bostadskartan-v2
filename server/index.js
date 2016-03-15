'use strict'

require('any-promise/register')('bluebird')

var path = require('path')
var express = require('express')

var app = express()

app.use('/api', require('./api'))

app.get('/static/bundle.js', function(req, res) {
  res.sendFile(path.join(__dirname, '../dist/bundle.js'))
})

app.get('*', function(req, res) {
  res.sendFile(path.join(__dirname, '../index.html'))
})

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 8080

app.listen(process.env.PORT || 8080, host, function(err) {
  if (err) {
    console.log(err)
    return
  }
  console.log(`Listening at http://${host}:${port}`)
})