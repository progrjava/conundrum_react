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
        cluesContainer.style.padding = '50px';
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
        cluesContainer.style.padding = '50px';
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
    static createClueList(clues, title) {
        const list = document.createElement('ul');
        list.className = 'word-list';
  
        clues.forEach(wordData => {
            const li = document.createElement('li');
            li.className = 'word-item';
            if (wordData.cleanWord) {
                li.setAttribute('data-word', wordData.word);
                li.setAttribute('data-clean-word', wordData.cleanWord);
            }
            
            const clueText = document.createElement('span');
            clueText.textContent = `${wordData.position}. ${wordData.clue}`;
            li.appendChild(clueText);
  
            // Создание SVG элемента
            const showAnswerButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            showAnswerButton.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            showAnswerButton.setAttribute('width', '24');
            showAnswerButton.setAttribute('height', '24');
            showAnswerButton.setAttribute('fill', 'none');
            showAnswerButton.classList.add('show-answer-button'); // Добавляем класс для стилей

            // Первый путь
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('stroke', '#62E953');
            path1.setAttribute('stroke-linecap', 'round');
            path1.setAttribute('stroke-linejoin', 'round');
            path1.setAttribute('stroke-width', '2');
            path1.setAttribute('d', 'M3 13c3.6-8 14.4-8 18 0');

            // Второй путь
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('stroke', '#62E953');
            path2.setAttribute('stroke-linecap', 'round');
            path2.setAttribute('stroke-linejoin', 'round');
            path2.setAttribute('stroke-width', '2');
            path2.setAttribute('d', 'M12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z');

            // Добавляем пути в SVG
            showAnswerButton.appendChild(path1);
            showAnswerButton.appendChild(path2);

            // Добавление обработчика клика
            showAnswerButton.addEventListener('click', () => {
                showAnswerButton.remove();
                const displayWord = wordData.originalWord || wordData.word;
                clueText.textContent += ` (${displayWord})`;
            });

            // Добавление SVG в список
            li.appendChild(showAnswerButton);
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
}
