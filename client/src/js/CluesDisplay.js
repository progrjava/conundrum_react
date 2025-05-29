/**
 * Класс, отвечающий за отображение и управление подсказками кроссворда и филворда
 */
export class CluesDisplay {
    /**
     * Отображает подсказки для кроссворда
     * @param {Array<Object>} words - Массив объектов слов, содержащих позицию и ориентацию
     */
    static displayCrosswordClues(words) {
        const cluesContainer = document.getElementById('clues-container');
        cluesContainer.style.padding = '5%';
        cluesContainer.innerHTML = '';
  
        const acrossClues = words.filter(wordData => wordData.orientation === 'across')
            .sort((a, b) => a.position - b.position);
        const downClues = words.filter(wordData => wordData.orientation === 'down')
            .sort((a, b) => a.position - b.position);
  
        const acrossContainer = this.createClueList(acrossClues, 'По горизонтали');
        const downContainer = this.createClueList(downClues, 'По вертикали');
  
        cluesContainer.appendChild(acrossContainer);
        cluesContainer.appendChild(downContainer);
    }
  
    /**
     * Отображает подсказки для филворда
     * @param {Array<Object>} words - Массив объектов слов
     */
    static displayWordSoupClues(words) {
        const cluesContainer = document.getElementById('clues-container');
        cluesContainer.style.padding = '5%';
        cluesContainer.innerHTML = '';
  
        // Преобразуем слова в формат для отображения
        const cluesData = words.map((word, index) => ({
            position: index + 1,
            clue: word.clue,
            word: word.word,
            cleanWord: word.word.replace(/\s+/g, '')
        }));
  
        const container = this.createClueList(cluesData, 'Слова в филворде');
        cluesContainer.appendChild(container);
    }
  
    /**
     * Создает список подсказок
     * @private
     */
    static createClueList(cluesDataArray, title, isEditingMode = false, onItemChange = null, gameType = 'crossword') {
        const list = document.createElement('ul');
        list.className = 'word-list';

        cluesDataArray.forEach(wordData => {
            const li = document.createElement('li');
            li.className = 'word-item';
            const itemIdentifier = typeof wordData.originalArrayIndex === 'number' ? wordData.originalArrayIndex : wordData.position;

            if (wordData.cleanWord && !isEditingMode) {
                li.setAttribute('data-word', wordData.word);
                li.setAttribute('data-clean-word', wordData.cleanWord);
            }

            const positionSpan = document.createElement('span');
            positionSpan.textContent = `${wordData.position}. `;
            positionSpan.className = 'clue-position';
            li.appendChild(positionSpan);

            if (isEditingMode) {
                const clueTextarea = document.createElement('textarea');
                clueTextarea.className = 'editable-clue-textarea';
                clueTextarea.value = wordData.clue;
                clueTextarea.rows = 3;
                clueTextarea.oninput = (e) => {
                    if (onItemChange) {
                        onItemChange(itemIdentifier, 'clue', e.target.value);
                    }
                };
                li.appendChild(clueTextarea);

                const wordInput = document.createElement('input');
                wordInput.type = 'text';
                wordInput.className = 'editable-word-input';
                wordInput.value = wordData.word || wordData.answer || '';
                wordInput.oninput = (e) => {
                    if (onItemChange) {
                        onItemChange(itemIdentifier, 'word', e.target.value);
                    }
                };
                li.appendChild(wordInput);
            } else {
                const clueText = document.createElement('span');
                clueText.className = 'clue-text-content';
                clueText.textContent = wordData.clue;
                li.appendChild(clueText);

                const showAnswerButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                showAnswerButton.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                showAnswerButton.setAttribute('viewBox', '0 0 24 24');
                showAnswerButton.setAttribute('fill', 'none');
                showAnswerButton.classList.add('show-answer-button');

                const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path1.setAttribute('stroke', '#62E953');
                path1.setAttribute('stroke-linecap', 'round');
                path1.setAttribute('stroke-linejoin', 'round');
                path1.setAttribute('stroke-width', '2');
                path1.setAttribute('d', 'M3 13c3.6-8 14.4-8 18 0');

                const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path2.setAttribute('stroke', '#62E953');
                path2.setAttribute('stroke-linecap', 'round');
                path2.setAttribute('stroke-linejoin', 'round');
                path2.setAttribute('stroke-width', '2');
                path2.setAttribute('d', 'M12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z');

                showAnswerButton.appendChild(path1);
                showAnswerButton.appendChild(path2);

                showAnswerButton.addEventListener('click', () => {
                    showAnswerButton.remove();
                    const displayWord = wordData.word || wordData.originalWord || wordData.answer;
                    clueText.textContent += ` (${displayWord})`;
                });
                li.appendChild(showAnswerButton);
            }
            list.appendChild(li);
        });

        const container = document.createElement('div');
        container.className = 'clues-section';
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        container.appendChild(titleElement);
        container.appendChild(list);
        return container;
    }

    // Новый метод для отображения подсказок в режиме редактирования
    static renderEditable(wordsToEdit, gameType, onItemChangeCallback) {
        const cluesContainer = document.getElementById('clues-container');
        if (!cluesContainer) return;
        cluesContainer.style.padding = '5%';
        cluesContainer.innerHTML = '';

        if (gameType === 'crossword') {
            const acrossClues = wordsToEdit.filter(wordData => wordData.orientation === 'across')
                .sort((a, b) => a.position - b.position);
            const downClues = wordsToEdit.filter(wordData => wordData.orientation === 'down')
                .sort((a, b) => a.position - b.position);

            const acrossContainer = this.createClueList(acrossClues, 'По горизонтали (редактирование)', true, onItemChangeCallback, gameType);
            const downContainer = this.createClueList(downClues, 'По вертикали (редактирование)', true, onItemChangeCallback, gameType);

            cluesContainer.appendChild(acrossContainer);
            cluesContainer.appendChild(downContainer);
        } else if (gameType === 'wordsoup') {
            const cluesData = wordsToEdit.map((word, index) => ({
                ...word,
                position: word.position || index + 1,
            }));
            const container = this.createClueList(cluesData, 'Слова в филворде (редактирование)', true, onItemChangeCallback, gameType);
            cluesContainer.appendChild(container);
        }
    }


}
