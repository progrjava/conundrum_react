class CircuitBreaker {
    constructor(failureThreshold = 5, recoveryTime = 60000) {
        this.failureThreshold = failureThreshold;
        this.recoveryTime = recoveryTime; // 60 секунд
        this.state = 'CLOSED'; // Состояния: CLOSED, OPEN
        this.failures = 0;
        this.lastFailureTime = null;
    }

    async call(action) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime > this.recoveryTime) {
                console.log('Circuit Breaker: Пробуем восстановиться...');
                this.state = 'CLOSED';
                this.failures = 0;
            } else {
                throw new Error('Circuit Breaker is OPEN. Service temporarily unavailable.');
            }
        }

        try {
            const result = await action();
            this.failures = 0; // Сброс при успехе
            return result;
        } catch (error) {
            this.failures++;
            this.lastFailureTime = Date.now();
            if (this.failures >= this.failureThreshold) {
                this.state = 'OPEN';
                console.error('Circuit Breaker: Слишком много ошибок, ЦЕПЬ РАЗОМКНУТА.');
            }
            throw error;
        }
    }
}
module.exports = CircuitBreaker;