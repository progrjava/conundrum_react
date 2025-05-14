const PDFDocument = require('pdfkit');

/**
 * Генерирует PDF для кроссворда или филворда
 * @param {Object} gameData - Данные игры (grid, words, gameType, layout)
 * @returns {Promise<Buffer>} - Буфер PDF-файла
 */
async function generateGamePdf(gameData) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const fs = require('fs');
        doc.registerFont('Roboto', fs.readFileSync('fonts/RobotoMono.ttf'));
        doc.font('Roboto');

        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });
        doc.on('error', reject);

        try {
            const { gameType, grid, words, layout } = gameData;

            // Заголовок
            doc.fontSize(20).text(`${gameType === 'crossword' ? 'Кроссворд' : 'Филворд'}: ${gameData.name || 'Без названия'}`, {
                align: 'center'
            });
            doc.moveDown(0.5);

            // Сетка и получение данных о строках
            let gridInfo;
            if (gameType === 'crossword') {
                gridInfo = drawCrosswordGrid(doc, grid, layout);
            } else {
                gridInfo = drawWordSoupGrid(doc, grid);
            }

            // Подсказки
            drawCluesOrWords(doc, words, gameType, layout, gridInfo);

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Рисует сетку кроссворда
 * @param {PDFDocument} doc - Объект PDF
 * @param {Array<Array<string>>} grid - Сетка кроссворда
 * @param {Object} layout - Макет кроссворда
 * @returns {Object} - Информация о сетке (rowCount, startY)
 */
function drawCrosswordGrid(doc, grid, layout) {
    const cellSize = 20;
    const gridWidth = grid[0].length * cellSize;
    const gridHeight = grid.length * cellSize;
    const startX = (doc.page.width - gridWidth) / 2; // Центрируем
    const startY = doc.y + 20; // Небольшой фиксированный отступ

    // Рисуем сетку
    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const x = startX + col * cellSize;
            const y = startY + row * cellSize;

            // Пропускаем пустые ячейки
            if (grid[row][col] === '') {
                continue;
            }

            // Рисуем квадрат только для непустых ячеек
            doc.rect(x, y, cellSize, cellSize).stroke();

            // Номера для слов
            const word = layout?.result.find(w => w.startx - 1 === col && w.starty - 1 === row);
            if (word && word.position) {
                doc.fontSize(8).fillColor('black').text(word.position, x + 2, y + 2);
            }
        }
    }

    doc.moveDown(2); // Дополнительный отступ после сетки
    return { rowCount: grid.length, startY };
}

/**
 * Рисует сетку филворда
 * @param {PDFDocument} doc - Объект PDF
 * @param {Array<Array<string>>} grid - Сетка филворда
 * @returns {Object} - Информация о сетке (rowCount, startY)
 */
function drawWordSoupGrid(doc, grid) {
    const cellSize = 20;
    const gridWidth = grid[0].length * cellSize;
    const startX = (doc.page.width - gridWidth) / 2;
    const startY = doc.y;

    for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
            const x = startX + col * cellSize;
            const y = startY + row * cellSize;

            // Рисуем квадрат
            doc.rect(x, y, cellSize, cellSize).stroke();

            // Вписываем букву
            if (grid[row][col]) {
                doc.fontSize(10)
                    .text(grid[row][col], x, y + 3, { width: cellSize, align: 'center' });
            }
        }
    }

    doc.moveDown(2); // Дополнительный отступ после сетки
    return { rowCount: grid.length, startY };
}

/**
 * Рисует подсказки для кроссворда или филворда
 * @param {PDFDocument} doc - Объект PDF
 * @param {Array} words - Список слов/подсказок
 * @param {string} gameType - Тип игры
 * @param {Object} layout - Макет кроссворда
 * @param {Object} gridInfo - Информация о сетке (rowCount, startY)
 */
function drawCluesOrWords(doc, words, gameType, layout, gridInfo) {
    // Проверка высоты страницы
    const checkPageOverflow = (y) => {
        if (y > doc.page.height - 100) {
            doc.addPage();
            doc.x = 50; // Сбрасываем X для новой страницы
            return 50; // Начинаем с верхнего отступа
        }
        return y;
    };

    // Вычисляем начальную Y-координату для подсказок
    const cellSize = 20 ;
    const clueOffset = 40; // Фиксированный отступ после сетки
    let clueY = gridInfo.startY + (gridInfo.rowCount * cellSize) + clueOffset;
    clueY = checkPageOverflow(clueY);
    doc.y = clueY;
    doc.x = 50; // Сбрасываем позицию X для левого края

    doc.fontSize(12).text('Подсказки:', {
        underline: true,
        align: 'left'
    });
    doc.moveDown(1);

    if (gameType === 'crossword') {
        // По горизонтали
        const acrossClues = words.filter(w => w.orientation === 'across').sort((a, b) => a.position - b.position);
        if (acrossClues.length) {
            doc.y = checkPageOverflow(doc.y);
            doc.x = 50; // Сбрасываем X
            doc.fontSize(12).text('По горизонтали:', { align: 'left' });
            acrossClues.forEach(clue => {
                doc.y = checkPageOverflow(doc.y);
                doc.x = 50; // Сбрасываем X для каждой подсказки
                doc.text(`${clue.position}. ${clue.clue}`, { align: 'left', indent: 10 });
            });
            doc.moveDown(1);
        }

        // По вертикали
        const downClues = words.filter(w => w.orientation === 'down').sort((a, b) => a.position - b.position);
        if (downClues.length) {
            doc.y = checkPageOverflow(doc.y);
            doc.x = 50; // Сбрасываем X
            doc.fontSize(12).text('По вертикали:', { align: 'left' });
            downClues.forEach(clue => {
                doc.y = checkPageOverflow(doc.y);
                doc.x = 50; // Сбрасываем X для каждой подсказки
                doc.text(`${clue.position}. ${clue.clue}`, { align: 'left', indent: 10 });
            });
        }
    } else {
        // Для филворда: выводим подсказки с нумерацией
        doc.fontSize(12);
        words.forEach((word, index) => {
            doc.y = checkPageOverflow(doc.y);
            doc.x = 50; // Сбрасываем X для каждой подсказки
            doc.text(`${index + 1}. ${word.clue}`, { align: 'left', indent: 10 });
        });
    }
}

module.exports = { generateGamePdf };