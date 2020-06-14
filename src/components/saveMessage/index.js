import React from 'react'
import PropTypes from 'prop-types'
import Button from 'components/button'

const SaveMessage = ({ isSaving }) => (
    isSaving !== null && isSaving !== undefined && <Button className='save'>{isSaving ? 'Salvando...' : 'Salvo'}</Button>
)

SaveMessage.propTypes = {
  isSaving: PropTypes.bool
}

export default SaveMessage
