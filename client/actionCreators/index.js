
export function setResults({results, year}) {
  return {
    type: '@@bostad/set-results',
    results,
    year
  }
}

export function setDataSource({dataSource}) {
  return {
    type: '@@bostad/set-data-source',
    dataSource
  }
}

export function setMinRoomSize({minRoomSize}) {
  return {
    type: '@@bostad/set-min-room-size',
    minRoomSize
  }
}

export function setMaxRoomSize({maxRoomSize}) {
  return {
    type: '@@bostad/set-max-room-size',
    maxRoomSize
  }
}

export function setClusterSize({clusterSize}) {
  return {
    type: '@@bostad/set-cluster-size',
    clusterSize
  }
}

export function setMinKötid({minKötid}) {
  return {
    type: '@@bostad/set-min-kötid',
    minKötid
  }
}

export function setCluster({cluster}) {
  return {
    type: '@@bostad/set-cluster',
    cluster
  }
}

export function getNow({}) {
  return (dispatch, getState) => {
    const { bostad } = getState()
    fetch(`/api/now?geocode=1&min-rum=${encodeURIComponent(bostad.get('minRoomSize'))}&max-rum=${encodeURIComponent(bostad.get('maxRoomSize', null))}`).then((res) => {
      res.json().then((results) => {
        // parse date
        for (let i = 0; i < results.length; i++) {
          const result = results[i]
          for (let j = 0; j < result.entries.length; j++) {
            const entry = result.entries[j]
            entry.annons_t_o_m = new Date(entry.annons_t_o_m)
          }
        }
        dispatch(setResults({ results, year: new Date().getFullYear() }))
      })
    })
  }
}

export function getStatistik({buildingType}) {
  return (dispatch, getState) => {
    const { bostad } = getState()
    let year = parseInt(/Y(\d{4})/.exec(bostad.get('dataSource'))[1])
    fetch(`/api/statistik/${year}?buildingType=${encodeURIComponent(buildingType || '')}&geocode=1&min-rum=${encodeURIComponent(bostad.get('minRoomSize'))}&max-rum=${encodeURIComponent(bostad.get('maxRoomSize'))}`)
      .then((res) => {
        res.json().then((results) => {
          // parse date
          for (let i = 0; i < results.length; i++) {
            const result = results[i]
            for (let j = 0; j < result.entries.length; j++) {
              const entry = result.entries[j]
              entry.kötid = new Date(entry.kötid)
            }
          }
          dispatch(setResults({ results, year }))
        })
      })
  }
} 