import React, { Component } from 'react'

export class SignUpField extends Component {
  render() {
    return (
        <section className='register-account'>
            <div className='register-account-info'>
                <svg className='back-to-main-page' xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" onClick={this.props.goToMainPage}>
                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" 
                        stroke-width="4" d="M25 30 15 20l10-10"/>
                </svg>
                <p className='register-title'>Создайте аккаунт</p>
                <div className='if-have-account'>
                    <p>Уже есть аккаунт?</p>
                    <button className='sign-in-button' onClick={this.props.switchLoginProcess}>
                        Войти!
                    </button>
                </div>
                <form id="register-form">
                    <div className='reg-input-data'>
                        <input type="text" className='reg-username-input' id="register-username" placeholder="Имя пользователя" required/>
                        <input className='reg-login-input' id="register-email" type='email' placeholder='Электронная почта' required/>
                        <div className='reg-input-password-div'>
                            <input className='reg-password-input' id="register-password" type={this.props.isPasswordVisible ? 'text' : 'password'} 
                            placeholder='Пароль' required/>
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
                    <div className='birthday-role-gender-input'>
                        <div className='reg-birthday-input'>
                            <input type="date" id="register-age"/>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                                <g stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity=".8">
                                    <path d="M15 4V2m0 2v2m0-2h-4.5M3 10v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H3ZM3 10V6a2 2 0 0 1 2-2h2M7 2v4M21 10V6a2 2 0 0 0-2-2h-.5"/>
                                </g>
                            </svg>
                        </div>
                        <div className='reg-role'>
                            <select className='reg-role-select' id="register-occupation">
                                <option value='' disabled selected hidden>Выберите роль</option>
                                <option value="student">Учащийся</option>
                                <option value="professor">Преподаватель</option>
                                <option value="linguist">Лингвист</option>
                                <option value="writer">Писатель</option>
                                <option value="journalist">Журналист</option>
                                <option value="translator">Переводчик</option>
                                <option value="crossword_creator">Кроссвордист</option>
                                <option value="puzzle_enthusiast">Головолом</option>
                                <option value="researcher">Исследователь</option>
                                <option value="game_developer">Разработчик игр</option>
                                <option value='other'>Другое</option>
                            </select>
                        </div>
                        <div className='reg-gender'>
                            <select className='reg-gender-select' id="register-gender">
                                <option value='' disabled selected hidden>Пол</option>
                                <option value='male'>Муж.</option>
                                <option value='female'>Жен.</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className='create-account-button' onClick={this.props.logInAndLogOut}>
                        Создать аккаунт
                    </button>
                </form>
            </div>
        </section>
    )
  }
}

export default SignUpField