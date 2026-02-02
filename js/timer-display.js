/**
 * Reusable Timer Display Module
 * Can be used by both interval timer and relaxation protocol
 *
 * UMD pattern for consistency with timer-logic.js
 */
(function(global) {
    'use strict';

    /**
     * Format milliseconds to M:SS or MM:SS
     * @param {number} ms - Milliseconds to format
     * @returns {string} Formatted time string
     */
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Format milliseconds fraction (.XX)
     * @param {number} ms - Milliseconds to format
     * @returns {string} Formatted fraction string
     */
    function formatMs(ms) {
        const fraction = Math.floor((ms % 1000) / 10);
        return `.${fraction.toString().padStart(2, '0')}`;
    }

    /**
     * TimerDisplay class - manages a countdown timer UI
     */
    class TimerDisplay {
        /**
         * Create a timer display
         * @param {Object} options - Configuration options
         * @param {HTMLElement} options.countdownElement - Element to display MM:SS
         * @param {HTMLElement} [options.msElement] - Optional element to display .XX
         * @param {Function} [options.onComplete] - Callback when timer reaches zero
         * @param {Function} [options.onTick] - Callback on each frame with remaining ms
         */
        constructor(options) {
            this.countdownEl = options.countdownElement;
            this.msEl = options.msElement || null;
            this.onComplete = options.onComplete || (() => {});
            this.onTick = options.onTick || (() => {});

            this.targetMs = 0;
            this.endTime = null;
            this.animationId = null;
            this.isPaused = false;
            this.remainingAtPause = 0;
            this._boundTick = this._tick.bind(this);
        }

        /**
         * Start countdown from specified duration
         * @param {number} durationMs - Duration in milliseconds
         */
        start(durationMs) {
            this.stop(); // Clear any existing timer
            this.targetMs = durationMs;
            this.endTime = Date.now() + durationMs;
            this.isPaused = false;
            this.remainingAtPause = 0;
            this._tick();
        }

        /**
         * Pause the countdown
         */
        pause() {
            if (this.isPaused || this.animationId === null) return;

            this.isPaused = true;
            this.remainingAtPause = Math.max(0, this.endTime - Date.now());
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            this._updateDisplay(this.remainingAtPause);
        }

        /**
         * Resume from pause
         */
        resume() {
            if (!this.isPaused) return;

            this.isPaused = false;
            this.endTime = Date.now() + this.remainingAtPause;
            this._tick();
        }

        /**
         * Reset timer to initial duration (paused state)
         */
        reset() {
            this.stop();
            this.isPaused = false;
            this.remainingAtPause = 0;
            this._updateDisplay(this.targetMs);
        }

        /**
         * Stop timer completely
         */
        stop() {
            if (this.animationId !== null) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.endTime = null;
        }

        /**
         * Set display to a specific duration without starting
         * @param {number} durationMs - Duration to display
         */
        setDisplay(durationMs) {
            this.targetMs = durationMs;
            this._updateDisplay(durationMs);
        }

        /**
         * Internal tick function - runs on each animation frame
         * @private
         */
        _tick() {
            const remaining = Math.max(0, this.endTime - Date.now());
            this._updateDisplay(remaining);
            this.onTick(remaining);

            if (remaining <= 0) {
                this.animationId = null;
                this.onComplete();
                return;
            }

            this.animationId = requestAnimationFrame(this._boundTick);
        }

        /**
         * Update DOM elements with current time
         * @param {number} ms - Milliseconds to display
         * @private
         */
        _updateDisplay(ms) {
            if (this.countdownEl) {
                this.countdownEl.textContent = formatTime(ms);
            }
            if (this.msEl) {
                this.msEl.textContent = formatMs(ms);
            }
        }

        /**
         * Get current timer state
         * @returns {Object} State object with isPaused, isRunning, remaining
         */
        getState() {
            return {
                isPaused: this.isPaused,
                isRunning: this.animationId !== null,
                remaining: this.isPaused
                    ? this.remainingAtPause
                    : (this.endTime ? Math.max(0, this.endTime - Date.now()) : this.targetMs),
                targetMs: this.targetMs
            };
        }
    }

    // Export
    const exports = {
        TimerDisplay,
        formatTime,
        formatMs
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exports;
    } else {
        global.TimerDisplayModule = exports;
    }

})(typeof window !== 'undefined' ? window : this);
