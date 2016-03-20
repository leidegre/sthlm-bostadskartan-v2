
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { setCluster } from './actionCreators'

const colorRamp = ['#FF0000', '#FF8000', '#000000', '#008000', '#0000FF']
import { ramp } from './ramp'

class Cluster extends Component {

  // the purpose of this component is just to push the state into the Google Map
  componentWillReceiveProps(nextProps) {
    const clusters = nextProps.clusters
    if (this.props.clusters !== clusters) {
      // clear markers
      if (this._markers) {
        for (let i = 0; i < this._markers.length; i++) {
          this._markers[i].setMap(null)
        }
      }
      this._markers = []
      for (let k in clusters) {
        let cluster = clusters[k]
        // Om avståndet från Stockholms mittpunkt är först stort borde
        // vi inte visa kluster på kartan.
        if ((cluster.center.lat !== 0) && (cluster.center.lng !== 0)) {
          let color = colorRamp[0]
          if (cluster.kötid) {
            color = ramp(cluster.kötid_cluster.avg, cluster.kötid_domain, colorRamp)
          }
          let marker = new google.maps.Circle({
            strokeColor: color,
            strokeOpacity: 0.75,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.1,
            map: map,
            center: cluster.center,
            radius: Math.max(250, cluster.radius)
          })
          marker.addListener('click', () => {
            this.props.dispatch(setCluster({ cluster: cluster }))
          })
          this._markers.push(marker)
        }
      }
    }
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return null
  }
}

function mapStateToProps(state) {
  return {
    clusters: state.bostad.get('clusters')
  }
}

export default connect(mapStateToProps)(Cluster)
