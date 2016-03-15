import { combineReducers } from 'redux'
import Immutable from 'immutable'

import { default as makeClusters } from '../clusters'

function updateCluster(state) {
  var results = state.get('results')
  var year = state.get('year')
  var clusters = makeClusters(results, {
    tolerance: state.get('clusterSize'),
    year
  })
  return state.set('clusters', clusters)
}

function bostad(state = Immutable.Map({ dataSource: 'now', clusterSize: 1000, minKötid: '2009-04-24', minRoomSize: 4 }), action) {
  switch (action.type) {
    case '@@bostad/set-results': {
      state = state.set('year', action.year)
      return updateCluster(state.set('results', action.results))
    }
    case '@@bostad/set-data-source': {
      return state.set('dataSource', action.dataSource)
    }
    case '@@bostad/set-cluster-size': {
      return updateCluster(state.set('clusterSize', action.clusterSize))
    }
    case '@@bostad/set-min-kötid': {
      return state.set('minKötid', action.minKötid)
    }
    case '@@bostad/set-min-room-size': {
      return updateCluster(state.set('minRoomSize', action.minRoomSize))
    }
    case '@@bostad/set-cluster': {
      return state.set('cluster', action.cluster)
    }
  }
  return state
}

const rootReducer = combineReducers({
  bostad
})

export default rootReducer