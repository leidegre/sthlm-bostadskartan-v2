
import React, { Component } from 'react'

import { ramp } from './ramp'

const classNameList = ['text-primary', 'text-success', null, 'text-warning', 'text-danger']
const reverseClassNameList = [].concat(classNameList)
reverseClassNameList.reverse()

export function Colorize(props) {
  const value = props.value
  const domain = props.domain
  const display = props.display || ((x) => x.toFixed(props.digits || 0))
  const cs = (props.reverseDomain ? reverseClassNameList : classNameList)
  if (props.value === 137.35416666666666) {
    console.log('!!!')
  }
  const rampValue = ramp(props.value, props.domain, cs)
  switch (rampValue) {
    case 'text-primary': {
      return (
        <em className='text-primary'>{ display(value) }</em>
      )
    }
    case 'text-success': {
      return (
        <span className='text-success'>{ display(value) }</span>
      )
    }
    case null: {
      return (
        <span>{ display(value) }</span>
      )
    }
    case 'text-warning': {
      return (
        <span className='text-warning'>{ display(value) }</span>
      )
    }
    case 'text-danger': {
      return (
        <strong className='text-danger'>{ display(value) }</strong>
      )
    }
  }
}
