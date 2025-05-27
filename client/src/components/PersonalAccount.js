import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import ThemeChanger from './ThemeChanger';
import '../css/profile.css';
import ProfileLogotype from '../assets/svg/ProfileLogotype';
import { getSupabaseClient } from '../config/supabaseClient';
import ProfileInfo from './ProfileInfo';
import SavedPuzzles from './SavedPuzzles';

const PersonalAccount = ({ isBlackTheme, toggleTheme, user }) => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        gender: '',
        occupation: ''
    });
    const [error, setError] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [newOccupation, setNewOccupation] = useState('');
    const [newGender, setNewGender] = useState('');

    const getProfile = async () => {
         try {
                if (!user) {
                    setError('Пользователь не авторизован');
                    return;
                }
            const supabase = await getSupabaseClient();
                 // Получаем актуальные данные пользователя из Supabase
                const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

            if (userError) throw userError;
            if (currentUser) {
                    const username = currentUser.user_metadata?.username || 'Не указано';

                    setUserData({
                        email: currentUser.email,
                        username: username,
                        gender: currentUser.user_metadata?.gender || 'Не указано',
                        occupation: currentUser.user_metadata?.occupation || 'Не указано'
                    });
                    setNewUsername(username);
                    setNewOccupation(currentUser.user_metadata?.occupation || 'НЕ УКАЗАНО');
                    setNewGender(currentUser.user_metadata?.gender || 'НЕ УКАЗАНО');
                }

        } catch (error) {
             console.error('Error loading user data:', error);
                setError('Ошибка при загрузке данных пользователя');
        }
          finally {
                setIsLoading(false);
            }
    };

    useEffect(() => {
        getProfile();
    }, [user]);

    const updateProfile = async () => {
       try {
                const supabase = await getSupabaseClient();
                
                // Обновляем данные в Supabase
                const { error } = await supabase.auth.updateUser({
                    data: {
                        username: newUsername,
                        gender: newGender,
                        occupation: newOccupation
                    }
                });

                if (error) throw error;

                // Обновляем локальное состояние
                setUserData(prevData => ({
                    ...prevData,
                    username: newUsername,
                    gender: newGender,
                    occupation: newOccupation
                }));

                alert('Профиль успешно обновлен!');
                
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Ошибка при обновлении данных');
            alert('Произошла ошибка при обновлении профиля');
        }
    };

    const logout = async () => {
        try {
                const supabase = await getSupabaseClient();
            const { error } = await supabase.auth.signOut();
           if (error) throw error;
            navigate('/');
        } catch (error) {
           console.error('Ошибка при выходе из системы:', error);
            setError('Ошибка при выходе из системы');
            // Если произошла ошибка с сессией, все равно перенаправляем
            setTimeout(() => navigate('/'), 2000);
        }
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <>
            <Header isAuth={true}/>
            <main className='personal-account-main'>
                <img className='personal-account-back' src='/src/personalAccount-background.jpg'/>
                    {isLoading 
                        ? 
                            <div class="loading-spinner-profile">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                                    <path fill="#FBFBFE" stroke="#FBFBFE" stroke-width="15" 
                                        d="M148 84.7l13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z">
                                    </path>
                                </svg>
                            </div>
                        :
                        <section className='profile-and-games'>
                            <ProfileInfo
                                userData={userData}
                                newUsername={newUsername}
                                newOccupation={newOccupation}
                                newGender={newGender}
                                onUsernameChange={(e) => setNewUsername(e.target.value)}
                                onOccupationChange={(e) => setNewOccupation(e.target.value)}
                                onGenderChange={(e) => setNewGender(e.target.value)}
                                onUpdateProfile={updateProfile}
                                onLogout={logout}
                            />
                            <SavedPuzzles />
                        </section>
                    }
                <div className='personal-account-theme-changer'>
                    <ThemeChanger isBlackTheme={isBlackTheme} toggleTheme={toggleTheme}/>
                </div>
                <ProfileLogotype/>
            </main>
        </>
    )
}

export default PersonalAccount;