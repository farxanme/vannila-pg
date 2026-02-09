/**
 * Timer/Countdown Class
 * Supports multiple instances without interference
 */
export class Timer {
  constructor(options = {}) {
    this.duration = options.duration || 0; // in seconds
    this.remaining = this.duration;
    this.onTick = options.onTick || null;
    this.onEnd = options.onEnd || null;
    this.onOneThird = options.onOneThird || null;
    this.onTwoThird = options.onTwoThird || null;
    this.intervalId = null;
    this.isRunning = false;
    this.startTime = null;
    this.pausedTime = 0;
    
    // Callback thresholds
    this.oneThirdCalled = false;
    this.twoThirdCalled = false;
  }

  /**
   * Start timer
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now() - (this.pausedTime * 1000);
    
    this.intervalId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.remaining = Math.max(0, this.duration - elapsed);
      
      // Check thresholds
      const progress = elapsed / this.duration;
      
      if (!this.twoThirdCalled && progress >= 2/3) {
        this.twoThirdCalled = true;
        if (this.onTwoThird) {
          this.onTwoThird(this.remaining);
        }
      } else if (!this.oneThirdCalled && progress >= 1/3) {
        this.oneThirdCalled = true;
        if (this.onOneThird) {
          this.onOneThird(this.remaining);
        }
      }
      
      // Call tick callback
      if (this.onTick) {
        this.onTick(this.remaining);
      }
      
      // Check if finished
      if (this.remaining <= 0) {
        this.stop();
        if (this.onEnd) {
          this.onEnd();
        }
      }
    }, 1000);
  }

  /**
   * Stop timer
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.pausedTime = 0;
  }

  /**
   * Pause timer
   */
  pause() {
    if (!this.isRunning) return;
    
    this.stop();
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.pausedTime = elapsed;
  }

  /**
   * Resume timer
   */
  resume() {
    if (this.isRunning) return;
    
    this.start();
  }

  /**
   * Reset timer
   */
  reset(newDuration = null) {
    this.stop();
    if (newDuration !== null) {
      this.duration = newDuration;
    }
    this.remaining = this.duration;
    this.pausedTime = 0;
    this.oneThirdCalled = false;
    this.twoThirdCalled = false;
  }

  /**
   * Get formatted time string (MM:SS)
   * @returns {string} - Formatted time
   */
  getFormattedTime() {
    const minutes = Math.floor(this.remaining / 60);
    const seconds = this.remaining % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  /**
   * Get remaining seconds
   * @returns {number} - Remaining seconds
   */
  getRemaining() {
    return this.remaining;
  }
}
