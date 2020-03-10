import React from 'react'

const Header = ({isSaving, handleRemove}) => (
  <header className='editor-header'>
    <button className='save'>{isSaving ? 'Salvando...' : 'Salvo'}</button>
    <button className="button-remove" onClick={handleRemove}>Remove</button>
  </header>
)

export default Header