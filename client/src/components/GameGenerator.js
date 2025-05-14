import React, { useState, useEffect, createRef, Component } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { Navigate, Link } from 'react-router-dom';
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
import ActivityTracker from '../modules/ActivityTracker';
import MenuHandlerIcon from '../assets/svg/MenuHandlerIcon';
import PuzzleCreatorIcon from '../assets/svg/PuzzleCreatorIcon';
import MyPuzzlesIcon from '../assets/svg/MyPuzzlesIcon';
import GameLogotype from '../assets/svg/GameLogotype';
import { savePuzzleToSupabase, getPuzzleByIdFromSupabase } from '../services/puzzleService';

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
            supabaseKey: '',
            puzzleNameForSave: '',
            showSaveModal: false,
            currentGameData: null,
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
        this.activityTracker = new ActivityTracker();
    }

    componentDidMount = async () => {
        try {
            UIUtils.initialize();
            await initializeSupabase();
            this.activityTracker.startTracking();
            // Проверка URL на наличие параметра загрузки
            const urlParams = new URLSearchParams(window.location.search);
            const puzzleIdToLoad = urlParams.get('load_puzzle_id');

            if (puzzleIdToLoad) {
                console.log(`Found puzzle ID in URL: ${puzzleIdToLoad}. Attempting to load...`);
                await this.loadAndDisplayPuzzle(puzzleIdToLoad);
            } else {
                this.setState({ isLoading: false });
            }

        } catch (error) {
            console.error('Failed to initialize GameGenerator or load puzzle:', error);
            UIUtils.showError('Ошибка инициализации или загрузки игры.');
            this.setState({ isLoading: false });
        }
    }

    componentWillUnmount() {
        this.activityTracker.stopTracking();
    }

    calculateScore() {
        const stats = this.activityTracker.getStats();
        console.log("Calculating score based on stats:", stats);
        if (!stats) return 0;

        let score = stats.attempts > 0 ? parseFloat(stats.accuracy) : 0;
        score = Math.max(0, Math.min(100, Math.round(score)));
        console.log("Final calculated score:", score);
        return score;
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        this.activityTracker.startTracking();

        try {
            // Получение значений из формы
            const gameType = document.querySelector('input[name="gameType"]:checked')?.value;
            const initialPuzzleName = document.querySelector('.input-puzzle-name')?.value || '';
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generate-game`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to generate games: ${errorData.error || response.status}`);
            }

            const data = await response.json();
            this.setState({ 
                currentGameData: { ...data, gameType: gameType }, 
                puzzleNameForSave: initialPuzzleName
            });
    
            // Отображение игры в зависимости от выбранного типа
            const handleAttemptCallback = (isCorrect) => {
                this.activityTracker.recordAttempt(isCorrect);
            };

            const handleGameCompleteCallback = async () => {
                console.log("handleGameCompleteCallback triggered!");
                if (this.props.ltiUserId) {
                    const finalScore = this.calculateScore();
                    console.log(`Submitting score ${finalScore} for LTI user ${this.props.ltiUserId}`);
                    await this.submitLTIScore(finalScore);
                    this.activityTracker.stopTracking();
                } else {
                    console.log("Game complete (non-LTI mode). Stats:", this.activityTracker.getStats());
                    this.activityTracker.stopTracking();
                }
            };

            this.activityTracker.recordGameGenerated({
                gameType: gameType,       // Тип игры (crossword/wordsoup)
                inputType: inputType,     // Тип ввода (text/topic/file)
                totalWords: totalWords    // Запрошенное кол-во слов
                // Можно добавить еще данные, если нужно
            })

            if (gameType === 'wordsoup') {
                if (data.grid && data.words) {
                    const display = new WordSoupDisplay(data, handleAttemptCallback, handleGameCompleteCallback);
                    display.display();
                } else {
                    UIUtils.showError('Не удалось получить данные для игры');
                }
            } else {
                if (data.crossword && data.layout.result) {
                    CrosswordDisplay.displayCrossword(data.crossword, data.layout.result, handleAttemptCallback, handleGameCompleteCallback);
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

    handleInteractionFormatChange = (event) => {
        const selectedFormat = event.target.value;
        const textInput = document.querySelector('.text-input textarea');
        const topicInput = document.querySelector('.topic-input input');
        const fileInput = document.querySelector('.file-input');

        if (textInput) textInput.style.display = selectedFormat === 'text' ? 'block' : 'none';
        if (topicInput) topicInput.style.display = selectedFormat === 'topic' ? 'block' : 'none';
        if (fileInput) fileInput.style.display = selectedFormat === 'file' ? 'flex' : 'none';

        // Очищаем значения неактивных полей
        if (selectedFormat !== 'text' && textInput) textInput.value = '';
        if (selectedFormat !== 'topic' && topicInput) topicInput.value = '';
        if (selectedFormat !== 'file' && fileInput) {
            const fileUpload = fileInput.querySelector('input[type="file"]');
            if (fileUpload) fileUpload.value = '';
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

    submitLTIScore = async (score) => {
       // if (!this.props.isLTIMode) return; // Use props instead

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lti/submit-score`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    score,
                    totalScore: 100 // или другое максимальное значение
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Score submission error:', errorData);
                throw new Error(`Failed to submit score: ${errorData.error || response.statusText}`);
            }

            console.log('Score submitted successfully');
        } catch (error) {
            console.error('Error submitting LTI score:', error);
        }
    };

    handleActualSavePuzzle = async () => {
        if (!this.state.puzzleNameForSave.trim()) {
            UIUtils.showError("Пожалуйста, введите название игры.");
            return;
        }

        if (!this.state.currentGameData || !this.state.currentGameData.gameType) {
            UIUtils.showError("Тип игры не определен в сохраненных данных. Попробуйте сгенерировать заново.");
            console.error("Missing gameType in currentGameData:", this.state.currentGameData);
            return;
        }

        const gameType = this.state.currentGameData.gameType;

        if (!['crossword', 'wordsoup'].includes(gameType)) {
            UIUtils.showError(`Недопустимый тип игры для сохранения: ${gameType}`);
            console.error("Invalid gameType from state:", gameType);
            return;
        }

        const puzzleToSave = {
            name: this.state.puzzleNameForSave,
            game_type: gameType,
            game_data: this.state.currentGameData
        };

        try {
            const savedPuzzle = await savePuzzleToSupabase(puzzleToSave);
            if (savedPuzzle) {
                UIUtils.showSuccess(`Игра "${savedPuzzle.name}" успешно сохранена!`);
                this.setState({ showSaveModal: false, puzzleNameForSave: '' });
            } else {
                UIUtils.showError("Не удалось сохранить игру. Данные не вернулись.");
            }
        } catch (error) {
            console.error('Error saving puzzle from component:', error);
            UIUtils.showError(`Ошибка сохранения: ${error.message}`);
        }
    };

    loadAndDisplayPuzzle = async (puzzleId) => {
        this.setState({ isLoading: true });
        DisplayBase.displayLoadingIndicator();

        try {
            const loadedPuzzle = await getPuzzleByIdFromSupabase(puzzleId);

            if (loadedPuzzle && loadedPuzzle.game_data) {
                console.log("Puzzle loaded from Supabase:", loadedPuzzle);

                const gameDataForDisplay = loadedPuzzle.game_data;
                const gameType = loadedPuzzle.game_type;

                this.setState({
                    currentGameData: gameDataForDisplay,
                    puzzleNameForSave: loadedPuzzle.name,
                    isFormCreatingPuzzle: false,
                });

                DisplayBase.clearGameField();
                if (document.getElementById('clues-container')) {
                    document.getElementById('clues-container').innerHTML = '';
                }

                this.activityTracker.reset();
                this.activityTracker.startTracking({
                    gameType: gameType,
                    inputType: 'loaded_from_db',
                    sourceName: loadedPuzzle.name,
                    totalWords: gameDataForDisplay.words?.length || 0
                });

                const handleAttemptCallback = (isCorrect) => {
                    this.activityTracker.recordAttempt(isCorrect);
                };

                const handleGameCompleteCallback = async () => {
                    console.log("Game loaded from DB - GameCompleteCallback triggered!");
                    if (this.props.ltiUserId) {
                        const finalScore = this.calculateScore();
                        await this.submitLTIScore(finalScore);
                    }
                    this.activityTracker.stopTracking();
                    console.log("Game complete (loaded puzzle). Stats:", this.activityTracker.getStats());
                };

                if (gameType === 'wordsoup') {
                    if (gameDataForDisplay.grid && gameDataForDisplay.words) {
                        const display = new WordSoupDisplay(gameDataForDisplay, handleAttemptCallback, handleGameCompleteCallback);
                        display.display();
                    } else { UIUtils.showError('Ошибка данных для филворда.'); }
                } else if (gameType === 'crossword') {
                    if (gameDataForDisplay.crossword && gameDataForDisplay.layout?.result) {
                        CrosswordDisplay.displayCrossword(gameDataForDisplay.crossword, gameDataForDisplay.layout.result, handleAttemptCallback, handleGameCompleteCallback);
                    } else { UIUtils.showError('Ошибка данных для кроссворда.'); }
                } else {
                    UIUtils.showError(`Неизвестный тип игры: ${gameType}`);
                }

                this.setState({ isLoading: false });
            } else {
                UIUtils.showError('Не удалось загрузить пазл. Возможно, он был удален или у вас нет доступа.');
                this.setState({ isLoading: false });
            }
        } catch (error) {
            console.error('Error in loadAndDisplayPuzzle:', error);
            UIUtils.showError(`Ошибка при загрузке игры: ${error.message}`);
            this.setState({ isLoading: false });
        } finally {
            DisplayBase.hideLoadingIndicator();
        }
    };

    handleDownloadPdf = async () => {
    try {
        const { currentGameData, puzzleNameForSave } = this.state;

        if (!currentGameData) {
            UIUtils.showError('Нет данных игры для скачивания.');
            return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generate-pdf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gameData: currentGameData,
                gameName: puzzleNameForSave || currentGameData.gameType
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate PDF');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${puzzleNameForSave || currentGameData.gameType || 'game'}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading PDF:', error);
        UIUtils.showError(`Ошибка при скачивании PDF: ${error.message}`);
    }
};

    render() {
        const { isBlackTheme, toggleTheme, ltiUserId, user } = this.props;
        const isLTI = !!ltiUserId;
        const isAuthenticated = !!user;

        console.log('Save button conditions:', {
            isLTI,
            isAuthenticated,
            hasGameData: !!this.state.currentGameData,
            user
        });

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
                {!isLTI && (
                    <header className={`main-page-header ${isAboutVisible || isManualVisible ? 'hidden' : ''}`} id='game-header'>
                        <div className='go-to-profile' id='game-go-to-profile' onClick={this.navToProfile}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 40 40' fill="none">
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
                )}
                <main id='game-main-page'>
                    <GameLogotype />
                    <section className={`game-generator-slidebar-hidden ${isSlidebarVisible ? '' : 'visible'}`}>
                        <div className='generator-slidebar-hidden'>
                        <div className='game-menu-handler' onClick={this.toggleSlidebar}>
                    <MenuHandlerIcon />
                </div>
                <div className='game-puzzle-creator' onClick={() => {this.toggleFormCreatingPuzzle(); this.toggleSlidebar()}}>
                    <PuzzleCreatorIcon />
                </div>
                <div className='game-my-puzzles'>
                    <MyPuzzlesIcon />
                </div>

                        </div>
                    </section>
                    <section className={`game-generator-slidebar-visible ${isSlidebarVisible ? 'visible' : ''}`}>
                        <div className='generator-slidebar-visible'>
                            <div className='game-menu-handler-open' onClick={this.toggleSlidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
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
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 32 32' fill="none" transform='rotate(45)'>
                                        <path fill="#FBFBFE" fill-rule="evenodd" d="M16 1.667C8.084 1.667 1.667 8.084 
                                        1.667 16S8.084 30.333 16 30.333 30.333 23.916 30.333 16 23.916 1.667 16 1.667Zm1 
                                        9a1 1 0 0 0-2 0V15h-4.333a1 1 0 1 0 0 2H15v4.333a1 1 0 1 0 2 0V17h4.333a1 1 0 1 0 
                                        0-2H17v-4.333Z" clip-rule="evenodd"/>
                                    </svg>
                                    <p>Отменить</p>
                                </>
                                : 
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 32 32' fill="none">
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
                                    <input className='input-puzzle-name' type='text' placeholder='НАЗВАНИЕ' />
                                    <div className='input-type-of-puzzle'>
                                        <h2>ВИД ГОЛОВОЛОМКИ</h2>
                                        <div>
                                            <input type="radio" id="crossword" value='crossword' name="gameType" ref={this.gameTypeRef} required/>
                                            <label for="crossword">Кроссворд</label>
                                        </div>
                                        <div>
                                            <input type="radio" id="fillword" value='wordsoup' name="gameType" ref={this.gameTypeRef} required/>
                                            <label for="fillword">Филворд</label>
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
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 32 32' fill="none">
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
                            <Link to="/my-puzzles">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 32 32' fill="none">
                                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M10.667 8h16M5.333 8.013 5.347 8M5.333 16.013l.014-.015M5.333 24.013l.014-.015M10.667 
                                    16h16M10.667 24h16"/>
                                </svg>
                                <p>Мои головоломки</p>
                            </Link>
                        </div>

                        </div>
                    </section>
                    <section id='dispay-game-on-screen'>
                        <section id='crossword-and-clues'>
                            <div id="crossword-container" ref={this.crosswordContainerRef}></div>
                            <div id="clues-container" ref={this.cluesContainerRef} style={{ padding: '0px' }}></div> 
                        </section>
                    </section>
                    
                    {!isLTI && (
                        <div className='game-theme-changer'>
                            <ThemeChanger
                                isBlackTheme={isBlackTheme}
                                toggleTheme={toggleTheme}
                                page='game' />
                        </div>
                    )}
                </main>

                {!isLTI && isAuthenticated && this.state.currentGameData && (
                    <div className="game-actions" style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 9999 }}>
                        <button
                            className="save-puzzle-btn"
                            style={{ padding: '10px', marginRight: '10px' }}
                            onClick={() => this.setState({ showSaveModal: true })}
                        >
                            Сохранить игру
                        </button>
                        <button
                            className="download-pdf-btn"
                            style={{ padding: '10px' }}
                            onClick={this.handleDownloadPdf}
                        >
                            Скачать PDF
                        </button>
                    </div>
                )}

                {!isLTI && isAuthenticated && this.state.showSaveModal && (
                    <div className="save-puzzle-modal" 
                    style={{ position: 'fixed',
                    top: '50px',
                    left: '10px',
                    zIndex: 10000,
                    background: 'lightgray',
                    padding: '20px',
                    border: '1px solid black' }}>
                        <h3>Сохранить игру</h3>
                        <input
                            type="text"
                            placeholder="Название игры"
                            value={this.state.puzzleNameForSave}
                            onChange={(e) => this.setState({ puzzleNameForSave: e.target.value })}
                        />
                        <button onClick={this.handleActualSavePuzzle}>Сохранить</button>
                        <button onClick={() => this.setState({ showSaveModal: false, puzzleNameForSave: '' })}>
                            Отмена
                        </button>
                    </div>
                )}
            </>
        );
    }
    
}

export default GameGenerator;
