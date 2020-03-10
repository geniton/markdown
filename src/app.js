import React, { Component } from 'react'
import marked from 'marked'
import MarkdownEditor from './components/markdownEditor'
import './css/style.css'

import('highlight.js').then(hljs => {
  return marked.setOptions({
    highlight: (code, lang) => {
      if (lang && hljs.getLanguage(lang)) {
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
      value: '',
      isSaving: false
    }

    this.handleChange = (e) => {
      e.preventDefault()
      const value = e.target.value
      this.setState({
        value,
        isSaving: true
      })
    }

    this.handleSave = () => {
      if(this.state.isSaving){
        localStorage.setItem('md', this.state.value)
        this.setState({
          isSaving: false
        })
      }
    }

    this.handleRemove = () => {
      localStorage.removeItem('md')
      this.setState({value : ''})
    }
    

    this.getMarkup = () => {
      return {
        __html: marked(this.state.value)
      }
    }
  }

  componentDidMount () {
    const value = localStorage.getItem('md')
    this.setState({
        value: value || ''
      })
  }

  componentDidUpdate () {
    console.log('oi')
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.handleSave()
    },500)
  }

  render () {
    return (
      <MarkdownEditor
        handleChange={this.handleChange}
        value={this.state.value}
        isSaving={this.state.isSaving}
        getMarkup={this.getMarkup}
        handleRemove={this.handleRemove}
        />
    )
  }
}

export default App
