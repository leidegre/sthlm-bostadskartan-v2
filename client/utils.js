
export function average(xs, f) {
  var ys = xs.map(f)
  ys.sort((a, b) => a - b) // ascending
  var min = ys[0]
  var avg = ((ys.length % 2) == 1 ? ys[((ys.length - 1) / 2)] : (ys[ys.length / 2 - 1] + ys[ys.length / 2]) / 2)
  var max = ys[ys.length - 1]
  var stdev = Math.sqrt(ys.reduce((a, b) => a + (b - avg) * (b - avg), 0) / (ys.length - 1))
  return {
    n: ys.length, // sample size
    min: min || Number.NaN,
    avg: avg || Number.NaN,
    max: max || Number.NaN,
    stdev
  }
}

export function Seq(arr) {
  return new SeqImpl(arr)
}

class SeqImpl {
  constructor(arr) {
    if (typeof arr !== 'undefined') {
      this._arr = Array.isArray(arr) ? arr : [arr]
    } else {
      this._arr = []
    }
  }
  fromKeys(obj) {
    if (typeof obj !== 'object') throw new TypeError('obj must be object')
    let keys = []
    for (let k in obj) {
      keys.push(k)
    }
    return new SeqImpl(keys)
  }
  get length() {
    return this._arr.length
  }
  get(index) {
    return this._arr[index]
  }
  get first() {
    return this.get(0)
  }
  get last() {
    return this.get(this.length - 1)
  }
  toArray() {
    return [].concat(this._arr)
  }
  map(mapper) {
    const arr = this._arr
    const mapped = []
    for (let i = 0, len = arr.length; i < len; i++) {
      mapped.push(mapper(arr[i]))
    }
    return new SeqImpl(mapped)
  }
  distinct() {
    const arr = this._arr
    const unique = []
    for (let i = 0, len = arr.length; i < len; i++) {
      const val = arr[i]
      if (unique.indexOf(val) === -1) {
        unique.push(val)
      }
    }
    return new SeqImpl(unique)
  }
  orderBy(compareFunction) {
    var sorted = this.toArray()
    sorted.sort(compareFunction)
    return new SeqImpl(sorted)
  }
}

export function keys(obj) {
  const keys = []
  for (let k in obj) {
    keys.push(k)
  }
  keys.sort((a, b) => a.localeCompare(b))
  return keys
}

export function groupBy(xs, f) {
  return xs.reduce((g, x) => ((g[f(x)] || (g[f(x)] = [])).push(x), g), {})
}

export function groupByDistinct(arr) {
  var obj = {}
  for (let i = 0; i < arr.length; i++) {
    obj[arr[i]] = (obj[arr[i]] || 0) + 1
  }
  return obj
}

export function distinct(arr) {
  return keys(groupByDistinct(arr))
}

const monthNames = ['jan.', 'feb.', 'mars', 'april', 'maj', 'juni', 'juli', 'aug.', 'sept.', 'okt.', 'nov.', 'dec.']
export function displayMonthYear(t) {
  var d = new Date(t)
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
}