import React from 'react'
import PropTypes from 'prop-types'
import Header from './header'
import Files from './files'

const MarkdownEditor = ({textarea, title, getMarkup, handleChange, handleOpenFile, files, textareaRef, ...props}) => {
  return (
    <section className='editor'>
      <Header {...props} handleChange={handleChange} title={title}/>
      <Files handleOpenFile={handleOpenFile} files={files} />
      <textarea id='' cols='30' rows='10' name='textarea' value={textarea} autoFocus ref={textareaRef} onChange={handleChange('textarea')} />
      <article className='view' dangerouslySetInnerHTML={getMarkup()} />
    </section>
  )
}

MarkdownEditor.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  kind: PropTypes.oneOf(['success', 'danger'])
}

export default MarkdownEditor
