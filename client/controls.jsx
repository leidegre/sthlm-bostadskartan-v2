
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setDataSource, getNow, getStatistik, setClusterSize, setMinKötid, setMinRoomSize, setMaxRoomSize } from './actionCreators';

class Controls extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      visaEndastNyproduktion: false
    }
    this._onDataSourceChanged = (e) => {
      this.props.dispatch(setDataSource({ dataSource: e.target.value }))
    }
    this._minRoomSizeChanged = (e) => {
      this.props.dispatch(setMinRoomSize({ minRoomSize: parseInt(e.target.value) }))
    }
    this._maxRoomSizeChanged = (e) => {
      this.props.dispatch(setMaxRoomSize({ maxRoomSize: e.target.value ? parseInt(e.target.value) : null }))
    }
    this._visaEndastNyproduktionChanged = (e) => {
      this.setState({
        visaEndastNyproduktion: e.target.checked
      })
    }
    this._onClick = () => {
      let m = /Y(\d{4})/.exec(this.props.dataSource)
      if (m) {
        this.props.dispatch(getStatistik({ buildingType: this.state.visaEndastNyproduktion ? 'Endast nyproduktion' : '' }))
      } else {
        this.props.dispatch(getNow({}))
      }
    }
    this._clusterSizeChanged = (e) => {
      this.props.dispatch(setClusterSize({ clusterSize: parseInt(e.target.value) }))
    }
    this._minKötidChanged = (e) => {
      this.props.dispatch(setMinKötid({ minKötid: e.target.value }))
    }
  }

  render() {
    const yyyy = new Date().getFullYear()
    return (
      <div>
        <div className='row'>

          <div className='col-md-3'>
            <select className='form-control' value={this.props.dataSource} onChange={this._onDataSourceChanged}>
              <option value='now'>Sök bostad</option>
              {
                [0, 1, 2, 3, 4, 5, 6, 7]
                  .map((y) => <option key={y} value={`Y${yyyy - y}`}>{(yyyy - y).toString() }</option>)
              }
            </select>
          </div>

          <div className={this.props.dataSource === 'now' ? 'col-md-3 text-muted' : 'col-md-3'}>
            <div className={this.props.dataSource === 'now' ? 'checkbox disabled' : 'checkbox'}>
              <label>
                <input type='checkbox' checked={this.state.visaEndastNyproduktion} onChange={this._visaEndastNyproduktionChanged} disabled={this.props.dataSource === 'now'} /> Visa endast nyproduktion
              </label>
            </div>
          </div>

          <div className='col-md-3'>
            <select className='form-control' value={this.props.minRoomSize} onChange={this._minRoomSizeChanged}>
              <option value='1'>1 rum</option>
              <option value='2'>2 rum</option>
              <option value='3'>3 rum</option>
              <option value='4'>4 rum</option>
              <option value='5'>5 rum</option>
              <option value='6'>6 rum</option>
            </select>
            <select className='form-control' value={this.props.maxRoomSize} onChange={this._maxRoomSizeChanged}>
              <option value=''></option>
              <option value='1'>1 rum</option>
              <option value='2'>2 rum</option>
              <option value='3'>3 rum</option>
              <option value='4'>4 rum</option>
              <option value='5'>5 rum</option>
              <option value='6'>6 rum</option>
            </select>
          </div>

          <div className='col-md-3'>
            <button className='btn btn-primary' onClick={this._onClick}>Hämta</button>
          </div>

        </div>
        <div className='row'>

          <div className='col-md-3'>
            <select className='form-control' value={this.props.clusterSize} onChange={this._clusterSizeChanged}>
              <option value='250'>250 m</option>
              <option value='500'>500 m</option>
              <option value='1000'>1 km</option>
              <option value='2000'>2 km</option>
              <option value='3000'>3 km</option>
              <option value='4000'>4 km</option>
              <option value='5000'>5 km</option>
              <option value='10000'>10 km</option>
              <option value='15000'>15 km</option>
              <option value='20000'>20 km</option>
              <option value='25000'>25 km</option>
              <option value='50000'>50 km</option>
            </select>
          </div>

          <div className='col-md-6'>
            <input className='form-control' type='date' value={this.props.minKötid} onChange={this._minKötidChanged} />
          </div>

        </div>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    dataSource: state.bostad.get('dataSource'),
    minRoomSize: state.bostad.get('minRoomSize'),
    clusterSize: state.bostad.get('clusterSize'),
    minKötid: state.bostad.get('minKötid')
  }
}

export default connect(mapStateToProps)(Controls)