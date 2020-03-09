import React, { Component } from 'react'
import marked from 'marked'
import MarkdownEditor from './markdownEditor'
import './css/style.css'

import('highlight.js').then(hljs => {
  return marked.setOptions({
    highlight: (code, lang) => {
      if(lang && hljs.getLanguage(lang)){
        return hljs.highlight(lang, code).value
      }
      return hljs.highlightAuto(code).value
    }
  })
})

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
        __html: marked(this.state.value)
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
