/**
 * Pure timer calculation logic for the Stay Timer app.
 * This module contains no DOM dependencies and can be tested in isolation.
 *
 * UMD pattern: works in browser (global), Node (CommonJS), and ES modules.
 */
(function(global) {
    /**
     * Calculate the next target duration with upward-only variance.
     * @param {number} baseTarget - The base target in milliseconds
     * @param {number} maxVariance - Maximum upward variance (default 0.2 = 20%)
     * @param {number} [randomValue] - Optional random value 0-1 for testing
     * @returns {number} The calculated target with variance applied
     */
    function calculateNextTarget(baseTarget, maxVariance, randomValue) {
        if (maxVariance === undefined) maxVariance = 0.2;
        if (randomValue === undefined) randomValue = Math.random();
        const multiplier = 1 + (randomValue * maxVariance);
        return Math.round(baseTarget * multiplier);
    }

    /**
     * Calculate what the next round's target should be after a successful round.
     * @param {number} currentTarget - The target that was just completed
     * @param {number} intervalMs - The interval to add
     * @param {number} maxVariance - Maximum upward variance (default 0.2)
     * @param {number} [randomValue] - Optional random value for testing
     * @returns {number} The next round's target
     */
    function calculateSuccessTarget(currentTarget, intervalMs, maxVariance, randomValue) {
        if (maxVariance === undefined) maxVariance = 0.2;
        if (randomValue === undefined) randomValue = Math.random();
        const baseTarget = currentTarget + intervalMs;
        return calculateNextTarget(baseTarget, maxVariance, randomValue);
    }

    /**
     * Calculate what the next round's target should be after a fail.
     * Returns the exact last completed target (no variance).
     * @param {number} lastCompletedTarget - The last successfully completed target
     * @param {number} baselineMs - The baseline duration (used if nothing completed yet)
     * @returns {number} The recovery target
     */
    function calculateFailTarget(lastCompletedTarget, baselineMs) {
        return lastCompletedTarget > 0 ? lastCompletedTarget : baselineMs;
    }

    /**
     * Represents the state of a training session.
     */
    class TimerSession {
        constructor(baselineMs, intervalMs, maxVariance) {
            if (maxVariance === undefined) maxVariance = 0.2;
            this.baselineMs = baselineMs;
            this.intervalMs = intervalMs;
            this.maxVariance = maxVariance;
            this.currentTarget = baselineMs;  // First round is exact baseline
            this.lastCompletedTarget = 0;
            this.round = 1;
            this.history = [];
        }

        /**
         * Called when a round is successfully completed.
         * @param {number} [randomValue] - Optional random value for testing
         * @returns {number} The next round's target
         */
        completeRound(randomValue) {
            if (randomValue === undefined) randomValue = Math.random();

            // Record this completion
            this.history.push({ round: this.round, duration: this.currentTarget });
            this.lastCompletedTarget = this.currentTarget;

            // Advance to next round
            this.round++;

            // Calculate next target: current + interval, then apply variance
            this.currentTarget = calculateSuccessTarget(
                this.lastCompletedTarget,
                this.intervalMs,
                this.maxVariance,
                randomValue
            );

            return this.currentTarget;
        }

        /**
         * Called when the dog fails (breaks stay).
         * @returns {number} The recovery target (exact last completed)
         */
        fail() {
            this.currentTarget = calculateFailTarget(this.lastCompletedTarget, this.baselineMs);
            return this.currentTarget;
        }

        /**
         * Called when resuming after a fail.
         * @returns {number} The target for the recovery round
         */
        resume() {
            this.round++;
            return this.currentTarget;
        }

        /**
         * Get a preview of what the next target will be.
         * @param {number} [randomValue] - Optional random value for testing
         * @returns {number} Preview of the next target
         */
        previewNextTarget(randomValue) {
            if (randomValue === undefined) randomValue = Math.random();
            const baseTarget = this.currentTarget + this.intervalMs;
            return calculateNextTarget(baseTarget, this.maxVariance, randomValue);
        }
    }

    // Export for different module systems
    const exports = {
        calculateNextTarget: calculateNextTarget,
        calculateSuccessTarget: calculateSuccessTarget,
        calculateFailTarget: calculateFailTarget,
        TimerSession: TimerSession
    };

    if (typeof module !== 'undefined' && module.exports) {
        // Node.js / CommonJS (for tests with vitest)
        module.exports = exports;
    } else {
        // Browser global
        global.TimerLogic = exports;
    }

})(typeof window !== 'undefined' ? window : this);
