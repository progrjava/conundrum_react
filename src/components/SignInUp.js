import React, { Component } from 'react'
import ThemeChanger from './ThemeChanger'

export class SignInUp extends Component {
  render() {
    return (
      <main className='register-div'>
        <img className='signInUp-back' src='/src/signInUp-background.jpg'/>
        <section className='register-account'>
            <div className='register-account-info'>
                <svg className='back-to-main-page' xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" 
                        stroke-width="4" d="M25 30 15 20l10-10"/>
                </svg>
                <p className='register-title'>Создайте аккаунт</p>
                <div className='if-have-account'>
                    <p>Уже есть аккаунт?</p>
                    <button className='sign-in-button'>
                        Войти!
                    </button>
                </div>
                <div className='reg-input-data'>
                    <input className='reg-login-input' type='text' placeholder='Логин'/>
                    <div className='reg-input-password-div'>
                        <input className='reg-password-input' type='text' placeholder='Пароль'/>
                        <svg className='eye-closed' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke-width="2" color="#000">
                            <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" d="m19.5 16-2.475-3.396M12 17.5V14M4.5 
                                16l2.469-3.388M3 8c3.6 8 14.4 8 18 0"/>
                        </svg>
                    </div>
                </div>
                <div className='birthday-role-gender-input'>
                    <div className='reg-birthday-input'>
                        <input type="date"/>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                            <g stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" opacity=".8">
                                <path d="M15 4V2m0 2v2m0-2h-4.5M3 10v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9H3ZM3 10V6a2 2 0 0 1 2-2h2M7 2v4M21 10V6a2 2 0 0 0-2-2h-.5"/>
                            </g>
                        </svg>
                    </div>
                    <div className='reg-role'>
                        <select className='reg-role-select'>
                            <option disabled selected hidden>Выберите роль</option>
                            <option>Учащийся</option>
                            <option>Преподаватель</option>
                            <option>Лингвист</option>
                            <option>Писатель</option>
                            <option>Журналист</option>
                            <option>Переводчик</option>
                            <option>Кроссвордист</option>
                            <option>Головолом</option>
                            <option>Исследователь</option>
                            <option>Разработчик игр</option>
                            <option>Другое</option>
                        </select>
                    </div>
                    <div className='reg-gender'>
                        <select className='reg-gender-select'>
                            <option disabled selected hidden>Пол</option>
                            <option>Муж.</option>
                            <option>Жен.</option>
                        </select>
                    </div>
                </div>
                <button className='create-account-button'>
                    Создать аккаунт
                </button>
            </div>
        </section>
        <svg className='sign-up-logotype' xmlns="http://www.w3.org/2000/svg" width="500" height="60" fill="none">
            <path fill="#513888" d="M32.052 58.744c-5.793 0-11.158-1.315-16.08-3.944-4.929-2.63-8.819-6.2-11.677-10.709C1.429 
                39.59 0 34.682 0 29.372c0-5.31 1.43-10.217 4.295-14.719 2.858-4.51 6.756-8.072 11.678-10.709C20.893 
                1.314 26.258 0 32.052 0h28.582v27.83H41.827c-.276-1.91-1.238-3.548-2.89-4.9-1.658-1.35-3.553-2.027-5.693-2.027-2.415 
                0-4.478.83-6.198 2.49-1.72 1.66-2.575 3.65-2.575 5.972 0 2.32.856 4.304 2.575 5.956 1.72 1.653 3.783 
                2.476 6.198 2.476 2.163 0 4.089-.69 5.785-2.064 1.69-1.374 2.622-3.034 2.797-4.965h18.808v27.976H32.052ZM88.59 
                60c-3.485 0-6.817-.632-10.004-1.902-3.187-1.271-5.923-2.975-8.208-5.127-2.293-2.152-4.111-4.708-5.464-7.675a22.232 
                22.232 0 0 1-2.033-9.328c0-3.254.68-6.354 2.033-9.306 1.353-2.953 3.18-5.502 5.464-7.639 2.285-2.137 5.029-3.841 
                8.208-5.112 3.187-1.27 6.519-1.902 10.004-1.902 4.654 0 8.934 1.065 12.854 3.195 3.921 2.13 7.024 5.031 9.309 
                8.718 2.285 3.68 3.431 7.697 3.431 12.053 0 3.254-.68 6.36-2.033 9.328-1.352 2.967-3.179 5.523-5.464 7.675-2.293 
                2.152-5.013 3.864-8.17 5.127-3.156 1.27-6.465 1.902-9.927 1.902V60Zm-4.234-27.955c-1.154 1.11-1.735 2.446-1.735 
                3.996 0 1.55.581 2.887 1.735 3.996 1.154 1.109 2.545 1.667 4.157 1.667 1.613 0 2.966-.558 4.127-1.667 1.162-1.11 
                1.735-2.446 1.735-3.996 0-1.55-.58-2.886-1.735-3.995-1.154-1.11-2.53-1.668-4.127-1.668s-3.003.558-4.157 
                1.667ZM116.461 58.744V13.199h51.12v45.545h-21.162V33.999c0-1.219-.412-2.233-1.23-3.048-.818-.815-1.865-1.22-3.133-1.22-1.269 
                0-2.324.405-3.172 1.22-.848.815-1.269 1.829-1.269 3.048v24.745h-21.161.007Z"/>
            <path fill="#ED7E98" d="M221.773 13.199v45.545h-51.12V13.199h21.162v24.744c0 1.22.413 2.233 1.23 3.049.818.815 
                1.865 1.219 3.134 1.219 1.268 0 2.323-.404 3.171-1.22.849-.815 1.269-1.828 1.269-3.048V13.2h21.162-.008Z"/>
            <path fill="#513888" d="M224.83 58.744V13.199h51.12v45.545h-21.162V33.999c0-1.219-.413-2.233-1.231-3.048-.817-.815-1.864-1.22-3.133-1.22s-2.323.405-3.171 
                1.22c-.849.815-1.269 1.829-1.269 3.048v24.745h-21.162.008ZM303.531 58.744c-3.462 0-6.748-.602-9.874-1.814-3.126-1.205-5.808-2.828-8.063-4.862a22.847 
                22.847 0 0 1-5.372-7.242 20.232 20.232 0 0 1-1.995-8.785c0-4.208 1.123-8.064 3.378-11.568 
                2.254-3.503 5.311-6.258 9.178-8.263 3.867-2.005 8.117-3.011 12.74-3.011h4.815V0h21.192v58.744h-26.007.008Zm-4.181-22.776c0 
                1.579.558 2.916 1.682 4.017 1.116 1.102 2.484 1.653 4.104 1.653s3.003-.551 4.157-1.653c1.154-1.101 1.735-2.438 
                1.735-4.017 0-1.58-.581-2.843-1.735-3.945-1.154-1.101-2.545-1.652-4.157-1.652-1.613 0-2.958.543-4.089 1.63-1.131 
                1.088-1.697 2.41-1.697 3.967ZM332.564 58.744V13.199h32.801v17.928h-10.86v27.617h-21.941ZM418.907 
                13.199v45.545h-51.119V13.199h21.161v24.744c0 1.22.413 2.233 1.231 3.049.817.815 1.864 1.219 3.133 
                1.219s2.323-.404 3.172-1.22c.848-.815 1.268-1.828 1.268-3.048V13.2h21.162-.008ZM421.972 
                58.744V13.199H500v45.545h-21.162V33.243c0-.977-.351-1.814-1.047-2.49-.695-.683-1.559-1.021-2.575-1.021-1.017 
                0-1.888.338-2.591 1.02-.703.684-1.062 1.514-1.062 2.49v25.502h-21.162V33.243c0-.977-.344-1.814-1.024-2.49-.688-.683-1.536-1.021-2.552-1.021-1.017 
                0-1.888.338-2.614 1.02-.718.684-1.085 1.514-1.085 2.49v25.502h-21.162.008Z"/>
        </svg>
        <div className='sign-up-theme-changer'>
            <ThemeChanger isBlackTheme={this.props.isBlackTheme} toggleTheme={this.props.toggleTheme}/>
        </div>
      </main>
    )
  }
}

export default SignInUp