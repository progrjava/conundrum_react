class ActivityTracker {
    constructor() {
        this.startTime = null;
        this.attempts = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.isTracking = false;
    }

    startTracking() {
        this.startTime = new Date();
        this.isTracking = true;
    }

    stopTracking() {
        if (this.isTracking) {
            const stats = this.getStats();
            this.reset();
            return stats;
        }
        return null;
    }

    recordAttempt(isCorrect) {
        this.attempts++;
        if (isCorrect) {
            this.correctAnswers++;
        } else {
            this.incorrectAnswers++;
        }
    }

    getSessionDuration() {
        if (!this.startTime) return 0;
        return Math.floor((new Date() - this.startTime) / 1000); // в секундах
    }

    getStats() {
        return {
            duration: this.getSessionDuration(),
            attempts: this.attempts,
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            accuracy: this.attempts > 0 ? 
                (this.correctAnswers / this.attempts * 100).toFixed(2) : 0
        };
    }

    reset() {
        this.startTime = null;
        this.attempts = 0;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.isTracking = false;
    }
}

export default ActivityTracker; 