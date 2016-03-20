
import React, { Component } from 'react'
import { connect } from 'react-redux'

import * as utils  from './utils'

import { Colorize } from './colorize.jsx'

function DagarKvar(props) {
  const date = props.date
  const diff = (date - new Date()) / (24 * 3600 * 1000)
  if (diff < 1) {
    return (
      <strong className='text-danger'>{'1 <'}</strong>
    )
  }
  if (diff < 2) {
    return (
      <span className='text-warning'>{ diff.toFixed(1) }</span>
    )
  }
  return (
    <span>{ diff.toFixed(0) }</span>
  )
}

function AnnonsTableRow(props) {
  const entry = props.entry
  return (
    <tr>
      <td className='text-nowrap'><code>{entry.aid}</code> <a href={`https://bostad.stockholm.se${entry.link}`} target='_blank'><span className='glyphicon glyphicon-link'></span></a></td>
      <td>{entry.gatuadress}</td>
      <td>{entry.våning}</td>
      <td>{entry.rum}</td>
      <td>{entry.yta}</td>
      <td>{entry.hyra}</td>
      <td>{ entry.annons_t_o_m ? <DagarKvar date={entry.annons_t_o_m} /> : '' }</td>
      <td>
        {
          (entry.props || []).map((x) => <span key={x} className='label label-warning'>{x}</span>)
        }
      </td>
    </tr>
  )
}

function Hyra(props) {
  const hyra = props.hyra
  return (
    <dl>
      <dt className='text-muted'>lägsta</dt>
      <dd><Colorize value={hyra.min} domain={hyra} /></dd>
      <dt className='text-muted'>snitt</dt>
      <dd className='text-nowrap'><Colorize value={hyra.avg} domain={hyra} /> (±{hyra.stdev.toFixed(0) }) </dd>
      <dt className='text-muted'>högsta</dt>
      <dd><Colorize value={hyra.max} domain={hyra} /></dd>
    </dl>
  )
}

function Kötid(props) {
  const kötid = props.kötid
  return (
    <dl>
      <dt className='text-muted'>kortaste</dt>
      <dd><Colorize value={kötid.max} domain={kötid} display={utils.displayMonthYear} reverseDomain={true} /> {' '} {props.minKötid < kötid.max ? <span className='glyphicon glyphicon-home' /> : ''}</dd>
      <dt className='text-muted'>snitt</dt>
      <dd className='text-nowrap'><Colorize value={kötid.avg} domain={kötid} display={utils.displayMonthYear} reverseDomain={true} /> (±{(kötid.stdev / (365.25 * 24 * 3600 * 1000)).toFixed(1) } år) </dd>
      <dt className='text-muted'>längsta</dt>
      <dd className='text-nowrap'><Colorize value={kötid.min} domain={kötid} display={utils.displayMonthYear} reverseDomain={true} /></dd>
    </dl>
  )
}

function parseVåning(våning) {
  var n = parseInt(våning)
  if (isNaN(n)) {
    if (våning == 'BV') {
      return 0
    }
  }
  return n
}

function våningComparer(a, b) {
  const x = parseVåning(a)
  const y = parseVåning(b)
  return x - y
}

function StatistikGroupTableRow(props) {
  const entries = props.entries
  if (entries.length === 1) {
    const entry = entries[0]
    return (
      <tr>
        <td className='text-nowrap'><code>{`${props.aid}`}</code> <a href={`https://bostad.stockholm.se${entry.link}`} target='_blank'><span className='glyphicon glyphicon-link'></span></a></td>
        <td></td>
        <td>{entry.gatuadress}</td>
        <td>{entry.rum}</td>
        <td>{entry.yta}</td>
        <td className='text-nowrap'><Colorize value={entry.hyra_per_kvm} domain={props.hyra_domain} /></td>
        <td>{entry.våning}</td>
        <td><Colorize value={entry.kötid.getTime() } domain={props.kötid_domain} display={utils.displayMonthYear} reverseDomain={true} /> {' '} {props.minKötid < entry.kötid ? <span className='glyphicon glyphicon-home' /> : ''}</td>
      </tr>
    )
  }
  const våningar = utils.Seq(entries).map((x) => x.våning).distinct().orderBy(våningComparer)
  const ytor = utils.Seq(entries).map((x) => parseInt(x.yta)).distinct().orderBy((a, b) => a - b)
  return (
    <tr>
      <td className='text-nowrap'><code>{`${props.aid}`}</code> <a href={`https://bostad.stockholm.se${entries[0].link}`} target='_blank'><span className='glyphicon glyphicon-link'></span></a></td>
      <td>{ entries.length.toString() }</td>
      <td style={{ whiteSpace: 'pre' }}>{utils.distinct(entries.map((x) => x.gatuadress)).join('\n') }</td>
      <td>{entries[0].rum}</td>
      <td>{ytor.first} - {ytor.last}</td>
      <td><Hyra hyra={props.hyra} /></td>
      <td>{våningar.first} - {våningar.last}</td>
      <td><Kötid kötid={props.kötid} minKötid={props.minKötid} /></td>
    </tr>
  )
}

class Objekt extends Component {
  render() {
    const cluster = this.props.cluster
    if (!cluster) {
      return null
    }
    if (!cluster.kötid) {
      const entries = [].concat(cluster.entries)
      entries.sort((a, b) => a.rum.localeCompare(b.rum))
      return (
        <div>
          <h2>Objekt</h2>
          <table className='table table-condensed table-hover table-striped'>
            <thead>
              <tr>
                <th></th>
                <th>Gatuadress</th>
                <th>Våning</th>
                <th>Rum</th>
                <th>Yta</th>
                <th>Hyra</th>
                <th><small title='Antalet dagar kvar till anmälan stänger'>Dagar kvar</small></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                entries.map((v, k) => <AnnonsTableRow key={k} entry={v} />)
              }
            </tbody>
          </table>
        </div>
      )
    } else {
      const stuff = []
      const g = utils.groupBy(cluster.entries, (x) => x.aid)
      const keys = utils.keys(g)
      for (let k in keys) {
        const entries = g[keys[k]]
        const hyra = utils.average(entries, (x) => x.hyra_per_kvm)
        const kötid = utils.average(entries, (x) => x.kötid.getTime())
        stuff.push({
          key: k,
          aid: keys[k],
          entries,
          hyra,
          kötid
        })
      }
      stuff.sort((a, b) => a.kötid.avg - b.kötid.avg)
      return (
        <div>
          <h2>Objekt</h2>
          <table className='table table-condensed table-hover table-striped'>
            <thead>
              <tr>
                <th></th>
                <th>#</th>
                <th>Gatuadress</th>
                <th>Rum</th>
                <th>Yta</th>
                <th>Hyra/kvm</th>
                <th>Våning</th>
                <th>Kötid sedan</th>
              </tr>
            </thead>
            <tbody>
              {
                stuff.map((x) => <StatistikGroupTableRow {...x} hyra_domain={cluster.hyra_domain} kötid_domain={cluster.kötid_domain} minKötid={this.props.minKötid} />)
              }
            </tbody>
          </table>
        </div>
      )
    }
  }
}

function mapStateToProps(state) {
  return {
    cluster: state.bostad.get('cluster'),
    dataSource: state.bostad.get('dataSource'),
    minKötid: new Date(state.bostad.get('minKötid')).getTime()
  }
}

export default connect(mapStateToProps)(Objekt)
