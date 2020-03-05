import React, { Component } from 'react'
import Marked from 'marked'
import MarkdownEditor from './markdownEditor'
import './css/style.css'

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: ''
    }

    this.handleChange = (e) => {
      e.preventDefault()
      const value = e.target.value
      this.setState({
        value
      })
    }

    this.getMarkup = () => {
      return {
        __html: Marked(this.state.value)
      }
    }
  }

  render () {
    return (
      <MarkdownEditor
        handleChange={this.handleChange}
        value={this.state.value}
        getMarkup={this.getMarkup}
        />
    )
  }
}

export default App
