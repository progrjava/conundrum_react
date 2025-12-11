import React, { Component } from 'react';
import '../css/manualPopup.css';

const ManualPopup = ({ isVisible, page}) => {
        return (
            <div id={`${page ? 'game-manual-popup' : ''}`} className={`manual-popup ${isVisible ? 'visible' : 'hidden'}`}>
                <div id={`${page ? 'game-about-popup-div' : ''}`} className='manual-popup-div'>
                    <div className='content-wrapper'>
                        <div id={`${page ? 'game-manual-popup-paragraphs' : ''}`} className='manual-popup-paragraphs'>
                            <h3 style={{textAlign: 'center'}}>Как пользоваться нашим сервисом?</h3>
                            <p>Шаг 1. Зарегистрируйтесь и войдите в аккаунт, без этого мы не допустим вас к магии!</p>
                            <div className='manual-popup-paragraphs-divider'></div>
                            <p>Шаг 2. Перейдите на страницу генератора головоломок, кликнув на волшебную палочку.</p> 
                            <div className='manual-popup-paragraphs-divider'></div>                     
                            <p>Шаг 3. Откройте меню, кликнув на кнопку "Создать головоломку"</p>
                            <div className='manual-popup-paragraphs-divider'></div>
                            <p>Шаг 4. Теперь введите название, выберите вид головоломки, задайте тему/текст или загрузите файл с текстом, введите количество слов, при желании вы можете выбрать сложность.</p>
                            <div className='manual-popup-paragraphs-divider'></div>
                            <p>Шаг 5. Нажмите на кнопку генерировать, и готово!</p>
                            <div className='manual-popup-paragraphs-divider'></div>
                            <p>Шаг 6. После завершения генерации можете изменить текст вопроса и ответа, сохранить головоломку, а также скачать ее!</p>
                        </div>
                    </div>
                </div>
            </div>
        )
}


export default ManualPopup;