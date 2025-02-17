/**
 * Модуль elements.js
 * Содержит ссылки на DOM-элементы, используемые в приложении
 */

export const elements = {
    // Функция для инициализации элементов
    initialize() {
        this.crosswordForm = document.getElementById('crossword-form');
        this.gameTypeSelect = document.getElementById('game-type');
        this.inputTypeSelect = document.getElementById('input-type');
        this.documentTextarea = document.getElementById('document');
        this.fileUploadInput = document.getElementById('file-upload');
        this.topicInput = document.getElementById('topic');
        this.totalWordsInput = document.getElementById('total-words');
        this.crosswordContainer = document.getElementById('crossword-container');
        this.cluesContainer = document.getElementById('clues-container');
    }
};