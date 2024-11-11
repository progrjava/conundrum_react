import React, { Component } from 'react'

export class ManualPopup extends Component {
    render() {
        return (
            <div className={`manual-popup ${this.props.isVisible ? 'visible' : 'hidden'}`}>
                <div className='manual-popup-div'>
                    <h2>Как пользоваться нашим сервисом?</h2>
                    <p>Создание головоломки - кроссворд</p>
                    <div className='manual-list'>
                        <div className='manual-item'>
                            <p>0. Перейдите в раздел создания головоломки, кликнув 
                                на кнопку</p>
                            <div className='start-button-example'>
                                Начать
                            </div>
                        </div>
                        <div className='manual-item'>
                            <p>1. Нажмите на кнопку</p>
                            <div className='create-puzzle-button-example'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none">
                                    <path fill="#FBFBFE" fill-rule="evenodd" d="M15 .667C7.084.667.667 7.084.667 
                                    15S7.084 29.333 15 29.333 29.333 22.916 29.333 15 22.916.667 15 .667Zm1 9a1 
                                    1 0 1 0-2 0V14H9.666a1 1 0 1 0 0 2H14v4.333a1 1 0 0 0 2 0V16h4.333a1 1 0 0 0
                                    0-2H16V9.667Z" clip-rule="evenodd"/>
                                </svg>
                                <p>Создать головоломку</p>
                            </div>
                        </div>
                        <div className='manual-item'>
                            <p>2. Выберите вид головоломки</p>
                            <div>
                                <input type="checkbox" id="scales" name="scales" unchecked />
                                <label for="scales">Кроссворд</label>
                            </div>
                        </div>                        
                        <div className='manual-item'>
                            <p>3. Выберите вид взаимодействия на своё усмотрение</p>
                        </div>
                        <div className='manual-item'>
                            <p>4. Укажите</p>
                            <div className='count-words-input-example'>
                                <p>КОЛИЧЕСТВО СЛОВ</p>
                                <input type='number' min={1} max={30}></input>
                            </div>
                        </div>
                        <div className='manual-item'>
                            <p>5. Нажмите на кнопку</p>
                            <button className='generate-button-example'>
                                Генерировать
                            </button>
                        </div>
                    </div>
                    <p>Смена темы</p>
                    <div className='theme-change-manual'>
                        <p>За смену темы отвечает кнопка, где “Луна” - тёмная тема, а “Солнце” 
                            - светлая тема</p>
                        <div className='theme-changer-example'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none">
                                <path stroke="#513888" stroke-linecap="round" stroke-linejoin="round" 
                                stroke-width="4" d="M2 13.342C2 20.332 7.667 26 14.658 26c4.97
                                0 9.27-2.864 11.342-7.032C14.658 18.968 9.032 13.342 9.032 2A12.658 12.658 0
                                0 0 2 13.342Z"/>
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                <g stroke="#513888" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" 
                                clip-path="url(#a)">
                                    <path d="M16 24a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM29.334 16h1.333M16
                                     2.667V1.333M16 30.667v-1.334M26.667 26.667l-1.334-1.334M26.667 
                                     5.333l-1.334 1.334M5.333 26.667l1.334-1.334M5.333 5.333l1.334 
                                     1.334M1.333 16h1.334"/>
                                </g>
                                <defs>
                                    <clipPath id="a">
                                        <path fill="#fff" d="M0 0h32v32H0z"/>
                                    </clipPath>
                                </defs>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ManualPopup