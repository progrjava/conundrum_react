import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../css/signUpField.css';

const SignUpField = ({ isPasswordVisible, togglePasswordVisibility, switchLoginProcess, setIsAuth }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [occupation, setOccupation] = useState('');    
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/auth/register', {
                username,
                email,
                password,
                occupation,
                gender
            });
            setMessage(response.data.message);
            if (response.status === 200) {
                setIsAuth(true);
                /*navigate(`/account`);*/
            }
        } catch (error) {
            setMessage(error.response?.data?.error || 'Ошибка регистрации');
        }
    };

    const goToMainPage = () => {
        navigate('/');
    };

    return (
        <section className='register-account'>
            <div className='register-account-info'>
                <svg onClick={goToMainPage} className='back-to-main-page' xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" 
                        stroke-width="4" d="M25 30 15 20l10-10"/>
                </svg>
                <p className='register-title'>Создайте аккаунт</p>
                <div className='if-have-account'>
                    <p>Уже есть аккаунт?</p>
                    <button className='sign-in-button' onClick={switchLoginProcess}>
                        Войти!
                    </button>
                </div>
                <form className='register-form' onSubmit={handleRegister}>
                    <div className='reg-input-data'>
                        <input className='reg-login-input' type='text' placeholder='Имя пользователя' required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} autoComplete='off'/>
                        <input className='reg-login-input' type='text' placeholder='Электронная почта' required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} autoComplete='off'/>
                        <div className='reg-input-password-div'>
                            <input className='reg-password-input' type={isPasswordVisible ? 'text' : 'password'} 
                            placeholder='Пароль' required value={password}
                            onChange={(e) => setPassword(e.target.value)} autoComplete='off'/>
                            <svg 
                                className={isPasswordVisible ? 'eye-open' : 'eye-closed'}
                                xmlns="http://www.w3.org/2000/svg"
                                width="24" 
                                height="24" 
                                fill="none" 
                                stroke-width="2" 
                                color="#000"
                                onClick={togglePasswordVisibility}>
                                {isPasswordVisible ? (
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
                        <div className='reg-role'>
                            <select className='reg-role-select' required value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}>
                                <option value={''} disabled selected hidden>Выберите роль</option>
                                <option value={'СТУДЕНТ'}>Учащийся</option>
                                <option value={'ПРОФЕССОР'}>Преподаватель</option>
                                <option value={'ЛИНГВИСТ'}>Лингвист</option>
                                <option value={'ПИСАТЕЛЬ'}>Писатель</option>
                                <option value={'ЖУРНАЛИСТ'}>Журналист</option>
                                <option value={'ПЕРЕВОДЧИК'}>Переводчик</option>
                                <option value={'КРОССВОРДИСТ'}>Составитель кроссвордов</option>
                                <option value={'ГОЛОВОЛОМ'}>Любитель головоломок</option>
                                <option value={'ИССЛЕДОВАТЕЛЬ'}>Исследователь</option>
                                <option value={'РАЗРАБОТЧИК ИГР'}>Разработчик игр</option>
                                <option value={'НЕ УКАЗАНО'}>Другое</option>
                            </select>
                        </div>
                        <div className='reg-gender'>
                            <select className='reg-gender-select' required value={gender}
                    onChange={(e) => setGender(e.target.value)}>
                                <option value={''} disabled selected hidden>Пол</option>
                                <option value={'МУЖСКОЙ'}>Мужской</option>
                                <option value={'ЖЕНСКИЙ'}>Женский</option>
                            </select>
                        </div>
                    </div>
                    {message && <p className='create-account-message'>{message}</p>}
                    <button type='submit' className='create-account-button'>
                        Создать аккаунт
                    </button>
                </form>
            </div>
        </section>
    )
}

export default SignUpField

