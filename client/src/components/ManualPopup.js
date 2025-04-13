import React, { Component } from 'react';
import '../css/manualPopup.css';

const ManualPopup = ({ isVisible, page}) => {
        return (
            <div id={`${page ? 'game-manual-popup' : ''}`} className={`manual-popup ${isVisible ? 'visible' : 'hidden'}`}>
                <div id={`${page ? 'game-about-popup-div' : ''}`} className='manual-popup-div'>
                    <h2>Как пользоваться нашим сервисом?</h2>
                    <div className='manual-list'>
                        <div className='manual-item manual-item0'>
                            <p>0. Перейдите в раздел создания головоломки, кликнув 
                                на кнопку</p>
                            <div id={`${page ? 'game-start-button-example' : ''}`} className='start-button-example'>
                                Создать
                            </div>
                        </div>
                        <div className='manual-item  manual-item1'>
                            <p className='manual-item1-text'>1. Нажмите на кнопку</p>
                            <div id={`${page ? 'game-create-puzzle-button-example' : ''}`} className='create-puzzle-button-example'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 30 30' fill="none">
                                    <path fill="#FBFBFE" fill-rule="evenodd" d="M15 .667C7.084.667.667 7.084.667 
                                    15S7.084 29.333 15 29.333 29.333 22.916 29.333 15 22.916.667 15 .667Zm1 9a1 
                                    1 0 1 0-2 0V14H9.666a1 1 0 1 0 0 2H14v4.333a1 1 0 0 0 2 0V16h4.333a1 1 0 0 0
                                    0-2H16V9.667Z" clip-rule="evenodd"/>
                                </svg>
                                <p>Создать головоломку</p>
                            </div>
                        </div>
                        <div id={`${page ? 'game-manual-item2' : ''}`} className='manual-item  manual-item2'>
                            <p>2. Выберите вид головоломки</p>
                            <div>
                                <input type="radio" id="scales" name="scales"/>
                                <label for="scales">Кроссворд</label>
                            </div>
                        </div>                        
                        <div className='manual-item  manual-item3'>
                            <p>3. Выберите вид взаимодействия на своё усмотрение</p>
                        </div>
                        <div className='manual-item  manual-item4'>
                            <p>4. Укажите</p>
                            <div id={`${page ? 'game-count-words-input-example' : ''}`} className='count-words-input-example'>
                                <p className='count-words-input-example-p'>КОЛИЧЕСТВО СЛОВ</p>
                                <input type="number" min="1" step="1"/>
                            </div>
                        </div>
                        <div className='manual-item  manual-item5'>
                            <p>5. Нажмите на кнопку</p>
                            <div className='generate-button-example'>
                                Генерировать
                            </div>
                        </div>
                    </div>
                    <p className='manual-popup-subtitle'>Смена темы</p>
                    <div className='theme-change-manual'>
                        <p>За смену темы отвечает кнопка, где “Луна” - тёмная тема, а “Солнце” 
                            - светлая тема</p>
                        <div id={`${page ? 'game-theme-changer-example' : ''}`} className='theme-changer-example'>
                            <svg className='moon-icon-example' xmlns="http://www.w3.org/2000/svg" viewBox='0 0 28 28' fill="none">
                                <path stroke="#513888" stroke-linecap="round" stroke-linejoin="round" 
                                stroke-width="4" d="M2 13.342C2 20.332 7.667 26 14.658 26c4.97
                                0 9.27-2.864 11.342-7.032C14.658 18.968 9.032 13.342 9.032 2A12.658 12.658 0
                                0 0 2 13.342Z"/>
                            </svg>
                            <svg className='sun-icon-example' xmlns="http://www.w3.org/2000/svg" viewBox='0 0 32 32' fill="none">
                                <g stroke="#513888" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" 
                                clip-path="url(#a)">
                                    <path d="M16 24a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM29.334 16h1.333M16
                                     2.667V1.333M16 30.667v-1.334M26.667 26.667l-1.334-1.334M26.667 
                                     5.333l-1.334 1.334M5.333 26.667l1.334-1.334M5.333 5.333l1.334 
                                     1.334M1.333 16h1.334"/>
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        )
}


export default ManualPopup;