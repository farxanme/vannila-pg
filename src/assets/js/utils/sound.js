/**
 * Sound Manager - Background sound playback
 */
class SoundManager {
  constructor() {
    this.enabled = true;
    this.sounds = new Map();
    this.audioContext = null;
  }

  /**
   * Initialize audio context
   */
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (err) {
      console.warn('Audio context not supported');
    }
  }

  /**
   * Enable/disable sound
   * @param {boolean} enabled - Enable state
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Register a sound
   * @param {string} name - Sound name
   * @param {string} url - Sound file URL
   */
  registerSound(name, url) {
    this.sounds.set(name, url);
  }

  /**
   * Play a sound
   * @param {string} name - Sound name
   * @param {number} volume - Volume (0-1)
   */
  play(name, volume = 0.5) {
    if (!this.enabled) return;
    
    const url = this.sounds.get(name);
    if (!url) {
      console.warn(`Sound "${name}" not found`);
      return;
    }

    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(err => {
      console.warn('Sound play failed:', err);
    });
  }

  /**
   * Play system beep
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in ms
   */
  beep(frequency = 800, duration = 200) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
