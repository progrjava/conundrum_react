class ActivityTracker {
    constructor() {
        this.startTime = null;
        this.attempts = 0; // Попытки ввода/ответа
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.isTracking = false;
        this.generatedGames = []; // <-- Добавляем массив для хранения инфо о играх
        console.log("ActivityTracker initialized"); // Лог при создании
    }

    startTracking() {
        this.startTime = new Date();
        this.isTracking = true;
        // Сбрасываем счетчики при старте новой сессии отслеживания
        this.attempts = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.generatedGames = [];
        console.log("Activity tracking started at:", this.startTime);
    }

    stopTracking() {
        if (this.isTracking) {
            const stats = this.getStats();
            console.log("Activity tracking stopped. Final Stats:", stats);
            console.log("Generated Games during session:", this.generatedGames);
            this.isTracking = false; // Устанавливаем флаг в false
            // Не будем делать reset здесь, чтобы статы были доступны
            return stats;
        }
        console.log("Activity tracking already stopped.");
        return null;
    }

    // Новый метод для записи информации о сгенерированной игре
    recordGameGenerated(gameDetails) {
        if (!this.isTracking) {
            console.warn("Attempted to record game generated, but tracking is not active.");
            // Может быть, стоит начать отслеживание, если оно еще не начато?
            // this.startTracking();
            // return; // Или просто выйти
        }
        const record = {
            ...gameDetails, // gameType, inputType, totalWords
            timestamp: new Date()
        };
        this.generatedGames.push(record);
        console.log("Recorded generated game:", record);
    }


    recordAttempt(isCorrect) {
       if (!this.isTracking) {
            console.warn("Attempted to record attempt, but tracking is not active.");
            return;
        }
        this.attempts++;
        if (isCorrect) {
            this.correctAnswers++;
        } else {
            this.incorrectAnswers++;
        }
         console.log(`Attempt recorded. Correct: ${isCorrect}. Total attempts: ${this.attempts}, Correct: ${this.correctAnswers}, Incorrect: ${this.incorrectAnswers}`);
    }

    getSessionDuration() {
        // Рассчитываем длительность с момента старта до текущего момента ИЛИ до момента остановки
        const endTime = this.isTracking ? new Date() : (this.stopTime || this.startTime); // Добавим stopTime? Или всегда считать до 'now'?
        if (!this.startTime) return 0;
        // Корректнее считать от startTime до 'now', пока isTracking=true
        return Math.floor(((this.isTracking ? new Date() : this.startTime) - this.startTime) / 1000); // Считаем до текущего момента, если трекинг активен
    }

    getStats() {
        // Собираем статистику на текущий момент
        return {
            duration: this.getSessionDuration(),
            attempts: this.attempts,
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            accuracy: this.attempts > 0 ?
                (this.correctAnswers / this.attempts * 100).toFixed(2) : '0.00', // Гарантируем строку с 2 знаками
            generatedGamesCount: this.generatedGames.length
        };
    }

    reset() {
        console.log("Resetting activity tracker state.");
        this.startTime = null;
        this.attempts = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.isTracking = false;
        this.generatedGames = [];
    }
}

export default ActivityTracker;