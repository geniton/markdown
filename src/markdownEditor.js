import React from 'react'
import PropTypes from 'prop-types'

const MarkdownEditor = ({value, handleChange, getMarkup}) => {
  return (
    <div className='editor'>
      <textarea id='' cols='30' rows='10' name='textarea' value={value} autoFocus onChange={(e) => handleChange(e)} />
      <div className='view' dangerouslySetInnerHTML={getMarkup()} />
    </div>
  )
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired
}

export default MarkdownEditor
