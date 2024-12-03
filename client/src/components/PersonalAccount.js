import React, { useState, useEffect } from 'react';
import Header from './Header';
import ThemeChanger from './ThemeChanger';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PersonalAccount = ({isBlackTheme, toggleTheme, setIsAuth}) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        age: '',
        gender: '',
        occupation: ''
    });
    
    const getProfile = async () => {
        try {
            const response = await axios.get('http://localhost:5000/auth/profile');
            /*setUserData(response.data.user);*/
            const dataAboutUser = response.data.user.user_metadata;
            setUserData({
                username: dataAboutUser.username,
                email: dataAboutUser.email,
                age: dataAboutUser.age,
                gender: dataAboutUser.gender,
                occupation: dataAboutUser.occupation
            });
        } catch (error) {
            console.error('Ошибка при получении данных о пользователе:', error);
        }
    };
    
    useEffect(() => {
        getProfile();
    }, []);

    const logout = async () => {
        try {
            await axios.post('http://localhost:5000/auth/logout');
            setIsAuth(false);
            /*navigate('/login');*/
        } catch (error) {
            console.error('Ошибка при выходе из системы:', error);
        }
    };

    return (
        <>
            <Header/>
            <main className='personal-account-main'>
                <img className='personal-account-back' src='/src/personalAccount-background.jpg'/>
                <section className='about-account-info'>
                    <h1>Личный кабинет</h1>
                    <div className='account-data'>
                        <div className='main-info-about-user'>
                            <div className='user-avatar'>
                                 <p>{userData.username.charAt(0).toUpperCase()}</p>
                                 <p>{userData.username.charAt(1).toUpperCase()}</p>
                            </div>
                            <div className='user-login-email-password'>
                                <p>Логин: {userData.username}</p>
                                <p>Почта: {userData.email}</p>
                                <div className='user-password'>
                                    <p>Пароль: ###########</p>
                                    <svg className='password-edit-icon' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
                                        <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" 
                                        stroke-width="2" d="m14.363 5.652 1.48-1.48a2 2 0 0 1 2.829 0l1.414 1.414a2 
                                        2 0 0 1 0 2.828l-1.48 1.48m-4.243-4.242-9.616 9.615a2 2 0 0 0-.578 1.238l-.242
                                        2.74a1 1 0 0 0 1.084 1.085l2.74-.242a2 2 0 0 0 1.24-.578l9.615-9.616m-4.243-4.242 
                                        4.243 4.242"/>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {/*<div className='user-date-of-birthday'>
                            <p>Дата рождения: 01/01/2000</p>
                        </div>*/}
                        <div className='user-date-of-birthday'>
                            <p>Возраст: {userData?.age}</p>
                        </div>                        
                        <div className='user-role-and-gender'>
                            <p>Роль: {userData?.occupation}</p> 
                            <p>Пол: {userData?.gender}</p>
                        </div>
                        
                        <div className='admin-stats'>
                            <p>Статистика для админов:</p>
                            <p>Сколько использований (хз что тут будет конкретно)</p>
                        </div>
                    </div>
                    <div className='account-buttons'>
                        <button type='submit' className='update-account-button'>
                            Обновить данные
                        </button>
                        <button type='submit' onClick={logout} className='log-out-button'>
                            Выйти из аккаунта
                        </button>
                    </div>
                </section>
                <div className='personal-account-theme-changer'>
                    <ThemeChanger isBlackTheme={isBlackTheme} toggleTheme={toggleTheme}/>
                </div>
                <svg className='personal-account-logotype' xmlns="http://www.w3.org/2000/svg" width="500" height="60" fill="none">
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
            </main>
        </>
    )
}

export default PersonalAccount