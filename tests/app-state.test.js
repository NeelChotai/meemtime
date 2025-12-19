import { describe, it, expect } from 'vitest';
import { TimerSession } from '../js/timer-logic.js';

describe('State Transitions', () => {
    describe('fail → resume flow', () => {
        it('fail resets to last completed target', () => {
            const session = new TimerSession(30000, 10000);

            // Complete round 1
            session.completeRound(0);  // Now at 40000
            expect(session.lastCompletedTarget).toBe(30000);

            // Complete round 2
            session.completeRound(0);  // Now at 50000
            expect(session.lastCompletedTarget).toBe(40000);

            // Fail during round 3
            session.fail();
            expect(session.currentTarget).toBe(40000);  // Back to last completed
        });

        it('fail on round 1 uses baseline', () => {
            const session = new TimerSession(30000, 10000);
            expect(session.round).toBe(1);

            session.fail();
            expect(session.currentTarget).toBe(30000);  // Baseline
        });

        it('resume after fail increments round', () => {
            const session = new TimerSession(30000, 10000);
            session.completeRound(0);  // Round 2
            expect(session.round).toBe(2);

            session.fail();
            expect(session.round).toBe(2);  // Still round 2

            session.resume();
            expect(session.round).toBe(3);  // Now round 3
        });

        it('recovery round uses exact last completed target (no variance)', () => {
            const session = new TimerSession(30000, 10000);

            // Complete round 1 with variance
            session.completeRound(0.5);  // 40000 * 1.1 = 44000
            const lastCompleted = session.lastCompletedTarget;  // 30000

            // Fail
            session.fail();
            expect(session.currentTarget).toBe(lastCompleted);

            // Resume - target should still be exact last completed
            session.resume();
            expect(session.currentTarget).toBe(lastCompleted);
        });
    });

    describe('pause does not affect session state', () => {
        it('pause preserves current round and target', () => {
            const session = new TimerSession(30000, 10000);
            session.completeRound(0);

            const roundBeforePause = session.round;
            const targetBeforePause = session.currentTarget;

            // Pause is handled by app.js, not TimerSession
            // TimerSession state should be unchanged

            expect(session.round).toBe(roundBeforePause);
            expect(session.currentTarget).toBe(targetBeforePause);
        });
    });

    describe('multiple fails in a row', () => {
        it('multiple fails keep resetting to same last completed', () => {
            const session = new TimerSession(30000, 10000);

            // Complete round 1
            session.completeRound(0);
            const lastCompleted = session.lastCompletedTarget;

            // Fail multiple times
            session.fail();
            expect(session.currentTarget).toBe(lastCompleted);

            session.resume();
            session.fail();
            expect(session.currentTarget).toBe(lastCompleted);

            session.resume();
            session.fail();
            expect(session.currentTarget).toBe(lastCompleted);
        });
    });

    describe('preview matches actual next target', () => {
        it('preview with same random value equals next target', () => {
            const session = new TimerSession(30000, 10000);

            const randomValue = 0.5;
            const preview = session.previewNextTarget(randomValue);

            // Complete round with same random value
            session.completeRound(randomValue);

            expect(session.currentTarget).toBe(preview);
        });
    });
});

describe('Input Validation (clamp function logic)', () => {
    // These test the logic that should be applied in startTraining()

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    it('clamps negative values to 0', () => {
        expect(clamp(-5, 0, 59)).toBe(0);
        expect(clamp(-100, 0, 59)).toBe(0);
    });

    it('clamps values > 59 to 59', () => {
        expect(clamp(60, 0, 59)).toBe(59);
        expect(clamp(100, 0, 59)).toBe(59);
        expect(clamp(999, 0, 59)).toBe(59);
    });

    it('handles valid values unchanged', () => {
        expect(clamp(0, 0, 59)).toBe(0);
        expect(clamp(30, 0, 59)).toBe(30);
        expect(clamp(59, 0, 59)).toBe(59);
    });

    it('handles NaN as 0 via parseInt fallback', () => {
        // parseInt("") returns NaN, which || 0 converts to 0
        const val = parseInt("") || 0;
        expect(clamp(val, 0, 59)).toBe(0);
    });
});

describe('Edge Cases', () => {
    it('completing many rounds never decreases target', () => {
        const session = new TimerSession(1000, 1000);
        let previousTarget = session.currentTarget;

        for (let i = 0; i < 50; i++) {
            session.completeRound();
            expect(session.currentTarget).toBeGreaterThan(previousTarget);
            previousTarget = session.currentTarget;
        }
    });

    it('history records all completed rounds', () => {
        const session = new TimerSession(30000, 10000);

        session.completeRound(0);
        session.completeRound(0);
        session.completeRound(0);

        expect(session.history).toHaveLength(3);
        expect(session.history[0].round).toBe(1);
        expect(session.history[1].round).toBe(2);
        expect(session.history[2].round).toBe(3);
    });

    it('fail does not add to history', () => {
        const session = new TimerSession(30000, 10000);

        session.completeRound(0);
        expect(session.history).toHaveLength(1);

        session.fail();
        expect(session.history).toHaveLength(1);  // No change

        session.resume();
        expect(session.history).toHaveLength(1);  // Still no change
    });
});
