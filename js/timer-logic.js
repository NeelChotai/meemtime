/**
 * Pure timer calculation logic for the Stay Timer app.
 * This module contains no DOM dependencies and can be tested in isolation.
 */

/**
 * Calculate the next target duration with upward-only variance.
 * @param {number} baseTarget - The base target in milliseconds (previous actual + interval)
 * @param {number} maxVariance - Maximum upward variance (default 0.2 = 20%)
 * @param {number} [randomValue] - Optional random value 0-1 for testing (defaults to Math.random())
 * @returns {number} The calculated target with variance applied
 */
export function calculateNextTarget(baseTarget, maxVariance = 0.2, randomValue = Math.random()) {
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
export function calculateSuccessTarget(currentTarget, intervalMs, maxVariance = 0.2, randomValue = Math.random()) {
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
export function calculateFailTarget(lastCompletedTarget, baselineMs) {
    return lastCompletedTarget > 0 ? lastCompletedTarget : baselineMs;
}

/**
 * Represents the state of a training session.
 */
export class TimerSession {
    constructor(baselineMs, intervalMs, maxVariance = 0.2) {
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
    completeRound(randomValue = Math.random()) {
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
     * @param {number} [randomValue] - Optional random value for testing
     * @returns {number} The target for the recovery round
     */
    resume(randomValue = Math.random()) {
        this.round++;
        // The current target is already set by fail(), no change needed
        // But we pre-calculate the next target for preview
        return this.currentTarget;
    }

    /**
     * Get a preview of what the next target will be.
     * @param {number} [randomValue] - Optional random value for testing
     * @returns {number} Preview of the next target
     */
    previewNextTarget(randomValue = Math.random()) {
        const baseTarget = this.currentTarget + this.intervalMs;
        return calculateNextTarget(baseTarget, this.maxVariance, randomValue);
    }
}
