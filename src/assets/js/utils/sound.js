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
    } catch {
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

    this.playAudioFromUrl(url, volume).catch((err) => {
      console.warn('Sound play failed:', err);
    });
  }

  /**
   * Play an audio source URL.
   * @param {string} url - Audio URL or blob URL
   * @param {number} volume - Volume (0-1)
   * @param {boolean} revokeAfterPlayback - Revoke object URL after playback
   * @returns {Promise<void>}
   */
  playAudioFromUrl(url, volume = 1, revokeAfterPlayback = false) {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      /** iOS Safari */
      audio.playsInline = true;
      audio.preload = 'auto';
      audio.volume = volume;
      audio.src = url;

      const revokeUrlIfNeeded = () => {
        if (revokeAfterPlayback) {
          URL.revokeObjectURL(url);
        }
      };

      audio.addEventListener('ended', revokeUrlIfNeeded, { once: true });
      audio.addEventListener(
        'error',
        () => {
          revokeUrlIfNeeded();
          reject(new Error('Audio playback failed'));
        },
        { once: true }
      );

      const tryPlay = () => {
        const playPromise = audio.play();
        if (!playPromise || typeof playPromise.then !== 'function') {
          resolve();
          return;
        }
        playPromise.then(() => resolve()).catch((err) => {
          revokeUrlIfNeeded();
          reject(err);
        });
      };

      if (audio.readyState >= window.HTMLMediaElement.HAVE_CURRENT_DATA) {
        tryPlay();
      } else {
        audio.addEventListener('canplay', tryPlay, { once: true });
        audio.load();
      }
    });
  }

  /**
   * Play an audio Blob response (for API audio streams).
   * @param {Blob} audioBlob - Audio blob
   * @param {number} volume - Volume (0-1)
   * @returns {Promise<void>}
   */
  async playAudioBlob(audioBlob, volume = 1) {
    if (!this.enabled) return;
    if (!audioBlob || !(audioBlob instanceof window.Blob) || audioBlob.size === 0) {
      throw new Error('Audio blob is empty or invalid');
    }
    const audioUrl = URL.createObjectURL(audioBlob);
    await this.playAudioFromUrl(audioUrl, volume, true);
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
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration / 1000
    );

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
