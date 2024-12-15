/**
 * Модуль elements.js
 * Содержит ссылки на DOM-элементы, используемые в приложении
 */

export const elements = {
    // Элементы формы кроссворда
    crosswordForm: document.getElementById('crossword-form'),
    gameTypeSelect: document.getElementById('game-type'),
    inputTypeSelect: document.getElementById('input-type'),
    documentTextarea: document.getElementById('document'),
    fileUploadInput: document.getElementById('file-upload'),
    topicInput: document.getElementById('topic'),
    totalWordsInput: document.getElementById('total-words'),
    
    // Элементы игрового поля
    crosswordContainer: document.getElementById('crossword-container'),
    cluesContainer: document.getElementById('clues-container')
    };