import React, { Component } from 'react'
import Header from './components/Header'
import Main from './components/Main'

export class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      isBlackTheme: true,
    };
  }

  toggleTheme = (isBlackTheme) => {
    this.setState({ isBlackTheme });
  };

  render() {
    const themeClass = this.state.isBlackTheme ? 'black-theme' : 'white-theme';

    return (
      <div className={themeClass}>
        <Header/>
        <Main isBlackTheme={this.state.isBlackTheme} toggleTheme={this.toggleTheme}/>
      </div>
    )
  }
}

export default App
