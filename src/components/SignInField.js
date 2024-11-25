import React, { Component } from 'react'

export class SignInField extends Component {
  render() {
    return (
        <section className='login-account'>
            <div className='login-account-info'>
                <svg className='back-to-main-page' xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" onClick={this.props.goToMainPage}>
                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" 
                        stroke-width="4" d="M25 30 15 20l10-10"/>
                </svg>
                <p className='login-title'>Здравствуйте!</p>
                <div className='if-have-not-account'>
                    <p>У вас нет аккаунта?</p>
                    <button className='sign-up-button' onClick={this.props.switchLoginProcess}>
                        Зарегистрироваться!
                    </button>
                </div>
                <form id="login-form">
                    <div className='log-input-data'>
                        <input className='log-login-input' id="login-email" type='email' placeholder='Электронная почта' required/>
                        <div className='log-input-password-div'>
                            <input className='log-password-input' type={this.props.isPasswordVisible ? 'text' : 'password'} 
                            placeholder='Пароль' id="login-password" required/>
                            <svg 
                                className={this.props.isPasswordVisible ? 'eye-open' : 'eye-closed'}
                                xmlns="http://www.w3.org/2000/svg"
                                width="24" 
                                height="24" 
                                fill="none" 
                                stroke-width="2" 
                                color="#000"
                                onClick={this.props.togglePasswordVisibility}>
                                {this.props.isPasswordVisible ? (
                                    <>
                                        <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" d="M3 13c3.6-8 14.4-8 18 0"/>
                                        <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" d="M12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                                    </>
                                ) : (
                                    <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" d="m19.5 16-2.475-3.396M12 17.5V14M4.5 
                                        16l2.469-3.388M3 8c3.6 8 14.4 8 18 0"/>
                                )}
                            </svg>
                        </div>
                    </div>
                    <button type="submit" className='login-account-button' onClick={this.props.logInAndLogOut}>
                        Войти
                    </button>
                </form>
            </div>
        </section>
    )
  }
}

export default SignInField