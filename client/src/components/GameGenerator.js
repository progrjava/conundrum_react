import React, { useState, useEffect, createRef, Component } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { Navigate } from 'react-router-dom';
import ThemeChanger from './ThemeChanger';
import '../css/gameGenerator.css';
import '../css/crossword.css';
import { CluesDisplay } from '../js/CluesDisplay';
import { DisplayBase } from '../js/DisplayBase';
import { CrosswordDisplay } from '../js/CrosswordDisplay';
import { elements } from '../js/elements';
import { GameStateManager } from '../js/GameStateManager';
import { UIUtils } from '../js/UIUtils';
import { WordSoupDisplay } from '../js/WordSoupDisplay';
import { getSupabaseClient, initializeSupabase } from '../config/supabaseClient';

class GameGenerator extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAboutVisible: false,
            isManualVisible: false,
            isSlidebarVisible: true,
            isFormCreatingPuzzle: false,
            redirectToProfile: false,
            isSettingsOpen: false,
            isLoading: true,
          supabaseUrl: '',
          supabaseKey: ''
        };

        this.crosswordFormRef = createRef();
        this.gameTypeRef = createRef();
        this.inputTypeRef = createRef();
        this.documentTextRef = createRef();
        this.totalWordsRef = createRef();
        this.topicRef = createRef();
        this.fileInputRef = createRef();
        this.crosswordContainerRef = createRef();
        this.cluesContainerRef = createRef();
    }

    async componentDidMount() {
        try {
            // Инициализируем UIUtils
            UIUtils.initialize();
            
            // Инициализируем elements
            elements.inputTypeSelect = document.querySelector('input[name="inputType"]:checked');
            elements.documentTextarea = this.documentTextRef.current;
            elements.totalWordsInput = this.totalWordsRef.current;
            elements.topicInput = this.topicRef.current;
            elements.fileUploadInput = this.fileInputRef.current;
            elements.crosswordForm = this.crosswordFormRef.current;
            elements.gameTypeSelect = document.querySelector('input[name="gameType"]:checked');
            elements.crosswordContainer = this.crosswordContainerRef.current;
            elements.cluesContainer = this.cluesContainerRef.current;
            // fetch Supabase config
              const response = await fetch('/api/config');
              if (!response.ok) {
                throw new Error(`Failed to fetch Supabase config: ${response.status}`);
              }
              const config = await response.json();
              this.setState({
                supabaseUrl: config.supabaseUrl,
                supabaseKey: config.supabaseKey,
              }, async () => {
            // Инициализируем Supabase
                 try{
                   await initializeSupabase(this.state);
                   this.setState({ isLoading: false });
                   }
                   catch (error) {
                     console.error('Failed to initialize Supabase:', error);
                     UIUtils.showError('Failed to initialize authentication. Please try again later.');
                     this.setState({ isLoading: false });
                   }
              });

        } catch (error) {
            console.error('Failed to initialize:', error);
            UIUtils.showError('Failed to initialize. Please try again later.');
            this.setState({ isLoading: false });
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        
        // Получение значений из формы
        const gameType = document.querySelector('input[name="gameType"]:checked')?.value;
        const inputType = document.querySelector('input[name="inputType"]:checked')?.value;
        const documentText = this.documentTextRef.current?.value;
        const totalWords = parseInt(this.totalWordsRef.current?.value);
        const topic = this.topicRef.current?.value;
        const fileInput = this.fileInputRef.current;

        // Валидация введенных данных
        if (!inputType) {
            return UIUtils.showError('Выберите тип ввода.');
        }

        if (inputType === 'text' && (!documentText || documentText.trim() === '')) {
            return UIUtils.showError('Введите текст.');
        }
    
        if (inputType === 'topic' && (!topic || topic.trim() === '')) {
            return UIUtils.showError('Введите тему.');
        }
    
        if (inputType === 'file' && (!fileInput || !fileInput.files.length)) {
            return UIUtils.showError('Выберите файл.');
        }
    
        if (isNaN(totalWords) || totalWords < 1) {
            return UIUtils.showError('Введите корректное количество слов (больше 0).');
        }
    
        // Показываем индикатор загрузки
        DisplayBase.displayLoadingIndicator();
    
        try {
            // Создаем FormData и добавляем все необходимые поля
            const formData = new FormData();
            formData.append('gameType', gameType);
            formData.append('inputType', inputType);
            formData.append('totalWords', totalWords);

            if (inputType === 'text') {
                formData.append('text', documentText);
            } else if (inputType === 'topic') {
                formData.append('topic', topic);
            } else if (inputType === 'file' && fileInput.files[0]) {
                formData.append('file-upload', fileInput.files[0]);
            }

            // Отправка данных на сервер
          const response = await fetch('/api/generate-game', {
                method: 'POST',
                body: formData,
            });
            
           if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to generate games: ${errorData.error || response.status}`);
            }

            const data = await response.json();
    
            // Отображение игры в зависимости от выбранного типа
            if (gameType === 'wordsoup') {
                if (data.grid && data.words) {
                    const display = new WordSoupDisplay(data);
                    display.display();
                } else {
                    UIUtils.showError('Не удалось получить данные для игры');
                }
            } else {
                if (data.crossword && data.layout.result) {
                    CrosswordDisplay.displayCrossword(data.crossword, data.layout.result);
                } else {
                    UIUtils.showError('Не удалось получить данные кроссворда');
                }
            }
        } catch (error) {
            console.error('Error generating game:', error);
            if (error.message) {
                 UIUtils.showError(error.message);
            }
            else{
               UIUtils.showError("Произошла ошибка при генерации игры. Пожалуйста, попробуйте снова.");
            }
        } finally {
            DisplayBase.hideLoadingIndicator();
        }
    }

    toggleAboutPopup = () => {
        this.setState((prevState) => ({
            isAboutVisible: !prevState.isAboutVisible,
            isManualVisible: false,
        }));
    };

    toggleManualPopup = () => {
        this.setState((prevState) => ({
            isManualVisible: !prevState.isManualVisible,
            isAboutVisible: false,
        }));
    };

    navToProfile = () => {
        this.setState({ redirectToProfile: true});
    };

    toggleSlidebar = () => {
        this.setState((prevState) => ({
        isSlidebarVisible: !prevState.isSlidebarVisible,
        }));
    };

    toggleFormCreatingPuzzle = () => {
        this.setState((prevState) => ({
        isFormCreatingPuzzle: !prevState.isFormCreatingPuzzle,
        }));
    };

    toggleSettings = () => {
        this.setState((prevState) => ({
        isSettingsOpen: !prevState.isSettingsOpen,
        }));
    }
    render() {
        const { isBlackTheme, toggleTheme } = this.props;
        const {
        isAboutVisible,
        isManualVisible,
        isSlidebarVisible,
        isFormCreatingPuzzle,
        } = this.state;

        if (this.state.redirectToProfile) {
            return <Navigate to='/account'/>
        }
        return (
            <>
                <header className={`main-page-header ${isAboutVisible || isManualVisible ? 'hidden' : ''}`} id='game-header'>
                    <div className='go-to-profile' id='game-go-to-profile' onClick={this.navToProfile}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                            <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M8 33.333v-1.666C8 25.223 13.223 20 19.667 20c6.443 0 11.666 5.223 11.666 11.667v1.666"/>
                            <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M19.667 20a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333Z"/>
                        </svg>
                    </div>
                    <button id='game-about-popup-button' className={`about-button ${isAboutVisible ? 'pressed' : ''}`} onClick={this.toggleAboutPopup}>О проекте</button>
                    <button id='game-manual-popup-button' className={`manual-button ${isManualVisible ? 'pressed' : ''}`} onClick={this.toggleManualPopup}>Инструкция</button>
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
                            <div className='game-menu-handler' onClick={this.toggleSlidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 8 8 8-8 8"/>
                                </svg>
                            </div>
                            <div className='game-puzzle-creator' onClick={() => {this.toggleFormCreatingPuzzle(); this.toggleSlidebar()}}>
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
                            <div className='game-menu-handler-open' onClick={this.toggleSlidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <rect width="32" height="32" x="32" y="32" fill="#FBFBFE" fill-opacity="1" rx="16" 
                                    transform="rotate(180 32 32)"/>
                                    <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="m20 24-8-8 8-8"/>
                                </svg>
                                <p>Свернуть меню</p>
                            </div>
                            <div className='game-puzzle-creator-open'
                            onClick={this.toggleFormCreatingPuzzle}>
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
                                <form id='crossword-form' encType='multipart/form-data' 
                                onSubmit={this.handleSubmit} ref={this.crosswordFormRef}>
                                    <input className='input-puzzle-name' type='text' placeholder='НАЗВАНИЕ' required/>
                                    <div className='input-type-of-puzzle'>
                                        <h2>ВИД ГОЛОВОЛОМКИ</h2>
                                        <div>
                                            <input type="radio" id="crossword" value='crossword' name="gameType" ref={this.gameTypeRef} required/>
                                            <label for="crossword">Кроссворд</label>
                                        </div>
                                        <div>
                                            <input type="radio" id="fillword" value='wordsoup' name="gameType" ref={this.gameTypeRef} required/>
                                            <label for="fillword">Суп из слов</label>
                                        </div>
                                    </div>
                                    <div className='input-interaction-format'>
                                        <h2>ФОРМАТ ВЗАИМОДЕЙСТВИЯ</h2>
                                        <div>
                                            <input 
                                            type="radio" 
                                            id="set-topic" 
                                            value='topic' 
                                            name='inputType' 
                                            onChange={this.handleInteractionFormatChange}
                                            required
                                            ref={this.inputTypeRef}/>

                                            <label for="set-topic">Задать тему</label>
                                            

                                                <div className='topic-input'>
                                                    <input
                                                        ref={this.topicRef}
                                                        type='text'
                                                        id='topic'
                                                        name='topic'
                                                        placeholder='Например: Фрукты'
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                        </div>
                                        <div>
                                            <input 
                                            type="radio" 
                                            id="set-text" 
                                            value='text' 
                                            name='inputType' 
                                            onChange={this.handleInteractionFormatChange}
                                            required
                                            ref={this.inputTypeRef}/>

                                            <label for="set-text">Задать текст</label>
                                            

                                                <div className='text-input'>
                                                    <textarea
                                                        ref={this.documentTextRef}
                                                        className='text-input-textarea'
                                                        id='document'
                                                        name='text'
                                                        placeholder='Например: Однажды весною, в час небывало жаркого заката...'
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                        </div>
                                        <div>
                                            <input 
                                            type="radio" 
                                            id="upload-file" 
                                            value='file' 
                                            name='inputType' 
                                            onChange={this.handleInteractionFormatChange}
                                            required
                                            ref={this.inputTypeRef}/>
                                            <label for="upload-file">Загрузить файл</label>

                                                <div className='file-input' id='file-input-div' style={{ display: 'none' }}>
                                                    <input type='file' 
                                                    className='file-input-area' 
                                                    id='file-upload' 
                                                    
                                                    ref={this.fileInputRef}
                                                    name='file-upload'/>

                                                    <label for="file-upload" className="file-input-label">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                                            <path fill="#FBFBFE" fill-rule="evenodd" d="M4.8 3A1.8 1.8 0 0 0 3 4.8v22.4A1.8 1.8 0 0 0 4.8 29h22.4a1.8 1.8 0 0 0 1.8-1.8V4.8A1.8 1.8 0 0 0 27.2 3H4.8ZM17 12a1 1 0 1 0-2 0v3h-3a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2h-3v-3Z" clip-rule="evenodd"/>
                                                        </svg>
                                                    </label>
                                                </div>
                                        </div>
                                    </div>
                                    <div className='input-puzzle-size'>
                                        <h2>КОЛИЧЕСТВО СЛОВ</h2>
                                        <input type="number" ref={this.totalWordsRef} id='total-words' name="totalWords" min="5" max="20" step="1" required/>
                                    </div>
                                    <div className='open-full-settings-button'>
                                        <h3 onClick={this.toggleSettings}>Продвинутые настройки</h3>
                                        <div className={`input-difficulty ${this.state.isSettingsOpen ? 'open' : ''}`}>
                                            <h2 className='difficulty-choice'>СЛОЖНОСТЬ</h2>
                                            <div className='difficulty-levels'>
                                                <div>
                                                    <input type="radio" id="easy" value='easy' name="difficulty" defaultChecked={false}/>
                                                    <label htmlFor="easy">Легко</label>
                                                </div>
                                                <div>
                                                    <input type="radio" id="normal" value='normal' name="difficulty" defaultChecked={true}/>
                                                    <label htmlFor="normal">Нормально</label>
                                                </div>
                                                <div>
                                                    <input type="radio" id="hard" value='hard' name="difficulty" defaultChecked={false}/>
                                                    <label htmlFor="hard">Сложно</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
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
                    <section id='dispay-game-on-screen'>
                        <section id='crossword-and-clues'>
                            <div id="crossword-container" ref={this.crosswordContainerRef}></div>
                            <div id="clues-container" ref={this.cluesContainerRef} style={{ padding: '0px' }}></div> 
                        </section>
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
    
}

export default GameGenerator;
