class RateLimiter {
    constructor(limit = 20, interval = 60000) {
        this.limit = limit;
        this.interval = interval;
        this.requests = [];
    }

    tryConsume() {
        const now = Date.now();
        // Удаляем старые записи
        this.requests = this.requests.filter(time => now - time < this.interval);

        if (this.requests.length < this.limit) {
            this.requests.push(now);
            return true;
        }
        return false;
    }
}
module.exports = RateLimiter;