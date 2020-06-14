import React from 'react'
import Button from 'components/button'
import SaveMessage from 'components/saveMessage'

const Header = ({title, isSaving, handleRemove, handleChange, handleCreate}) => (
  <header className='editor-header'>
    <input type="text" name="title" id="title" value={title} onChange={handleChange('title')} placeholder="Sem Titulo"/>
    <SaveMessage isSaving={isSaving} />
    <Button kind={'-success'} onClick={handleCreate}>Criar Novo</Button>
    <Button kind={'-danger'} onClick={handleRemove}>Remove</Button>
  </header>
)

export default Header
