
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as utils  from './utils'

import { Colorize } from './colorize.jsx'

function HyraRow(props) {
  return (
    <tr>
      <td>{props.label}</td>
      <td><Colorize value={props.stats.min} domain={props.domain} /></td>
      <td><Colorize value={props.stats.avg} domain={props.domain} /></td>
      <td>{ props.stats.stdev.toFixed(1) }</td>
      <td><Colorize value={props.stats.max} domain={props.domain} /></td>
      <td>{props.stats.n}</td>
    </tr>
  )
}

class Hyra extends Component {
  render() {
    const cluster = this.props.cluster
    if (!cluster) {
      return (
        <p>
          <em>Välj ett kluster för mer information.</em>
        </p>
      )
    }
    const hyra = cluster.hyra
    const keys = utils.keys(hyra)
    return (
      <div>
        <h2>Hyra/kvm</h2>

        <table className='table table-condensed table-hover table-striped'>
          <thead>
            <tr>
              <th>rum</th>
              <th>lägsta </th>
              <th>snitt</th>
              <th>stdev</th>
              <th>högsta</th>
              <th>#</th>
            </tr>
          </thead>
          <tbody>
            {
              keys.map((k) => <HyraRow key={k} label={k} stats={hyra[k]} domain={cluster.hyra_domain} />)
            }
          </tbody>
        </table>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    cluster: state.bostad.get('cluster')
  }
}

export default connect(mapStateToProps)(Hyra)
