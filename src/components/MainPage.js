import React, { Component } from 'react'
import Header from './Header'
import Main from './Main'

export class MainPage extends Component {
  render() {
    return (
      <div>
        <Header 
          startApp={this.props.startApp}/>
        <Main isBlackTheme={this.props.isBlackTheme} toggleTheme={this.props.toggleTheme}/>
      </div>
    )
  }
}

export default MainPage