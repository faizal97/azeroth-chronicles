// Simple rate limiter for API calls
class RateLimiter {
  private queue: Array<() => Promise<unknown>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minInterval = 3000; // Minimum 3 seconds between requests
  private disabled = false;
  private disabledUntil = 0;

  async addRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    // Check if disabled due to rate limiting
    if (this.disabled && Date.now() < this.disabledUntil) {
      throw new Error('Rate limiter temporarily disabled');
    }
    
    // Re-enable if disabled period has passed
    if (this.disabled && Date.now() >= this.disabledUntil) {
      this.disabled = false;
      console.log('Rate limiter re-enabled');
    }

    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await requestFn();
          resolve(result);
        } catch (error) {
          // If we get a rate limit error, disable for 5 minutes
          if (error instanceof Error && error.message.includes('429')) {
            this.disabled = true;
            this.disabledUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
            console.warn('Rate limiter disabled for 5 minutes due to 429 error');
          }
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  // Method to manually disable for testing
  public disable(minutes: number = 5) {
    this.disabled = true;
    this.disabledUntil = Date.now() + minutes * 60 * 1000;
    console.log(`Rate limiter manually disabled for ${minutes} minutes`);
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      if (timeSinceLastRequest < this.minInterval) {
        const waitTime = this.minInterval - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      const request = this.queue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        await request();
      }
    }

    this.processing = false;
  }
}

// Global rate limiters for different API endpoints
export const entityDetectionLimiter = new RateLimiter();
export const entityDescriptionLimiter = new RateLimiter();