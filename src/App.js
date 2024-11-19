import React, { Component } from 'react'
import SignInUp from './components/SignInUp';
import MainPage from './components/MainPage';
import PersonalAccount from './components/PersonalAccount';

export class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      isBlackTheme: true,
      isStarted: false,
      isLoggedIn: false,
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

  logInAndLogOut = () => {
    this.setState(prevState => ({
        isLoggedIn: !prevState.isLoggedIn,
    }));
  }


  render() {
    const themeClass = this.state.isBlackTheme ? 'black-theme' : 'white-theme';
    return (
      <div className={themeClass}>
        {this.state.isStarted ? (
          !this.state.isLoggedIn ? (
            <SignInUp
            goToMainPage={this.goToMainPage} 
            isBlackTheme={this.state.isBlackTheme} 
            toggleTheme={this.toggleTheme}
            logInAndLogOut={this.logInAndLogOut}/>
          ) : (
            <PersonalAccount
            startApp={this.startApp} 
            isBlackTheme={this.state.isBlackTheme}
            toggleTheme={this.toggleTheme}
            logInAndLogOut={this.logInAndLogOut}/>
          )
        ) : (
          <MainPage 
          startApp={this.startApp} 
          isBlackTheme={this.state.isBlackTheme}
          toggleTheme={this.toggleTheme}/>
        )}
      </div>
    )
  }
}

export default App
