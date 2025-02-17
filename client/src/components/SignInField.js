import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabaseClient } from '../config/supabaseClient';
import '../css/signInField.css';

const SignInField = ({ isPasswordVisible, togglePasswordVisibility, switchLoginProcess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const supabase = await getSupabaseClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setMessage(error.message);
                return;
            }

            if (data?.user) {
                setMessage('Вход успешен!');
                navigate('/account');
            }
        } catch (error) {
            setMessage('Ошибка входа');
            console.error('Login error:', error);
        }
    };

    const goToMainPage = () => {
        navigate('/'); 
    };

    return (
        <section className='login-account'>
            <div className='login-account-info'>
                <svg onClick={goToMainPage} className='back-to-main-page' xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                    <path stroke="#FBFBFE"  stroke-linecap="round" stroke-linejoin="round" 
                        stroke-width="4" d="M25 30 15 20l10-10"/>
                </svg>
                <p className='login-title'>Здравствуйте!</p>
                <div className='if-have-not-account'>
                    <p>У вас нет аккаунта?</p>
                    <button className='sign-up-button' onClick={switchLoginProcess}>
                        Зарегистрироваться!
                    </button>
                </div>
                <form className='login-form' onSubmit={handleLogin}>
                    <div className='log-input-data'>
                        <input 
                            className='log-login-input' 
                            type='email' 
                            placeholder='Электронная почта' 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <div className='log-input-password-div'>
                            <input 
                                className='log-password-input' 
                                type={isPasswordVisible ? 'text' : 'password'} 
                                placeholder='Пароль' 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
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
                                        <path stroke="#2F2D38"  stroke-linecap="round" stroke-linejoin="round" d="M3 13c3.6-8 14.4-8 18 0"/>
                                        <path stroke="#2F2D38"  stroke-linecap="round" stroke-linejoin="round" d="M12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                                    </>
                                ) : (
                                    <path stroke="#2F2D38"  stroke-linecap="round" stroke-linejoin="round" d="m19.5 16-2.475-3.396M12 17.5V14M4.5 
                                        16l2.469-3.388M3 8c3.6 8 14.4 8 18 0"/>
                                )}
                            </svg>
                        </div>
                    </div>
                    {message && <p className='login-message'>{message}</p>}
                    <button type='submit' className='login-account-button'>
                        Войти
                    </button>
                </form>
            </div>
        </section>
    );
};

export default SignInField;