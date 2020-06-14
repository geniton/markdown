import React, { Component } from 'react'

import marked from 'marked'
import MarkdownEditor from 'views/markdown'
import { v4 } from 'node-uuid'

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

    this.clearState = () => ({
      textarea: '',
      id: v4()
    })

    this.state = {
      ...this.clearState(),
      isSaving: null,
      title: '',
      files: {},
      textarea: ''
    }

    this.handleChange = (field) => (e) => {

      e.preventDefault()
      
      const value = e.target.value

      this.setState({
        ...this.state,
        [field]: value,
        isSaving: true
      })
    }

    this.handleSave = () => {
      if (this.state.isSaving) {
        const file = {
          ...this.state.files,
          [this.state.id]: {
            title: this.state.title || 'Sem Titulo',
            content: this.state.textarea
          }
        }
        localStorage.setItem('markdown-editor', JSON.stringify(file))
        this.setState({
          isSaving: false,
          files: file
        })
      }
    }

    this.createNew = () => {
      this.setState(this.clearState())
      this.textarea.focus()
    }

    this.handleCreate = () => {
      this.createNew()
    }

    this.textareaRef = (node) => {
      this.textarea = node
    }

    this.handleRemove = () => {
      // 1 opção
      // let files = {...this.state.files}
      // delete files[this.state.id]

      // 2 opção
      // let files = Object.keys(this.state.files).reduce((acc, fileId) => {
      //   return fileId === this.state.id ? acc : {
      //     ...acc,
      //     [fileId]: this.state.files[fileId]
      //   }
      // }, {})
      //3 opção
      const {[this.state.id]: id, ...files } = this.state.files

      localStorage.setItem('markdown-editor',JSON.stringify(files))
      
      this.setState({
        ...this.state,
        files
      })
      this.createNew()
    }

    this.handleOpenFile = (fileId) => () => {
      const file = this.state.files[fileId]
      if (!file) return

      this.setState({
        textarea: file.content,
        id: fileId,
        title: file.title
      })
    }

    this.getMarkup = () => {
      return {
        __html: marked(this.state.textarea)
      }
    }
  }

  componentDidMount () {
    const itens = localStorage.getItem('markdown-editor')
    this.setState({
      ...this.state,
      files: JSON.parse(itens)
    })

    // this.setState({
    //   files: itens.filter((el) => el.match(/^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/)).reduce((acc, item) => ({
    //     ...acc,
    //     [item]: JSON.parse(localStorage.getItem(item))
    //   }), {})
    // })
  }

  componentDidUpdate () {
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.handleSave()
    }, 500)
  }

  componentWillUnmount(){
    clearInterval(this.timer)
  }

  render () {
    const { 
      textarea, 
      isSaving, 
      files, 
      title,
      id
    } = this.state

    return (
      <MarkdownEditor
        textarea={textarea}
        isSaving={isSaving}
        getMarkup={this.getMarkup}
        handleChange={this.handleChange}
        handleRemove={this.handleRemove}
        handleCreate={this.handleCreate}
        handleOpenFile={this.handleOpenFile}
        files={files || {}}
        textareaRef={this.textareaRef}
        title={title}
        id={id}
        />
    )
  }
}

export default App
