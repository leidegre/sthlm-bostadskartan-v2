
import React, { Component } from 'react'

const classNameList = ['text-primary', 'text-success', null, 'text-warning', 'text-danger']
const reverseClassNameList = [].concat(classNameList)
reverseClassNameList.reverse()

export function Colorize(props) {
  const value = props.value
  const domain = props.domain
  const display = props.display || ((x) => x.toFixed(props.digits || 0))
  const cs = (props.reverseDomain ? reverseClassNameList : classNameList)
  // Less than 2 stdev
  if (value <= (domain.avg - 2 * domain.stdev)) {
    return (
      <em className={cs[0]}>{ display(value) }</em>
    )
  }
  // Less than 1 stdev
  if (value <= (domain.avg - 1 * domain.stdev)) {
    return (
      <span className={cs[1]}>{ display(value) }</span>
    )
  }
  // Within than 1 stdev
  if (value <= (domain.avg + 1 * domain.stdev)) {
    return (
      <span>{ display(value) }</span>
    )
  }
  // Greater than 1 stdev
  if (value <= (domain.avg + 2 * domain.stdev)) {
    return (
      <span className={cs[3]}>{ display(value) }</span>
    )
  }
  // Greater than 2 stdev
  return (
    <strong className={cs[4]}>{ display(value) }</strong>
  )
}
