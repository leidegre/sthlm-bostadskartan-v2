
function rampRound(val) {
  return val <= 0 ? Math.floor(val) : Math.ceil(val)
}

export function ramp(val, domain, suggestions) {
  if (!(typeof val === 'number')) throw new TypeError('val must be number')
  if (!(typeof domain === 'object')) throw new TypeError('domain must be object')
  if (!(domain && typeof domain.avg === 'number')) throw new TypeError('domain.avg must be number')
  if (!(domain && typeof domain.stdev === 'number')) throw new TypeError('domain.stdev must be number')
  if (!Array.isArray(suggestions)) throw new TypeError('suggestions must be Array')
  if (!((suggestions.length > 0) && (suggestions.length % 2) == 1)) throw new TypeError('suggestions must be of odd length')
  var n = (val - domain.avg) / (domain.stdev > 0 ? domain.stdev : 1)
  var l = (suggestions.length - 1) / 2
  var x = Math.min(Math.max(-l, n), l)
  return suggestions[l + rampRound(x)]
}