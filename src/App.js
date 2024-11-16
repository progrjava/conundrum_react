import React, { Component } from 'react'
import Header from './components/Header'
import Main from './components/Main'
import SignInUp from './components/SignInUp';

export class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      isBlackTheme: true,
      isStarted: false,
    };
  }

  toggleTheme = (isBlackTheme) => {
    this.setState({ isBlackTheme });
  };

  startApp = () => {
    this.setState({isStarted : true})
  }
  

  render() {
    const themeClass = this.state.isBlackTheme ? 'black-theme' : 'white-theme';

    return (
      <div className={themeClass}>
        {this.state.isStarted ? (
          <SignInUp isBlackTheme={this.state.isBlackTheme} toggleTheme={this.toggleTheme}/>
        ) : (
          <>
            <Header startApp={this.startApp}/>
            <Main isBlackTheme={this.state.isBlackTheme} toggleTheme={this.toggleTheme}/>
          </>
        )}
      </div>
    )
  }
}

export default App
