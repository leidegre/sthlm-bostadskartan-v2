'use strict'

const popsicle = require('popsicle')

class HttpClient {
  get(url) {
    console.log('GET', url)
    return this.request({
      method: 'GET',
      url: url
    })
  }
  post(url, body) {
    console.log('POST', url, body)
    return this.request({
      method: 'POST',
      url: url,
      body
    })
  }
  request(options) {
    return popsicle.request(options)
  }
}

module.exports = HttpClient