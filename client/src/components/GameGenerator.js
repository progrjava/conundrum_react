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
import { UIUtils } from '../js/UIUtils';
import { WordSoupDisplay } from '../js/WordSoupDisplay';
import RebusDisplay from './RebusDisplay';
import { getSupabaseClient, initializeSupabase } from '../config/supabaseClient';
import ActivityTracker from '../modules/ActivityTracker';
import MenuHandlerIcon from '../assets/svg/MenuHandlerIcon';
import PuzzleCreatorIcon from '../assets/svg/PuzzleCreatorIcon';
import MyPuzzlesIcon from '../assets/svg/MyPuzzlesIcon';
import GameLogotype from '../assets/svg/GameLogotype';
import { Helmet } from "react-helmet";
import { 
    savePuzzleToSupabase, 
    getPuzzleByIdFromSupabase, 
    checkForDuplicatePuzzle,
    updatePuzzleInSupabase,
    fetchRegeneratedLayout
} from '../services/puzzleService';
import SaveButton from '../assets/svg/SaveButton';
import DownloadPdf from '../assets/svg/DownloadPdf';
import { saveLtiConfiguration, getLtiConfiguration } from '../services/ltiConfigService';
import Header from './Header';
import GameMenu from './GameMenu';
import Preloader from '../assets/svg/Preloader';
import { elements } from '../js/elements';

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
            isEditing: false,
            editableWordsAndClues: [],
            currentPuzzleId: null,
            hasUnsavedChanges: false,
            originalPuzzleNameForEdit: '',
            resourceLinkId: null,
            isConfigureMode: false,
            isFileLoaded: false,
            fileLoadProgress: 0,
            fileLoadError: false
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

    componentDidMount() {
        UIUtils.initialize();
        this.activityTracker.startTracking();
        this.handleLtiOrPuzzleLoad();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.user && this.props.user) {
            console.log("GameGenerator: User prop received. Re-evaluating LTI.");
            this.handleLtiOrPuzzleLoad();
        }
    }

    handleLtiOrPuzzleLoad = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const isLTI = urlParams.has('lti');
        const puzzleIdToLoad = urlParams.get('load_puzzle_id');

        if (isLTI) {
            if (this.props.user) {
                const mode = urlParams.get('mode');
                const resourceLinkId = urlParams.get('resource_link_id');
                console.log(`LTI Mode Detected: ${mode}`);

                const newState = { resourceLinkId, isLoading: false };

                if (mode === 'configure') {
                    newState.isFormCreatingPuzzle = true;
                    newState.isConfigureMode = true;
                    this.setState(newState);
                } else if (mode === 'solve') {
                    newState.isFormCreatingPuzzle = false;
                    newState.isConfigureMode = false;
                    this.setState(newState, () => {
                        getLtiConfiguration(this.props.supabase, resourceLinkId)
                            .then(config => {
                                if (config) this.generateGameFromConfig(config);
                                else UIUtils.showError("Задание еще не настроено преподавателем.");
                            }).catch(err => UIUtils.showError(`Ошибка загрузки задания: ${err.message}`));
                    });
                }
            } else {
                console.log("GameGenerator: LTI mode, but waiting for user prop from App.js...");
                this.setState({ isLoading: true });
            }
        } else if (puzzleIdToLoad) {
            this.loadAndDisplayPuzzle(puzzleIdToLoad);
        } else {
            this.setState({ isLoading: false, isFormCreatingPuzzle: true, isConfigureMode: true });
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

        if (this.state.isConfigureMode && new URLSearchParams(window.location.search).has('lti')) {
            await this.handleSaveLtiConfig();
        } else {
            await this.handleGenerateGame();
        }
    }

    handleSaveLtiConfig = async () => {
        DisplayBase.displayLoadingIndicator();
        try {
            const generationParams = {
                gameType: document.querySelector('input[name="gameType"]:checked')?.value,
                inputType: document.querySelector('input[name="inputType"]:checked')?.value,
                topic: this.topicRef.current?.value || '',
                text: this.documentTextRef.current?.value || '',
                totalWords: parseInt(this.totalWordsRef.current?.value, 10),
                difficulty: document.querySelector('input[name="difficulty"]:checked')?.value || 'normal'
            };
            if (!generationParams.gameType || !generationParams.inputType || !generationParams.totalWords) {
                throw new Error("Пожалуйста, заполните все обязательные поля.");
            }
            await saveLtiConfiguration(this.props.supabase, this.state.resourceLinkId, generationParams);
            UIUtils.showSuccess("Конфигурация для этого задания успешно сохранена!");
        } catch (error) {
            console.error("Error saving LTI config:", error);
            UIUtils.showError(`Ошибка сохранения: ${error.message}`);
        } finally {
            DisplayBase.hideLoadingIndicator();
        }
    }

    handleGenerateGame = async () => {
        this.activityTracker.startTracking();
        try {
            const gameType = document.querySelector('input[name="gameType"]:checked')?.value;
            const initialPuzzleName = document.querySelector('.input-puzzle-name')?.value || '';
            const inputType = document.querySelector('input[name="inputType"]:checked')?.value;
            const documentText = this.documentTextRef.current?.value;
            const totalWords = parseInt(this.totalWordsRef.current?.value);
            const topic = this.topicRef.current?.value;
            const fileInput = this.fileInputRef.current;

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
        
            this.setState({ isLoading: true, currentGameData: null }); // Очищаем старую игру в React, чтобы она исчезла СРАЗУ
            DisplayBase.displayLoadingIndicator(); // Показываем колесико
            DisplayBase.clearGameField(); // Чистим зону кроссворда

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
                puzzleNameForSave: initialPuzzleName,
                isFormCreatingPuzzle: false, // Закрываем меню после успеха
                isLoading: false 
            }, () => {
                this.displayGeneratedGameWithCurrentData();
                DisplayBase.hideLoadingIndicator();
            });
    
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
                gameType: gameType,
                inputType: inputType,
                totalWords: totalWords
            });

            if (gameType === 'rebus') {
                DisplayBase.hideLoadingIndicator();               
                console.log("Rebus data loaded into state. React will now render it.");
            } else if (gameType === 'wordsoup') {
                // Старая логика для филворда
                if (data.grid && data.words) {
                    new WordSoupDisplay(data, handleAttemptCallback, handleGameCompleteCallback).display();
                    DisplayBase.hideLoadingIndicator();
                } else {
                    UIUtils.showError('Не удалось получить данные для филворда');
                }
            } else { // gameType === 'crossword'
                // Старая логика для кроссворда
                if (data.crossword && data.layout.result) {
                    CrosswordDisplay.displayCrossword(data.crossword, data.layout.result, handleAttemptCallback, handleGameCompleteCallback);
                    DisplayBase.hideLoadingIndicator();
                } else {
                    UIUtils.showError('Не удалось получить данные для кроссворда');
                }
            }

        } catch (error) {
            console.error('Error generating game:', error);
            if (error.message) {
                 UIUtils.showError(error.message);
            } else {
               UIUtils.showError("Произошла ошибка при генерации игры. Пожалуйста, попробуйте снова.");
            }
            this.setState({ currentGameData: null });
            DisplayBase.clearGameField();
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
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/lti/submit-score`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    score,
                    totalScore: 100
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

        if (!['crossword', 'wordsoup', 'rebus'].includes(gameType)) {
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
            const isDuplicate = await checkForDuplicatePuzzle(puzzleToSave);
            if (isDuplicate) {
                UIUtils.showError("Такая головоломка уже существует!");
                return;
            }

            const savedPuzzle = await savePuzzleToSupabase(puzzleToSave);
            if (savedPuzzle && savedPuzzle.id) {
                UIUtils.showSuccess(`Игра "${savedPuzzle.name}" успешно сохранена!`);
                this.setState({ 
                    showSaveModal: false, 
                    currentPuzzleId: savedPuzzle.id,
                    originalPuzzleNameForEdit: savedPuzzle.name
                });
            } else {
                UIUtils.showError("Не удалось сохранить игру или ID не был получен.");
            }
        } catch (error) {
            console.error("Ошибка при сохранении пазла:", error);
            UIUtils.showError(`Ошибка при сохранении: ${error.message || "Неизвестная ошибка"}`);
        }
    };

    loadAndDisplayPuzzle = async (puzzleId) => {
        this.setState({ isLoading: true });
        DisplayBase.displayLoadingIndicator();

        try {
            const loadedPuzzle = await getPuzzleByIdFromSupabase(puzzleId);
            if (loadedPuzzle && loadedPuzzle.game_data && loadedPuzzle.id) {
                const gameDataForDisplay = loadedPuzzle.game_data;
                const gameType = loadedPuzzle.game_type;

                this.setState({
                    currentGameData: gameDataForDisplay,
                    puzzleNameForSave: loadedPuzzle.name,
                    currentPuzzleId: loadedPuzzle.id,
                    originalPuzzleNameForEdit: loadedPuzzle.name,
                    isFormCreatingPuzzle: false,
                    isLoading: false,
                    isConfigureMode: true
                }, () => {
                    this.displayGeneratedGameWithCurrentData();
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

                if (gameType === 'rebus') {
                    console.log("Loaded Rebus data into state. React will now render it.");
                } else if (gameType === 'wordsoup') {
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

    handleEnterEditMode = () => {
        if (!this.state.currentGameData || !this.state.currentGameData.words) {
            UIUtils.showError("Нет данных для редактирования.");
            return;
        }

        const wordsToEdit = JSON.parse(JSON.stringify(this.state.currentGameData.words));
        const wordsWithOriginalIndex = wordsToEdit.map((word, index) => ({
            ...word,
            originalArrayIndex: index
        }));

        this.setState({
            isEditing: true,
            editableWordsAndClues: wordsWithOriginalIndex,
            hasUnsavedChanges: false,
            originalPuzzleNameForEdit: this.state.puzzleNameForSave
        }, () => {
            this.renderCluesForEditing();
            if (this.crosswordContainerRef.current) {
                this.crosswordContainerRef.current.classList.add('grid-disabled');
            }
        });
    };

    renderCluesForEditing = () => {
        if (!this.cluesContainerRef.current) return;
        CluesDisplay.renderEditable(
            this.state.editableWordsAndClues,
            this.state.currentGameData.gameType,
            this.handleEditableItemChange
        );
    };

    handleEditableItemChange = (originalItemIndex, fieldToChange, newValue) => {
        this.setState(prevState => {
            const updatedEditableWords = prevState.editableWordsAndClues.map(item => {
                if (item.originalArrayIndex === originalItemIndex) {
                    return { ...item, [fieldToChange]: newValue };
                }
                return item;
            });
            return {
                editableWordsAndClues: updatedEditableWords,
                hasUnsavedChanges: true
            };
        });
    };

    handleCancelEdit = () => {
        this.setState({
            isEditing: false,
            editableWordsAndClues: [],
            hasUnsavedChanges: false,
            puzzleNameForSave: this.state.originalPuzzleNameForEdit
        }, () => {
            this.displayGeneratedGameWithCurrentData();
            if (this.crosswordContainerRef.current) {
                this.crosswordContainerRef.current.classList.remove('grid-disabled');
            }
        });
    };

    handleSaveChangesAndRegenerate = async () => {
        const { editableWordsAndClues, currentGameData, currentPuzzleId, puzzleNameForSave, originalPuzzleNameForEdit, hasUnsavedChanges } = this.state;

        if (!currentGameData) {
            UIUtils.showError("Нет данных игры для сохранения.");
            return;
        }

        const wordsActuallyChanged = JSON.stringify(editableWordsAndClues.map(w => ({word: w.word, clue: w.clue}))) !== JSON.stringify(currentGameData.words.map(w => ({word: w.word, clue: w.clue})));
        const nameActuallyChanged = puzzleNameForSave !== originalPuzzleNameForEdit;

        if (!wordsActuallyChanged && !nameActuallyChanged && !hasUnsavedChanges) {
            UIUtils.showError("Нет изменений для сохранения.");
            this.setState({ isEditing: false }, () => {
                 this.displayGeneratedGameWithCurrentData();
                 if (this.crosswordContainerRef.current) {
                    this.crosswordContainerRef.current.classList.remove('grid-disabled');
                }
            });
            return;
        }
        
        this.setState({ isEditing: false });
        DisplayBase.displayLoadingIndicator();

        try {    
            const wordsForBackend = editableWordsAndClues.map(({originalArrayIndex, ...rest}) => rest);
            const newGameDataSubset = await fetchRegeneratedLayout(currentGameData.gameType, wordsForBackend);    
            if (!newGameDataSubset || !newGameDataSubset.words) {
                throw new Error("Сервер вернул некорректные данные после перегенерации.");
            }
            let updatedGameDataForSave;
    
            if (currentGameData.gameType === 'crossword') {
                updatedGameDataForSave = {
                    ...currentGameData, // Берем старые данные за основу
                    name: puzzleNameForSave,
                    crossword: newGameDataSubset.crossword, // Обновляем сетку
                    grid: newGameDataSubset.crossword,      // Дублируем для совместимости
                    layout: newGameDataSubset.layout,       // Обновляем layout
                    words: newGameDataSubset.words          // Обновляем слова
                };
            } else { // gameType === 'wordsoup'
                updatedGameDataForSave = {
                    ...currentGameData,
                    name: puzzleNameForSave,
                    grid: newGameDataSubset.grid,
                    gridSize: newGameDataSubset.gridSize,
                    words: newGameDataSubset.words
                };
            }
            
            if (currentPuzzleId) {
                await updatePuzzleInSupabase(currentPuzzleId, {
                    name: puzzleNameForSave,
                    game_data: updatedGameDataForSave
                });
                
                this.setState({
                    currentGameData: updatedGameDataForSave,
                    isEditing: false,
                    editableWordsAndClues: [],
                    hasUnsavedChanges: false,
                    originalPuzzleNameForEdit: puzzleNameForSave
                }, () => {
                    UIUtils.showSuccess(`Пазл "${puzzleNameForSave}" успешно обновлен!`);
                    this.displayGeneratedGameWithCurrentData();
                    if (this.crosswordContainerRef.current) {
                        this.crosswordContainerRef.current.classList.remove('grid-disabled');
                    }
                });
                
            } else {
                if (!puzzleNameForSave.trim()) {
                    UIUtils.showError("Пожалуйста, введите название для нового пазла.");
                    DisplayBase.hideLoadingIndicator();
                    return;
                }
                const puzzleToCreate = {
                    name: puzzleNameForSave,
                    game_type: currentGameData.gameType,
                    game_data: updatedGameDataForSave
                };

                const isDuplicate = await checkForDuplicatePuzzle(puzzleToCreate);
                if (isDuplicate) {
                    UIUtils.showError("Пазл с таким именем уже существует!");
                    DisplayBase.hideLoadingIndicator();
                    return;
                }

                const newSavedPuzzle = await savePuzzleToSupabase(puzzleToCreate);
                if (newSavedPuzzle && newSavedPuzzle.id) {
                    UIUtils.showSuccess(`Новый пазл "${newSavedPuzzle.name}" успешно создан и сохранен!`);
                    this.setState({
                        currentGameData: updatedGameDataForSave,
                        currentPuzzleId: newSavedPuzzle.id,
                        puzzleNameForSave: newSavedPuzzle.name,
                        originalPuzzleNameForEdit: newSavedPuzzle.name,
                        isEditing: false,
                        editableWordsAndClues: [],
                        hasUnsavedChanges: false
                    }, () => {
                        this.displayGeneratedGameWithCurrentData();
                        if (this.crosswordContainerRef.current) {
                            this.crosswordContainerRef.current.classList.remove('grid-disabled');
                        }
                    });
                } else {
                    UIUtils.showError("Не удалось создать и сохранить новый пазл.");
                }
            }
        } catch (error) {
            console.error("Ошибка при сохранении и перегенерации:", error);
            UIUtils.showError(`Ошибка: ${error.message || "Не удалось сохранить изменения."}`);
            this.setState({ isEditing: true });
        } finally {
            DisplayBase.hideLoadingIndicator();
        }
    };

    displayGeneratedGameWithCurrentData = () => {
        const { currentGameData } = this.state;
        if (!currentGameData) {
            console.warn("displayGeneratedGameWithCurrentData called but no currentGameData");
            return;
        }

        DisplayBase.clearGameField();

        

        if (this.cluesContainerRef.current) {
            this.cluesContainerRef.current.style.display = 'none';
            this.cluesContainerRef.current.innerHTML = '';
        } else {
            console.warn("Clues container ref is not available in displayGeneratedGameWithCurrentData");
        }

        // Показываем контейнеры
        if (this.crosswordContainerRef.current) {
            this.crosswordContainerRef.current.style.display = 'flex'; // ИЛИ 'block' в зависимости от CSS
        }
        
        this.activityTracker.reset();

        const gameType = currentGameData.gameType;
        const handleAttemptCallback = (isCorrect) => this.activityTracker.recordAttempt(isCorrect);
        
        const handleGameCompleteCallback = async () => { 
            console.log("Game complete (after edit/cancel). Stats:", this.activityTracker.getStats());
            if (this.props.ltiUserId) {
                const finalScore = this.calculateScore();
                await this.submitLTIScore(finalScore);
            }
            this.activityTracker.stopTracking();
        };

        this.activityTracker.startTracking({
            gameType: gameType,
            inputType: 'loaded_or_edited',
            sourceName: this.state.puzzleNameForSave || 'Unnamed Puzzle',
            totalWords: currentGameData.words?.length || 0
        });

        if (gameType === 'wordsoup') {
            if (currentGameData.grid && currentGameData.words) {
                const display = new WordSoupDisplay(currentGameData, handleAttemptCallback, handleGameCompleteCallback);
                display.display();
            } else { 
                console.error('Error in WordSoup data for displayGeneratedGameWithCurrentData:', currentGameData);
                UIUtils.showError('Ошибка данных для филворда после операции.'); 
            }
        } else if (gameType === 'crossword') {
            if (currentGameData.crossword && currentGameData.layout?.result) {
                CrosswordDisplay.displayCrossword(currentGameData.crossword, currentGameData.layout.result, handleAttemptCallback, handleGameCompleteCallback);
            } else { 
                console.error('Error in Crossword data for displayGeneratedGameWithCurrentData:', currentGameData);
                UIUtils.showError('Ошибка данных для кроссворда после операции.'); 
            }
        } else if (gameType === 'rebus') {
            console.log("Rebus data is in state, render() will now display it.");
        } else { 
            console.error('Unknown game type in displayGeneratedGameWithCurrentData:', gameType);
            UIUtils.showError(`Неизвестный тип игры: ${gameType}`);
        }
    };

    handlePuzzleNameChangeInEdit = (newName) => {
        this.setState({ 
            puzzleNameForSave: newName,
            hasUnsavedChanges: true
        });
    };

    generateGameFromConfig = async (config) => {
        console.log("Generating game for student using config:", config);
        DisplayBase.displayLoadingIndicator();
        try {
            const formData = new FormData();
            formData.append('gameType', config.gameType);
            formData.append('inputType', config.inputType);
            formData.append('totalWords', config.totalWords);
            formData.append('difficulty', config.difficulty || 'normal');
            if (config.inputType === 'text') formData.append('text', config.text);
            else if (config.inputType === 'topic') formData.append('topic', config.topic);

            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/generate-game`, {
                method: 'POST', body: formData
            });
            if (!response.ok) throw new Error((await response.json()).error);
            
            const data = await response.json();
            this.setState({ currentGameData: { ...data, gameType: config.gameType } });

            const handleAttemptCallback = (isCorrect) => this.activityTracker.recordAttempt(isCorrect);
            const handleGameCompleteCallback = async () => {
                const finalScore = this.calculateScore();
                await this.submitLTIScore(finalScore);
                this.activityTracker.stopTracking();
            };
            this.activityTracker.startTracking();

            if (config.gameType === 'wordsoup') {
                new WordSoupDisplay(data, handleAttemptCallback, handleGameCompleteCallback).display();
            } else {
                CrosswordDisplay.displayCrossword(data.crossword, data.layout.result, handleAttemptCallback, handleGameCompleteCallback);
            }
        } catch (error) {
            UIUtils.showError("Не удалось загрузить задание: " + error.message);
        } finally {
            DisplayBase.hideLoadingIndicator();
        }
    }

    handleFileSelected = (e) => {
        const file = e.target.files[0];

        // Сброс если файла нет
        if (!file) {
            this.setState({ 
                isFileLoaded: false,
                fileLoadProgress: 0,
                fileLoadError: false
            });
            return;
        }

        // === Ограничение размера ===
        const MAX_SIZE_MB = 30;
        const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

        if (file.size > MAX_SIZE_BYTES) {
            UIUtils.showError(`Файл слишком большой. Максимальный размер: ${MAX_SIZE_MB} МБ.`);
            e.target.value = "";
            this.setState({ 
                isFileLoaded: false,
                fileLoadProgress: 0,
                fileLoadError: true
            });
            return;
        }

        // === Чтение файла ===
        const reader = new FileReader();

        // ПРОГРЕСС
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                this.setState({ 
                    fileLoadProgress: percent,
                    fileLoadError: false
                });
            }
        };

        // УСПЕШНО
        reader.onload = () => {
            this.setState({ 
                isFileLoaded: true,
                fileLoadProgress: 100,
                fileLoadError: false
            });
        };

        // ОШИБКА
        reader.onerror = () => {
            UIUtils.showError("Ошибка чтения файла");
            this.setState({ 
                isFileLoaded: false,
                fileLoadProgress: 0,
                fileLoadError: true
            });
        };

        // Начинаем чтение
        reader.readAsArrayBuffer(file);
    };



    render() {
        const { isBlackTheme, toggleTheme, user, isAuth } = this.props;
        const urlParams = new URLSearchParams(window.location.search);
        const isLTI = urlParams.has('lti');
        const isAuthenticated = !!user;

        const {
            isAboutVisible,
            isManualVisible,
            isSlidebarVisible,
            isFormCreatingPuzzle,
            isConfigureMode,
            currentGameData,
        } = this.state;

        if (this.state.redirectToProfile) {
            return <Navigate to='/account'/>
        }
        const shouldShowSidebar = isConfigureMode;
        return (
            <>
                <Helmet>
                    <title>Генератор головоломок и кроссвордов — CONUNDRUM</title>

                    <meta
                        name="description"
                        content="Онлайн-генератор головоломок, кроссвордов и ребусов CONUNDRUM. Создавайте обучающие игры из текста или файлов за несколько шагов."
                    />

                    <meta name="robots" content="index, follow" />

                    <link
                        rel="canonical"
                        href={`${window.BASE_URL || ''}/gamegenerator`}
                    />

                    {/* Open Graph */}
                    <meta property="og:title" content="Генератор головоломок — CONUNDRUM" />
                    <meta
                        property="og:description"
                        content="Создавайте кроссворды, ребусы и обучающие игры онлайн с помощью генератора CONUNDRUM."
                    />
                    <meta property="og:type" content="website" />
                    <meta
                        property="og:url"
                        content={`${window.BASE_URL || ''}/gamegenerator`}
                    />
                    <meta
                        property="og:image"
                        content={`${window.BASE_URL || ''}/favicon.ico`}
                    />

                    {/* Twitter */}
                    <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
                {/*{!isLTI && (
                    <Header 
                        isBlackTheme={isBlackTheme} 
                        toggleTheme={toggleTheme}
                        isAuth={isAuth}
                    />
                )}*/}
                <main id='game-main-page'>
                    <GameMenu 
                        isAuth={isAuth}
                        isBlackTheme={isBlackTheme} 
                        toggleTheme={toggleTheme}
                        isLTI={isLTI}
                        isAuthenticated={isAuthenticated}
                        isCurrentGameData={this.state.currentGameData}
                        isEditing={this.state.isEditing}
                        handleEnterEditMode={this.handleEnterEditMode}
                        handleActualSavePuzzle={this.handleActualSavePuzzle}
                        handleDownloadPdf={this.handleDownloadPdf}
                        isLoading={this.state.isLoading}
                        toggleFormCreatingPuzzle={this.toggleFormCreatingPuzzle}
                        isFormCreatingPuzzle={isFormCreatingPuzzle}
                    />
                    <div className="background-video-main red"/>
                    <div className="ellipse-bg red"></div>
                    <div className='main-logo-title red'>
                        <GameLogotype />
                    </div>
                    <section className={`creating-puzzle-input-data ${isFormCreatingPuzzle ? 'visible' : 'hidden'}`}>
                        <form id='crossword-form' encType='multipart/form-data' 
                        onSubmit={this.handleSubmit} ref={this.crosswordFormRef}>
                            <input 
                                className='input-puzzle-name' 
                                type='text' 
                                placeholder='НАЗВАНИЕ'
                                onChange={(e) => this.setState({ puzzleNameForSave: e.target.value } )}required 
                            />
                            <div className='input-type-of-puzzle'>
                                <h2>ВИД ГОЛОВОЛОМКИ</h2>
                                <div>
                                    <input type="radio" id="crossword" value='crossword' name="gameType" ref={this.gameTypeRef} required/>
                                    <label htmlFor="crossword">Кроссворд</label>
                                </div>
                                <div>
                                    <input type="radio" id="fillword" value='wordsoup' name="gameType" ref={this.gameTypeRef} required/>
                                    <label htmlFor="fillword">Филворд</label>
                                </div>
                                <div>
                                    <input type="radio" id="rebus" value='rebus' name="gameType" ref={this.gameTypeRef} required/>
                                    <label htmlFor="rebus">Ребусы</label>
                                </div>
                            </div>
                            <div className='input-interaction-format'>
                                <h2>ФОРМАТ ВВОДА</h2>
                                <div>
                                    <input 
                                    type="radio" 
                                    id="set-topic" 
                                    value='topic' 
                                    name='inputType' 
                                    onChange={this.handleInteractionFormatChange}
                                    required
                                    ref={this.inputTypeRef}/>

                                    <label htmlFor="set-topic">Задать тему</label>
                                    
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

                                    <label htmlFor="set-text">Задать текст</label>
                                    
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
                                    <label htmlFor="upload-file">Загрузить файл</label>

                                        <div className='file-input' id='file-input-div' style={{ display: 'none' }}>
                                            <input type='file' 
                                            className='file-input-area' 
                                            id='file-upload' 
                                            
                                            ref={this.fileInputRef}
                                            name='file-upload'
                                            onChange={this.handleFileSelected}/>

                                            <label htmlFor="file-upload" className="file-input-label">
                                                {/* Ошибка */}
                                                {this.state.fileLoadError && (
                                                    <div className="file-load-indicator error">
                                                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-1.5-5.009c0-.867.659-1.491 1.491-1.491.85 0 1.509.624 1.509 1.491 0 .867-.659 1.509-1.509 1.509-.832 0-1.491-.642-1.491-1.509zM11.172 6a.5.5 0 0 0-.499.522l.306 7a.5.5 0 0 0 .5.478h1.043a.5.5 0 0 0 .5-.478l.305-7a.5.5 0 0 0-.5-.522h-1.655z"/>
                                                        </svg>
                                                        Ошибка загрузки
                                                    </div>
                                                )}
                                                
                                                {/* Прогресс */}
                                                {!this.state.fileLoadError && this.state.fileLoadProgress > 0 && this.state.fileLoadProgress < 100 && (
                                                    <div className="file-load-indicator loading">
                                                        <div className="file-progress-bar">
                                                            <div 
                                                                className="file-progress-fill"
                                                                style={{ width: `${this.state.fileLoadProgress}%` }}
                                                            />
                                                        </div>
                                                        <span>Загружаем файл: {this.state.fileLoadProgress}%</span>
                                                    </div>
                                                )}

                                                {/* Все загружено */}
                                                {this.state.isFileLoaded && !this.state.fileLoadError && this.state.fileLoadProgress === 100 && (
                                                    <div className="file-load-indicator success">
                                                        <svg xmlns="http://www.w3.org/2000/svg" 
                                                             viewBox="0 0 52 52" enable-background="new 0 0 52 52">
                                                            <path fill="#4dc83f" d="M26,2C12.7,2,2,12.7,2,26s10.7,24,24,24s24-10.7,24-24S39.3,2,26,2z M39.4,20L24.1,35.5
                                                            c-0.6,0.6-1.6,0.6-2.2,0L13.5,27c-0.6-0.6-0.6-1.6,0-2.2l2.2-2.2c0.6-0.6,1.6-0.6,2.2,0l4.4,4.5c0.4,0.4,1.1,0.4,1.5,0L35,15.5
                                                            c0.6-0.6,1.6-0.6,2.2,0l2.2,2.2C40.1,18.3,40.1,19.3,39.4,20z"/>
                                                        </svg>
                                                        Файл загружен
                                                    </div>
                                                )}

                                                {/* Исходная иконка, если ничего не происходит */}
                                                {this.state.fileLoadProgress === 0 && !this.state.isFileLoaded && !this.state.fileLoadError && (
                                                    <div className="file-load-indicator choosing">
                                                        <svg  viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" >
                                                            <path d="M15.85 3.15l-2.99-3A.508.508 0 0 0 12.5 0H3.4A1.417 1.417 0 0 0 2 1.43v15.14A1.417 1.417 0 0 0 3.4 18h11.2a1.417 1.417 0 0 0 1.4-1.43V3.5a.47.47 0 0 0-.15-.35zM5.026 2H10a1 1 0 0 1 0 2H5.026a1 1 0 0 1 0-2zM13 16H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2z"/>
                                                        </svg>
                                                        Выберите файл
                                                    </div>
                                                    
                                                )}
                                            </label>

                                        </div>
                                </div>
                            </div>
                            <div className='input-difficulty-of-game'>
                                <h2>СЛОЖНОСТЬ</h2>
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
                            <div className='input-puzzle-size'>
                                <h2>КОЛИЧЕСТВО СЛОВ</h2>
                                <input type="number" ref={this.totalWordsRef} id='total-words' name="totalWords" min="5" max="20" step="1" required/>
                            </div>
                            {/*<div className='open-full-settings-button'>
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
                            </div>*/}
                            <button type='submit' className='generate-puzzle-button'>
                                {isLTI && isConfigureMode ? 'Сохранить конфигурацию' : 'Сгенерировать'}
                            </button>
                        </form>
                    </section>
                    {/*{shouldShowSidebar && (
                        <>
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
                            </section>}
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
                                            <input 
                                                className='input-puzzle-name' 
                                                type='text' 
                                                placeholder='НАЗВАНИЕ'
                                                onChange={(e) => this.setState({ puzzleNameForSave: e.target.value } )}required 
                                            />
                                            <div className='input-type-of-puzzle'>
                                                <h2>ВИД ГОЛОВОЛОМКИ</h2>
                                                <div>
                                                    <input type="radio" id="crossword" value='crossword' name="gameType" ref={this.gameTypeRef} required/>
                                                    <label htmlFor="crossword">Кроссворд</label>
                                                </div>
                                                <div>
                                                    <input type="radio" id="fillword" value='wordsoup' name="gameType" ref={this.gameTypeRef} required/>
                                                    <label htmlFor="fillword">Филворд</label>
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

                                                    <label htmlFor="set-topic">Задать тему</label>
                                                    
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

                                                    <label htmlFor="set-text">Задать текст</label>
                                                    
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
                                                    <label htmlFor="upload-file">Загрузить файл</label>

                                                        <div className='file-input' id='file-input-div' style={{ display: 'none' }}>
                                                            <input type='file' 
                                                            className='file-input-area' 
                                                            id='file-upload' 
                                                            
                                                            ref={this.fileInputRef}
                                                            name='file-upload'/>

                                                            <label htmlFor="file-upload" className="file-input-label">
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
                                                {isLTI && isConfigureMode ? 'Сохранить конфигурацию' : 'Генерировать'}
                                            </button>
                                        </form>
                                    </div>
                                    <Link to="/account" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className='game-my-puzzles-open'>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox='0 0 32 32' fill="none">
                                                <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                d="M10.667 8h16M5.333 8.013 5.347 8M5.333 16.013l.014-.015M5.333 24.013l.014-.015M10.667 
                                                16h16M10.667 24h16"/>
                                            </svg>
                                            <p>Мои головоломки</p>
                                        </div>
                                    </Link>
                                </div>
                            </section>
                        </>
                    )}*/}
                    <section id='dispay-game-on-screen'>
                        <section id='crossword-and-clues'>
                            <div id="preloader-container" style={{display: 'none'}}>
                                <Preloader/>
                            </div>
                            {(!this.state.isEditing && currentGameData?.gameType !== 'rebus') && (
                                <div id="crossword-container" ref={this.crosswordContainerRef} className={this.state.isEditing ? 'grid-disabled' : ''} style={{display: 'none'}}></div>
                            )}
                            {currentGameData && currentGameData.gameType === 'rebus' && (
                                <div className="rebus-wrapper">
                                    <RebusDisplay gameData={currentGameData} />
                                </div>
                            )}
                            <section className='puzzle-info-and-iditing'>
                                {this.state.isEditing && (
                                    <div className='edit-puzzle-info-container'>
                                        <div className='edit-puzzle-info-wrapper'>
                                            <input 
                                                type="text"
                                                value={this.state.puzzleNameForSave}
                                                onChange={(e) => this.handlePuzzleNameChangeInEdit(e.target.value)}
                                                placeholder="Название пазла"
                                                className="puzzle-name-edit-input"
                                            />
                                        </div>
                                        <div className='edit-puzzle-info-wrapper'>
                                            <div className='edit-puzzle-info-buttons'>
                                                <button
                                                    className="game-action-btn save-changes-btn"
                                                    onClick={this.handleSaveChangesAndRegenerate}
                                                    title='Сохранить изменения и перегенерировать сетку'
                                                    disabled={this.state.isLoading}
                                                >
                                                    {this.state.isLoading ? "Сохранение..." : "Сохранить"}
                                                </button>
                                                <button
                                                    className="game-action-btn cancel-edit-btn"
                                                    onClick={this.handleCancelEdit}
                                                    title='Отменить редактирование'
                                                    disabled={this.state.isLoading}
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Скрываем clues-container для ребусов */}
                                {currentGameData && currentGameData.gameType === 'rebus' ?
                                    <div id="clues-container" ref={this.cluesContainerRef} style={{display: 'none', padding: 0}}></div>
                                 :
                                    <div id="clues-container" ref={this.cluesContainerRef} style={{display: 'none'}}></div>
                                }
                            </section>
                        </section>
                    </section>
                    {/*{!isLTI && isAuthenticated && this.state.currentGameData && (
                        <div className="game-actions">
                            {!this.state.isEditing && this.state.currentGameData && (
                                <button
                                    className="game-action-btn edit-puzzle-btn"
                                    onClick={this.handleEnterEditMode}
                                    title='Редактировать слова и подсказки'
                                    disabled={this.state.isLoading}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.0207 5.82839L15.8491 2.99996L20.7988 7.94971L17.9704 10.7781M13.0207 5.82839L3.41405 15.435C3.22652 15.6225 3.12116 15.8768 3.12116 16.1421V20.6874H7.66648C7.93181 20.6874 8.18613 20.582 8.37367 20.3945L17.9704 10.7781M13.0207 5.82839L17.9704 10.7781" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </button>
                            )}

                            {!this.state.isEditing && (
                                <>
                                    <button
                                        className="game-action-btn save-puzzle-btn"
                                        onClick={this.handleActualSavePuzzle}
                                        title='Сохранить в свои головоломки'
                                        disabled={this.state.isLoading || !!this.state.currentPuzzleId}
                                    >
                                       <SaveButton />
                                    </button>
                                    <button
                                        className="game-action-btn download-pdf-btn"
                                        onClick={this.handleDownloadPdf}
                                        title='Cкачать в PDF'
                                        disabled={this.state.isLoading}
                                    >
                                        <DownloadPdf />
                                    </button>
                                </>
                            )}
                        </div>
                    )}*/}
                </main>
            </>
        );
    }
}

export default GameGenerator;