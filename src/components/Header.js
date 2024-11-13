import React, { Component } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';

export class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isAboutVisible: false,
            isManualVisible: false,
        };
    }

    toggleAboutPopup = () => {
        this.setState(prevState => ({
            isAboutVisible: !prevState.isAboutVisible,
            isManualVisible: false,
        }));
    };

    toggleManualPopup = () => {
        this.setState(prevState => ({
            isManualVisible: !prevState.isManualVisible,
            isAboutVisible: false,
        }));
    };

    render() {
        return (
            <header>
                <button className='start-button'>Начать</button>
                <button className={`about-button ${this.state.isAboutVisible ? 'pressed' : ''}`} onClick={this.toggleAboutPopup}>О проекте</button>
                <button className={`manual-button ${this.state.isManualVisible ? 'pressed' : ''}`} onClick={this.toggleManualPopup}>Инструкция</button>
                <AboutPopup isVisible={this.state.isAboutVisible}/>
                <ManualPopup isVisible={this.state.isManualVisible}/>
            </header>
        )
    }
}

export default Header