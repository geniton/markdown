import React from 'react'
import { storiesOf, action } from '@storybook/react'
import Button from './index'

const stories = storiesOf('Button', module)

stories.addDecorator((story) => {
  return <div style={{display: 'flex', height: 40}}>
    {story()}
  </div>
})

stories.add('Button success', () => (
  <Button onClick={action('success')} kind='-success'>Success</Button>
))

stories.add('Button danger', () => (
  <Button onClick={action('danger')} kind='-danger'>Danger</Button>
))
