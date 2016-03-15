'use strict'

const HttpClient = require('./http')
const cheerio = require('cheerio')

function trim(s) {
  return (s || '').toString().trim()
}

const DATUM_PATTERN = /(\d{4})-(\d{2})-(\d{2})/
function parseDatum(s) {
  let m = DATUM_PATTERN.exec(s)
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]))
  }
  return null
}

const ANNONS_ID_PATTERN = /[\?&]aid=(\d+)/
function parseAnnonsId(s) {
  const m = ANNONS_ID_PATTERN.exec(s)
  if (m) {
    return m[1]
  }
  return null
}

const WHITESPACE_PATTERN = /[\t ]+/
const STREET_NUMBER_PATTERN = /[0-9]+[a-z]?/
function tokenizeGatuadress(gatuadress) {
  return gatuadress.toLowerCase().split(WHITESPACE_PATTERN).filter((x) => !STREET_NUMBER_PATTERN.test(x))
}

const DROP_TRAPPHUS_PATTERN = /(\d+)[a-z]$/i
function dropTrapphus(s) {
  return s.replace(DROP_TRAPPHUS_PATTERN, '$1')
}

function approxGatunummer(x) {
  const s = Math.pow(10, Math.floor(Math.log10(x)))
  return Math.round(s * Math.round(x / s))
}

const APPROX_GATUADRESS_PATTERN = /(\d+)$/i
function approxGatuadress(s) {
  return dropTrapphus(s).replace(APPROX_GATUADRESS_PATTERN, (x) => approxGatunummer(parseInt(x)))
}

function annonsParser(tr) {
  var td = cheerio('td', tr)

  const kommun = trim(cheerio(td[0]).text())
  const stadsdel = trim(cheerio(td[1]).text())
  const gatuadress = trim(cheerio(td[2]).text())
  const link = cheerio('a', td[2]).attr('href')
  const våning = trim(cheerio(td[3]).text())
  const rum = trim(cheerio(td[4]).text())
  const yta = trim(cheerio(td[5]).text())
  const hyra = trim(cheerio(td[6]).text())
  const annons_t_o_m = trim(cheerio(td[7]).text())
  const props = cheerio('span.objProp', td[8]).get().map((el) => trim(cheerio(el).text()).toLowerCase())
  
  props.sort((a, b) => a.localeCompare(b))

  const annons = new Annons({
    kommun,
    stadsdel,
    gatuadress,
    link,
    aid: parseAnnonsId(link),
    våning,
    rum,
    yta: parseInt(yta),
    hyra: parseInt(hyra),
    annons_t_o_m: parseDatum(annons_t_o_m),
    props
  })

  annons.init()

  return annons
}

function statistikParser(tr) {
  var td = cheerio('td', tr)

  const kommun = trim(cheerio(td[0]).text())
  const stadsdel = trim(cheerio(td[1]).text())
  const gatuadress = trim(cheerio(td[2]).text())
  const link = cheerio('a', td[2]).attr('href')
  const rum = trim(cheerio(td[3]).text())
  const yta = parseInt(trim(cheerio(td[4]).text()))
  const hyra = parseInt(trim(cheerio(td[5]).text()))
  const våning = trim(cheerio(td[6]).text())
  const kötid = trim(cheerio(td[7]).text())

  const stats = new Statistik({
    kommun,
    stadsdel,
    gatuadress,
    link,
    aid: parseAnnonsId(link),
    våning,
    rum,
    yta: parseInt(yta),
    hyra: parseInt(hyra),
    kötid: parseDatum(kötid)
  })

  stats.init()

  return stats
}

class Objekt {
  constructor(props) {
    Object.assign(this, props)
  }
  init() {
    this.hyra_per_kvm = this.hyra / this.yta
    
    // Vi är inte jätte intresserad av exakta "belägenhetsadress"
    // utan vi kan hoppa över, t.ex. trapphus och exakta gatunummer.
    const gatuadress = approxGatuadress(this.gatuadress.toLowerCase())
     
    this.geocodeComponents = [
      gatuadress, 
      this.stadsdel.toLowerCase(), 
      this.kommun.toLowerCase()
    ]
    
    this.geocodeQuery = this.geocodeComponents.join(',')
  }
}

// Icke-förmedlade bostads objekt
class Annons extends Objekt {
  constructor(props) {
    super(props)
  }
  toJSON() {
    return {
      kommun: this.kommun,
      stadsdel: this.stadsdel,
      gatuadress: this.gatuadress,
      link: this.link,
      aid: this.aid,
      våning: this.våning,
      rum: this.rum,
      yta: this.yta,
      hyra: this.hyra,
      hyra_per_kvm: this.hyra_per_kvm,
      annons_t_o_m: this.annons_t_o_m,
      props: this.props
    }
  }
}

// Förmedlade bostads objekt
class Statistik extends Objekt {
  constructor(props) {
    super(props)
  }
  toJSON() {
    return {
      kommun: this.kommun,
      stadsdel: this.stadsdel,
      gatuadress: this.gatuadress,
      link: this.link,
      aid: this.aid,
      våning: this.våning,
      rum: this.rum,
      yta: this.yta,
      hyra: this.hyra,
      hyra_per_kvm: this.hyra_per_kvm,
      kötid: this.kötid
    }
  }
}

class Bostad {
  constructor() {
    this._http = new HttpClient()
  }
  getSökBostad() {
    return this._http.get('https://bostad.stockholm.se/Lista/').then((res) => {
      const $ = cheerio.load(res.body)
      const tr = $('table > tbody > tr')
      const annonser = tr.get().map(annonsParser)
      return annonser
    })
  }
  getStatistik(params) {
    const body = Object.assign({ 
      rooms: '', 
      area: '', 
      apartmentType: '', 
      buildingType: '', 
      queue: 'Bostadskön', 
      year: new Date().getFullYear().toString(), 
      group: '0-2' }, params)
    return this._http.post('https://bostad.stockholm.se/statistik/RenderApartmentList/', body)
      .then((res) => {
        const $ = cheerio.load(res.body)
        const tr = $('table > tbody > tr')
        const statistik = tr.get().map(statistikParser)
        return statistik
      })
  }
  getStatistikMany(params) {
    const kötidsintervall = ['0-2','2-4','4-6','6-8','8-10','10-12','12-14','14-16','16-18','18-20','20 <']
    return new Promise((resolve, reject) => {
      let results = []
      let i = 0
      let next = (result) => {
        for (let j = 0; j < result.length; j++) {
          results.push(result[j])
        }
        i++
        if (i < kötidsintervall.length) {
          this.getStatistik(Object.assign({}, params, { group: kötidsintervall[i] })).then(next, reject)  
        } else {
          resolve(results)
        }
      }
      this.getStatistik(Object.assign({}, params, { group: kötidsintervall[i] })).then(next, reject)  
    })
  }
}

module.exports = Bostad
