
import { groupBy, average } from './utils'

function findMin(xs, f) {
  var ys = xs.map((x) => [f(x), x])
  ys.sort((a, b) => a[0] - b[0])
  return ys[0][1]
}

function computeDistanceBetween(a, b) {
  return google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(a), new google.maps.LatLng(b))
}

const KÖTID_PATTERN = /(\d{4})-(\d{2})-(\d{2})/
function parseKötid(s) {
  let m = KÖTID_PATTERN.exec(s)
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))
  }
  return null
}

class Cluster {
  constructor(center, entries) {
    this.center = center
    this.entries = entries
    this.bounds = {
      northeast: Object.assign({}, center),
      southwest: Object.assign({}, center)
    }
    this.radius = 100
  }
  get weight() {
    return this.entries.length
  }
  add(location, entries) {
    this.center = {
      lat: (this.weight * this.center.lat + entries.length * location.lat) / (this.weight + entries.length),
      lng: (this.weight * this.center.lng + entries.length * location.lng) / (this.weight + entries.length)
    }
    this.entries = this.entries.concat(entries)
    if (location.lat > this.bounds.northeast.lat)
      this.bounds.northeast.lat = location.lat
    if (location.lat < this.bounds.southwest.lat)
      this.bounds.southwest.lat = location.lat
    if (location.lng > this.bounds.northeast.lng)
      this.bounds.northeast.lng = location.lng
    if (location.lng < this.bounds.southwest.lng)
      this.bounds.southwest.lng = location.lng
    this.radius = computeDistanceBetween(this.bounds.northeast, this.bounds.southwest) / 2
  }
  init() {
    // Ta fram statistik för hyror och kötid, uppdelat på antal rum
    const g = groupBy(this.entries, (x) => x.rum)
    const hyra = {}
    for (let k in g) {
      hyra[k] = average(g[k].filter((x) => typeof x.hyra_per_kvm === 'number'), (x) => x.hyra_per_kvm)
    }
    this.hyra = hyra
    // ...bostadsförmedlingen räknar kötid baserat på närm man registrerade sig
    // och eftersom vi inte vet när bostaden faktiskt förmedlades kan vi inte räkna ut
    // en relative kötid för varje objekt, så vi tar helt enkelt och visar kötiden på samma sätt
    if (this.entries[0].kötid) {
      const kötid = {}
      for (let k in g) {
        kötid[k] = average(g[k], (x) => x.kötid.getTime())
      }
      this.kötid = kötid
    }
  }
}

function makeClusters(results, opts) {
  const tolerance = opts.tolerance
  const year = new Date(opts.year, 11, 31) // räkna om kötid relativt mot årets slut
  var nullCluster = new Cluster({ lat: 0, lng: 0 }, [])
  var clusters = []
  for (let i = 0; i < results.length; i++) {
    var item = results[i]
    var geocode = item.geocode // geocode kan vara null (om vi inte kunde hitta adressen, sällsynt men det händer)
    var entries = item.entries
    if (!geocode) {
      nullCluster.add({ lat: 0, lng: 0 }, entries)
      continue
    }
    var location = geocode.geometry.location
    if (clusters.length) {
      var minCluster = findMin(clusters, (cluster) => computeDistanceBetween(cluster.center, location))
      if (computeDistanceBetween(minCluster.center, location) <= tolerance) {
        minCluster.add(location, entries)
      } else {
        clusters.push(new Cluster(location, entries))
      }
    } else {
      clusters.push(new Cluster(location, entries))
    }
  }
  if (nullCluster.entries.length > 0) {
    clusters.push(nullCluster)
  }
  for (var i = 0; i < clusters.length; i++) {
    clusters[i].init(year)
  }
  let all_entries = []
  for (var i = 0; i < clusters.length; i++) {
    all_entries = all_entries.concat(clusters[i].entries)
  }
  const hyra_domain = average(all_entries, (x) => x.hyra_per_kvm)
  let kötid_domain
  if (all_entries[0].kötid) {
    kötid_domain = average(all_entries, (x) => x.kötid.getTime())
  }
  for (var i = 0; i < clusters.length; i++) {
    clusters[i].hyra_domain = hyra_domain
    if (kötid_domain) {
      clusters[i].kötid_domain = kötid_domain
    }
  }
  return clusters
}

module.exports = makeClusters