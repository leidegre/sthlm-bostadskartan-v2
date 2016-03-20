
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as utils  from './utils'

import { Colorize } from './colorize.jsx'

function KötidRow(props) {
  const minKötid = props.minKötid.getTime()
  return (
    <tr>
      <td>{props.label}</td>
      <td>
        <Colorize value={props.stats.max} display={utils.displayMonthYear} domain={props.domain} reverseDomain={true} />
        {' '}
        {minKötid < props.stats.max ? <span className='glyphicon glyphicon-home' /> : ''}
      </td>
      <td><Colorize value={props.stats.avg} display={utils.displayMonthYear} domain={props.domain} reverseDomain={true} /></td>
      <td>{ props.stats.n > 1 ? `${(props.stats.stdev / (365.25 * 24 * 3600 * 1000)).toFixed(1)} år` : null }</td>
      <td><Colorize value={props.stats.min} display={utils.displayMonthYear} domain={props.domain} reverseDomain={true} /></td>
      <td>{props.stats.n}</td>
    </tr>
  )
}

class Kötid extends Component {
  render() {
    const cluster = this.props.cluster
    if (!cluster) {
      return null
    }
    if (!cluster.kötid) {
      return null
    }
    const kötid = cluster.kötid
    const keys = utils.keys(kötid)
    return (
      <div>
        <h2>Kötid sedan</h2>

        <table className='table table-condensed table-hover table-striped'>
          <thead>
            <tr>
              <th>rum</th>
              <th>kortaste</th>
              <th>snitt</th>
              <th>stdev</th>
              <th>längsta</th>
              <th>#</th>
            </tr>
          </thead>
          <tbody>
            {
              keys.map((k) => <KötidRow key={k} label={k} stats={kötid[k]} domain={cluster.kötid_domain} minKötid={this.props.minKötid} />)
            }
          </tbody>
        </table>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    dataSource: state.bostad.get('dataSource'),
    cluster: state.bostad.get('cluster'),
    minKötid: new Date(state.bostad.get('minKötid'))
  }
}

export default connect(mapStateToProps)(Kötid)
