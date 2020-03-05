'use strict'

import React, { PureComponent } from 'react'

import './css/style.css'

class App extends PureComponent {
  constructor () {
    super()

    this.state = {
      title: '...',
      component: 'div',
      count: 0
    }
  }
  getTitle () {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('opa oi')
      }, 2000)
    })
  }
  // async componentDidMount () {
  //   const component = await import('./components/title');

  //   let result = this.state.title

  //   try{
  //     result = await this.getTitle()
  //     this.setState({
  //       title: result,
  //       component: component.default
  //     })

  //   }catch(error){

  //     console.log(error)
  //   }
  // }
  componentDidMount () {
    this.setState((state) => ({count: state.count + 1}))
    this.setState((state) => ({count: state.count + 1}))
    this.setState((state) => ({count: state.count + 1}))
  }
  // para poder usar async await em componentdidmount precisa instalar as dependicias babel-plugin-transform-runtime e o babel-runtime e add em plugins .babelrc
  // ["transform-runtime", { "helpers": false, "polyfill": false, "regenerator": true}]
  render () {
    return (
    // <this.state.component>{this.state.title}</this.state.component>
      <div>
        {this.state.count}
      </div>
    )
  }
}

export default App
