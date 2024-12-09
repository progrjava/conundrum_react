import React, { useState, useEffect } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { useNavigate } from 'react-router-dom';
import ThemeChanger from './ThemeChanger';

const GameGenerator = ({ isBlackTheme, toggleTheme }) => {
    const [isAboutVisible, setIsAboutVisible] = useState(false);
    const [isManualVisible, setIsManualVisible] = useState(false);
    const [isSlidebarVisible, setIsSlidebarVisible] = useState(true);
    const [isFormCreatingPuzzle, setIsFormCreatingPuzzle] = useState(false);
    const [selectedInteractionFormat, setSelectedInteractionFormat] = useState('');
    const navigate = useNavigate();

    const toggleAboutPopup = () => {
        setIsAboutVisible(!isAboutVisible);
        setIsManualVisible(false);
      };
    
      const toggleManualPopup = () => {
        setIsManualVisible(!isManualVisible);
        setIsAboutVisible(false);
      };

    const navToProfile = () => navigate('/account');

    const toggleSlidebar = () => {
        setIsSlidebarVisible(!isSlidebarVisible);
    };

    const toggleFormCreatingPuzzle = () => {
        setIsFormCreatingPuzzle(!isFormCreatingPuzzle);
    };

    const handleInteractionFormatChange = (event) => {
        setSelectedInteractionFormat(event.target.id);
    };

    return (
        <>
            <header className={`main-page-header ${isAboutVisible || isManualVisible ? 'hidden' : ''}`} id='game-header'>
                <div className='go-to-profile' id='game-go-to-profile' onClick={navToProfile}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                        <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 33.333v-1.666C8 25.223 13.223 20 19.667 20c6.443 0 11.666 5.223 11.666 11.667v1.666"/>
                        <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M19.667 20a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333Z"/>
                    </svg>
                </div>
                <button id='game-about-popup-button' className={`about-button ${isAboutVisible ? 'pressed' : ''}`} onClick={toggleAboutPopup}>О проекте</button>
                <button id='game-manual-popup-button' className={`manual-button ${isManualVisible ? 'pressed' : ''}`} onClick={toggleManualPopup}>Инструкция</button>
                <AboutPopup isVisible={isAboutVisible} page='game'/>
                <ManualPopup isVisible={isManualVisible} page='game'/>
            </header>
            <main id='game-main-page'>
                <svg id='game-logotype' xmlns="http://www.w3.org/2000/svg" width="1000" height="124" fill="none">
                    <path fill="#FBFBFE" fill-opacity="0.8" d="M64.104 121.404c-11.586 
                        0-22.316-2.717-32.159-8.151-9.859-5.434-17.639-12.811-23.355-22.131C2.858 
                        81.817 0 71.677 0 60.702c0-10.974 2.858-21.114 8.59-30.42 5.716-9.32 
                        13.512-16.681 23.355-22.13C41.788 2.716 52.518 0 64.104 
                        0h57.165v57.514H83.653c-.55-3.946-2.476-7.331-5.778-10.124-3.316-2.793-7.107-4.19-11.387-4.19-4.83 
                        0-8.956 1.716-12.395 5.146-3.44 3.43-5.152 7.544-5.152 12.341s1.712 
                        8.895 5.151 12.31c3.44 3.416 7.566 5.116 12.396 5.116 4.326 0 
                        8.178-1.427 11.57-4.266 3.379-2.838 5.243-6.269 
                        5.595-10.26h37.616v57.817H64.104ZM177.18 124c-6.97 
                        0-13.634-1.305-20.008-3.931-6.373-2.626-11.845-6.148-16.415-10.596-4.586-4.447-8.224-9.73-10.929-15.862-2.705-6.133-4.066-12.553-4.066-19.278 0-6.724 1.361-13.13 
                        4.066-19.232 2.705-6.102 6.358-11.37 10.929-15.786 4.57-4.418 10.057-7.94 16.415-10.565 6.374-2.626 13.038-3.932 20.008-3.932 9.308 0 17.868 2.201 25.709 6.603 7.841 
                        4.402 14.046 10.398 18.617 18.018 4.57 7.605 6.862 15.908 6.862 24.91 0 6.724-1.36 13.145-4.065 19.277-2.706 6.133-6.359 11.415-10.929 15.863-4.585 4.447-10.027 7.984-16.339 
                        10.595-6.313 2.626-12.931 3.931-19.855 3.931V124Zm-8.468-57.773c-2.308 2.292-3.469 5.055-3.469 8.258 0 3.203 1.161 5.966 3.469 8.258 2.308 2.292 5.09 3.445 8.315 3.445 
                        3.225 0 5.931-1.153 8.254-3.445 2.323-2.292 3.469-5.055 3.469-8.258 
                        0-3.203-1.161-5.966-3.469-8.258-2.308-2.292-5.059-3.445-8.254-3.445-3.194 
                        0-6.007 1.153-8.315 3.445ZM232.923 121.404V27.277h102.239v94.127h-42.323V70.265c0-2.52-.825-4.614-2.461-6.3-1.635-1.684-3.729-2.519-6.266-2.519-2.538 
                        0-4.647.835-6.344 2.52-1.696 1.685-2.537 3.78-2.537 
                        6.3v51.138h-42.323.015ZM443.546 27.277v94.127H341.307V27.277h42.323v51.14c0 
                        2.52.826 4.614 2.461 6.299 1.635 1.685 3.729 2.52 6.267 2.52 2.537 0 
                        4.646-.835 6.343-2.52 1.696-1.685 2.537-3.78 2.537-6.3V27.277h42.323-.015ZM449.66 
                        121.404V27.277h102.239v94.127h-42.323V70.265c0-2.52-.826-4.614-2.461-6.3-1.635-1.684-3.729-2.519-6.267-2.519-2.537 
                        0-4.646.835-6.343 2.52-1.696 1.685-2.537 3.78-2.537 6.3v51.138h-42.323.015ZM607.062 
                        121.404c-6.924 0-13.497-1.244-19.748-3.749-6.252-2.489-11.617-5.844-16.126-10.049-4.509-4.204-8.085-9.183-10.745-14.966-2.659-5.784-3.989-11.84-3.989-18.155 
                        0-8.698 2.247-16.667 6.756-23.907 4.509-7.241 10.623-12.933 18.357-17.077 7.734-4.144 
                        16.232-6.224 25.479-6.224h9.63V0h42.384v121.404h-52.014.016Zm-8.361-47.07c0 3.263 
                        1.116 6.025 3.362 8.302 2.232 2.277 4.968 3.416 8.208 3.416 3.241 0 6.007-1.139 
                        8.315-3.416s3.47-5.04 3.47-8.303c0-3.263-1.162-5.874-3.47-8.151-2.308-2.277-5.09-3.415-8.315-3.415-3.225 0-5.915 1.123-8.177 3.37-2.262 2.246-3.393 4.978-3.393 
                        8.196ZM665.128 121.404V27.277h65.602V64.33h-21.72v57.074h-43.882ZM837.814 
                        27.277v94.127H735.575V27.277h42.323v51.14c0 2.52.826 4.614 2.461 6.299 
                        1.636 1.685 3.73 2.52 6.267 2.52 2.537 0 4.646-.835 6.343-2.52s2.537-3.78 
                        2.537-6.3V27.277h42.324-.016ZM843.944 121.404V27.277H1000v94.127h-42.323V68.702c0-2.02-.703-3.75-2.094-5.146-1.391-1.412-3.118-2.11-5.151-2.11s-3.775.698-5.182 
                        2.11c-1.406 1.412-2.124 3.127-2.124 5.146v52.702h-42.324V68.702c0-2.02-.687-3.75-2.048-5.146-1.375-1.412-3.072-2.11-5.105-2.11-2.033 0-3.775.698-5.227 2.11-1.437 
                        1.412-2.171 3.127-2.171 5.146v52.702h-42.323.016Z"/>
                </svg>
                <section className={`game-generator-slidebar-hidden ${isSlidebarVisible ? '' : 'visible'}`}>
                    <div className='generator-slidebar-hidden'>
                        <div className='game-menu-handler' onClick={toggleSlidebar}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 8 8 8-8 8"/>
                            </svg>
                        </div>
                        <div className='game-puzzle-creator' onClick={() => {toggleFormCreatingPuzzle(); toggleSlidebar()}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                <path fill="#FBFBFE" fill-rule="evenodd" d="M16 1.667C8.084 1.667 1.667 8.084 
                                1.667 16S8.084 30.333 16 30.333 30.333 23.916 30.333 16 23.916 1.667 16 1.667Zm1 
                                9a1 1 0 0 0-2 0V15h-4.333a1 1 0 1 0 0 2H15v4.333a1 1 0 1 0 2 0V17h4.333a1 1 0 1 0 
                                0-2H17v-4.333Z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                        <div className='game-my-puzzles'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M10.667 8h16M5.333 8.013 5.347 8M5.333 16.013l.014-.015M5.333 24.013l.014-.015M10.667 
                                16h16M10.667 24h16"/>
                            </svg>
                        </div>
                    </div>
                </section>
                <section className={`game-generator-slidebar-visible ${isSlidebarVisible ? 'visible' : ''}`}>
                    <div className='generator-slidebar-visible'>
                        <div className='game-menu-handler-open' onClick={toggleSlidebar}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                <rect width="32" height="32" x="32" y="32" fill="#FBFBFE" fill-opacity="1" rx="16" 
                                transform="rotate(180 32 32)"/>
                                <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="m20 24-8-8 8-8"/>
                            </svg>
                            <p>Свернуть меню</p>
                        </div>
                        <div className='game-puzzle-creator-open'
                        onClick={toggleFormCreatingPuzzle}>
                            {isFormCreatingPuzzle ?
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" transform='rotate(45)'>
                                    <path fill="#FBFBFE" fill-rule="evenodd" d="M16 1.667C8.084 1.667 1.667 8.084 
                                    1.667 16S8.084 30.333 16 30.333 30.333 23.916 30.333 16 23.916 1.667 16 1.667Zm1 
                                    9a1 1 0 0 0-2 0V15h-4.333a1 1 0 1 0 0 2H15v4.333a1 1 0 1 0 2 0V17h4.333a1 1 0 1 0 
                                    0-2H17v-4.333Z" clip-rule="evenodd"/>
                                </svg>
                                <p>Отменить</p>
                            </>
                            : 
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <path fill="#FBFBFE" fill-rule="evenodd" d="M16 1.667C8.084 1.667 1.667 8.084 
                                    1.667 16S8.084 30.333 16 30.333 30.333 23.916 30.333 16 23.916 1.667 16 1.667Zm1 
                                    9a1 1 0 0 0-2 0V15h-4.333a1 1 0 1 0 0 2H15v4.333a1 1 0 1 0 2 0V17h4.333a1 1 0 1 0 
                                    0-2H17v-4.333Z" clip-rule="evenodd"/>
                                </svg>
                                <p>Создать головоломку</p>
                            </>
                            }
                        </div>
                        <div className={`creating-puzzle-input-data ${isFormCreatingPuzzle ? 'visible' : 'hidden'}`}>
                            <form id='creating-puzzle-form'>
                                <input className='input-puzzle-name' type='text' placeholder='НАЗВАНИЕ' required/>
                                <div className='input-type-of-puzzle'>
                                    <h2>ВИД ГОЛОВОЛОМКИ</h2>
                                    <div>
                                        <input type="radio" id="crossword" value='Кроссворд' name='type-of-puzzle' required/>
                                        <label for="crossword">Кроссворд</label>
                                    </div>
                                    <div>
                                        <input type="radio" id="fillword" value='Филворд' name='type-of-puzzle' required/>
                                        <label for="fillword">Филворд</label>
                                    </div>
                                </div>
                                <div className='input-interaction-format'>
                                    <h2>ФОРМАТ ВЗАИМОДЕЙСТВИЯ</h2>
                                    <div>
                                        <input 
                                        type="radio" 
                                        id="set-topic" 
                                        value='Тема' 
                                        name='interaction-format' 
                                        onChange={handleInteractionFormatChange}
                                        required/>
                                        <label for="set-topic">Задать тему</label>
                                        {selectedInteractionFormat === 'set-topic' && (
                                            <div className='topic-input'>
                                                <input
                                                    type='text'
                                                    id='topic'
                                                    name='topic'
                                                    placeholder='Например: Фрукты'
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input 
                                        type="radio" 
                                        id="set-text" 
                                        value='Текст' 
                                        name='interaction-format' 
                                        onChange={handleInteractionFormatChange}
                                        required/>
                                        <label for="set-text">Задать текст</label>
                                        {selectedInteractionFormat === 'set-text' && (
                                            <div className='text-input'>
                                                <textarea
                                                    className='text-input-textarea'
                                                    id='document'
                                                    name='text'
                                                    placeholder='Например: Однажды весною, в час небывало жаркого заката...'
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <input 
                                        type="radio" 
                                        id="upload-file" 
                                        value='Файл' 
                                        name='interaction-format' 
                                        onChange={handleInteractionFormatChange}
                                        required/>
                                        <label for="upload-file">Загрузить файл</label>
                                        {selectedInteractionFormat === 'upload-file' && (
                                            <div className='file-input'>
                                                <input type='file' 
                                                className='text-input-textarea' 
                                                id='file-upload' 
                                                name='file-upload'
                                                accept='application/pdf'/>
                                                <label for="file-upload" class="file-input-label">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                                        <path fill="#FBFBFE" fill-rule="evenodd" d="M4.8 3A1.8 1.8 0 0 0 3 4.8v22.4A1.8 1.8 0 0 0 4.8 29h22.4a1.8 1.8 0 0 0 1.8-1.8V4.8A1.8 1.8 0 0 0 27.2 3H4.8ZM17 12a1 1 0 1 0-2 0v3h-3a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2h-3v-3Z" clip-rule="evenodd"/>
                                                    </svg>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className='input-puzzle-size'>
                                    <h2>КОЛИЧЕСТВО СЛОВ</h2>
                                    <input type="number" min="1" max="20" step="1" required/>
                                </div>
                                <button className='open-full-settings-button'>
                                    Продвинутые настройки
                                </button>
                                <button type='submit' className='generate-puzzle-button'>
                                    Генерировать
                                </button>
                            </form>
                        </div>
                        <div className='game-my-puzzles-open'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M10.667 8h16M5.333 8.013 5.347 8M5.333 16.013l.014-.015M5.333 24.013l.014-.015M10.667 
                                16h16M10.667 24h16"/>
                            </svg>
                            <p>Мои головоломки</p>
                        </div>
                    </div>
                </section>
                <div className='game-theme-changer'>
                    <ThemeChanger 
                        isBlackTheme={isBlackTheme} 
                        toggleTheme={toggleTheme}
                        page='game' />
                </div>
            </main>
        </>
    );
}

export default GameGenerator;
