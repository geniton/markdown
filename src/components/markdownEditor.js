import React from 'react'
import PropTypes from 'prop-types'
import Header from './markdownEditorHeader.js'

const MarkdownEditor = ({value, handleChange, handleRemove, getMarkup, isSaving}) => {
  return (
    <section className='editor'>
      <Header isSaving={isSaving} handleRemove={handleRemove}/>
      <textarea id=''  cols='30' rows='10' name='textarea' value={value} autoFocus onChange={(e) => handleChange(e)} />
      <article className='view' dangerouslySetInnerHTML={getMarkup()} />
    </section>
  )
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired
}

export default MarkdownEditor
