import React from 'react';


const ProfileInfo = ({
    userData, 
    newUsername, 
    newOccupation, 
    newGender, 
    onUsernameChange, 
    onOccupationChange, 
    onGenderChange, 
    onUpdateProfile, 
    onLogout 
}) => {
    return (
        <section className='about-account-info'>
            <div className='profile-title'>
                <h1>Личный кабинет</h1>
                <div className='horizontal-line'></div>
            </div>
            <div className='user-data'>
                <div className='user-data-login user-data-item'>
                    <p>Логин</p>
                    <input 
                    className='userdata-input-changer' 
                    type='text' 
                    placeholder={userData.username}
                    value={newUsername}
                    onChange={onUsernameChange}
                    />
                </div>
                <div className='user-data-email user-data-item'>
                    <p>Почта</p>
                    <p className='userdata-input-changer'>{userData.email}</p>
                </div>
                <div className='user-data-role user-data-item'>
                    <p>Роль</p>
                    <div className='reg-role' id='reg-role'>
                        <select 
                            className='reg-role-select' 
                            id='reg-role-select' 
                            required 
                            value={newOccupation}
                            onChange={onOccupationChange}
                        >
                            <option value={''} disabled selected hidden>Выберите роль</option>
                            <option value={'СТУДЕНТ'}>Учащийся</option>
                            <option value={'ПРОФЕССОР'}>Преподаватель</option>
                            <option value={'ЛИНГВИСТ'}>Лингвист</option>
                            <option value={'ПИСАТЕЛЬ'}>Писатель</option>
                            <option value={'ЖУРНАЛИСТ'}>Журналист</option>
                            <option value={'ПЕРЕВОДЧИК'}>Переводчик</option>
                            <option value={'КРОССВОРДИСТ'}>Составитель игр</option>
                            <option value={'ГОЛОВОЛОМ'}>Эрудит</option>
                            <option value={'ИССЛЕДОВАТЕЛЬ'}>Исследователь</option>
                            <option value={'РАЗРАБОТЧИК ИГР'}>Разработчик игр</option>
                            <option value={'НЕ УКАЗАНО'}>Другое</option>
                        </select>
                    </div>
                </div>
                <div className='user-data-gender user-data-item'>
                    <p>Пол</p>
                    <div className='reg-gender' id='reg-gender'>
                        <select 
                            className='reg-gender-select' 
                            id='reg-gender-select' 
                            required 
                            value={newGender}
                            onChange={onGenderChange}
                        >
                            <option value={''} disabled selected hidden>Пол</option>
                            <option value={'МУЖСКОЙ'}>Мужcкой</option>
                            <option value={'ЖЕНСКИЙ'}>Женский</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className='account-buttons'>
                <button type='submit' onClick={onUpdateProfile} className='update-account-button'>
                    Обновить данные
                </button>
                <button type='submit' onClick={onLogout} className='log-out-button'>
                    Выйти
                </button>
            </div>
        </section>
    );
};

export default ProfileInfo;