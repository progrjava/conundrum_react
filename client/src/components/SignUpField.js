import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/signUpField.css';

const SignUpField = ({ isPasswordVisible, togglePasswordVisibility, switchLoginProcess, supabase }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [gender, setGender] = useState('');
    const [occupation, setOccupation] = useState('');    
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!supabase) {
            setMessage('Ошибка инициализации. Попробуйте позже.');
            return;
        }

        if (!username || !email || !password || !gender || !occupation) {
            setMessage('Пожалуйста, заполните все поля');
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        gender,
                        occupation
                    }
                }
            });

            if (error) throw error;

            if (data?.user) {
                setMessage('Регистрация успешна! Проверьте вашу почту для подтверждения.');
                // Подождем немного и перенаправим на страницу входа
                setTimeout(() => {
                    switchLoginProcess();
                }, 3000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (error.message.includes('email')) {
                setMessage('Этот email уже используется');
            } else if (error.message.includes('password')) {
                setMessage('Пароль должен быть не менее 6 символов');
            } else {
                setMessage('Ошибка при регистрации. Попробуйте позже.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const goToMainPage = () => {
        navigate('/');
    };

    return (
        <section className='register-account'>
            <div className='register-account-info'>
                <svg onClick={goToMainPage} className='back-to-main-page' xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                    <path stroke="#FBFBFE" strokeLinecap="round" strokeLinejoin="round" 
                        strokeWidth="4" d="M25 30 15 20l10-10"/>
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
                        <input 
                            className='reg-login-input' 
                            type='text' 
                            placeholder='Имя пользователя' 
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)} 
                            autoComplete='off'
                            disabled={isLoading}
                        />
                        <input 
                            className='reg-login-input' 
                            type='email' 
                            placeholder='Электронная почта' 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} 
                            autoComplete='off'
                            disabled={isLoading}
                        />
                        <div className='reg-input-password-div'>
                            <input 
                                className='reg-password-input' 
                                type={isPasswordVisible ? 'text' : 'password'} 
                                placeholder='Пароль' 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                autoComplete='off'
                                disabled={isLoading}
                            />
                            <svg 
                                className={isPasswordVisible ? 'eye-open' : 'eye-closed'}
                                xmlns="http://www.w3.org/2000/svg"
                                width="24" 
                                height="24" 
                                fill="none" 
                                strokeWidth="2" 
                                color="#000"
                                onClick={togglePasswordVisibility}>
                                {isPasswordVisible ? (
                                    <>
                                        <path stroke="#2F2D38" strokeLinecap="round" strokeLinejoin="round" d="M3 13c3.6-8 14.4-8 18 0"/>
                                        <path stroke="#2F2D38" strokeLinecap="round" strokeLinejoin="round" d="M12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z"/>
                                    </>
                                ) : (
                                    <path stroke="#2F2D38" strokeLinecap="round" strokeLinejoin="round" d="m19.5 16-2.475-3.396M12 17.5V14M4.5 
                                        16l2.469-3.388M3 8c3.6 8 14.4 8 18 0"/>
                                )}
                            </svg>
                        </div>
                    </div>
                    <div className='birthday-role-gender-input'>
                        <div className='reg-role'>
                            <select className='reg-role-select' required value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}>
                    disabled={isLoading}
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
                    disabled={isLoading}
                                <option value={''} disabled selected hidden>Пол</option>
                                <option value={'МУЖСКОЙ'}>Мужской</option>
                                <option value={'ЖЕНСКИЙ'}>Женский</option>
                            </select>
                        </div>
                    </div>
                    {message && <p className='create-account-message'>{message}</p>}
                    <button 
                        type='submit' 
                        className='create-account-button'
                        disabled={isLoading}
                    >
                        {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default SignUpField;
