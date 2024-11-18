import React, { Component } from 'react'
import SignInUp from './components/SignInUp';
import MainPage from './components/MainPage';

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
  
  goToMainPage = () => {
    this.setState({isStarted : false})
  }

  render() {
    const themeClass = this.state.isBlackTheme ? 'black-theme' : 'white-theme';

    return (
      <div className={themeClass}>
        {this.state.isStarted ? (
          <SignInUp goToMainPage={this.goToMainPage} isBlackTheme={this.state.isBlackTheme} toggleTheme={this.toggleTheme} startApp={this.startApp}/>
        ) : (
          <MainPage startApp={this.startApp} isBlackTheme={this.state.isBlackTheme} toggleTheme={this.toggleTheme}/>
        )}
      </div>
    )
  }
}

export default App
