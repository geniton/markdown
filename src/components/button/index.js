'use strict'
import React from 'react'
import PropTypes from 'prop-types'
import './button.css'
// <button {...props} className={css({[`-${kind}`] : kind}, 'button')}></button>
const Button = ({kind, className, children, ...props}) => (
  <button {...props} className={className ? (className + `${kind || ''}`) : `button ${kind || ''}`}>
    {children}
  </button>
)

Button.propTypes = {
  children: PropTypes.node.isRequired
}

export default Button
