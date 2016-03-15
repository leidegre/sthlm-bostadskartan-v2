
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { getNow } from './actionCreators';

import Controls from './controls.jsx';
import Clusters from './clusters.jsx';
import Hyra from './hyra.jsx';
import Kötid from './kötid.jsx';
import Objekt from './objekt.jsx';

class App extends Component {

  constructor(props, context) {
    super(props, context)
    this._onMessage = (msg) => {
      if (msg.data === 'initMap') {
        this.props.dispatch(getNow({}))
      }
    }
  }

  componentWillMount() {
    window.addEventListener('message', this._onMessage, false)
  }

  componentWillUnmount() {
    window.removeEventListener('message', this._onMessage, false)
  }

  render() {
    return (
      <div>
        <Controls />
        <Clusters />
        <Hyra />
        <Kötid />
        <Objekt />
      </div>
    )
  }
}

export default connect()(App)