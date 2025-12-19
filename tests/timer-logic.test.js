import { describe, it, expect } from 'vitest';
import {
    calculateNextTarget,
    calculateSuccessTarget,
    calculateFailTarget,
    TimerSession
} from '../js/timer-logic.js';

describe('calculateNextTarget', () => {
    it('returns exact base when random is 0', () => {
        const result = calculateNextTarget(60000, 0.2, 0);
        expect(result).toBe(60000);
    });

    it('returns base * 1.2 when random is 1', () => {
        const result = calculateNextTarget(60000, 0.2, 1);
        expect(result).toBe(72000);  // 60000 * 1.2
    });

    it('stays within 1.0x to 1.2x range for any random value', () => {
        const base = 60000;
        for (let i = 0; i <= 100; i++) {
            const random = i / 100;
            const result = calculateNextTarget(base, 0.2, random);
            expect(result).toBeGreaterThanOrEqual(base);
            expect(result).toBeLessThanOrEqual(base * 1.2);
        }
    });

    it('never produces a value below the base', () => {
        const base = 50000;
        // Test with many random values
        for (let i = 0; i < 1000; i++) {
            const result = calculateNextTarget(base, 0.2);
            expect(result).toBeGreaterThanOrEqual(base);
        }
    });
});

describe('calculateSuccessTarget', () => {
    it('adds interval before applying variance', () => {
        const current = 60000;
        const interval = 10000;
        // With random = 0, no variance added
        const result = calculateSuccessTarget(current, interval, 0.2, 0);
        expect(result).toBe(70000);  // 60000 + 10000
    });

    it('applies variance to base (current + interval)', () => {
        const current = 60000;
        const interval = 10000;
        // With random = 1, max variance
        const result = calculateSuccessTarget(current, interval, 0.2, 1);
        expect(result).toBe(84000);  // (60000 + 10000) * 1.2
    });
});

describe('calculateFailTarget', () => {
    it('returns last completed target when available', () => {
        const result = calculateFailTarget(75000, 60000);
        expect(result).toBe(75000);
    });

    it('returns baseline when nothing completed yet', () => {
        const result = calculateFailTarget(0, 60000);
        expect(result).toBe(60000);
    });
});

describe('TimerSession', () => {
    describe('first round', () => {
        it('uses exact baseline with no variance', () => {
            const session = new TimerSession(60000, 10000);
            expect(session.currentTarget).toBe(60000);
            expect(session.round).toBe(1);
        });
    });

    describe('completing rounds', () => {
        it('advances round counter', () => {
            const session = new TimerSession(60000, 10000);
            session.completeRound(0);
            expect(session.round).toBe(2);
        });

        it('records last completed target', () => {
            const session = new TimerSession(60000, 10000);
            session.completeRound(0);
            expect(session.lastCompletedTarget).toBe(60000);
        });

        it('adds to history', () => {
            const session = new TimerSession(60000, 10000);
            session.completeRound(0);
            expect(session.history).toHaveLength(1);
            expect(session.history[0]).toEqual({ round: 1, duration: 60000 });
        });

        it('calculates next target as current + interval + variance', () => {
            const session = new TimerSession(60000, 10000);
            // Complete round 1 with random = 0.5 (10% variance)
            const nextTarget = session.completeRound(0.5);
            // Base = 60000 + 10000 = 70000, * 1.1 = 77000
            expect(nextTarget).toBe(77000);
            expect(session.currentTarget).toBe(77000);
        });
    });

    describe('subsequent rounds never decrease', () => {
        it('always increases or stays same across many rounds', () => {
            const session = new TimerSession(60000, 10000);
            let previousTarget = session.currentTarget;

            for (let i = 0; i < 100; i++) {
                session.completeRound();
                expect(session.currentTarget).toBeGreaterThan(previousTarget);
                previousTarget = session.currentTarget;
            }
        });

        it('base accumulates correctly (uses previous actual, not linear)', () => {
            const session = new TimerSession(60000, 10000);

            // Round 1: 60000 (baseline)
            expect(session.currentTarget).toBe(60000);

            // Complete round 1 with max variance
            session.completeRound(1);  // 70000 * 1.2 = 84000
            expect(session.currentTarget).toBe(84000);

            // Complete round 2 with no variance
            session.completeRound(0);  // 84000 + 10000 = 94000
            expect(session.currentTarget).toBe(94000);

            // Complete round 3 with 50% variance
            session.completeRound(0.5);  // (94000 + 10000) * 1.1 = 114400
            expect(session.currentTarget).toBe(114400);
        });
    });

    describe('fail behavior', () => {
        it('resets to last completed target', () => {
            const session = new TimerSession(60000, 10000);

            // Complete round 1: target was 60000
            session.completeRound(0);  // Now at 70000, lastCompleted = 60000
            expect(session.lastCompletedTarget).toBe(60000);

            // Complete round 2: target was 70000
            session.completeRound(0.5);  // Now at 88000, lastCompleted = 70000
            expect(session.lastCompletedTarget).toBe(70000);

            // Fail during round 3
            const failTarget = session.fail();
            expect(failTarget).toBe(70000);  // Back to round 2's completed target
            expect(session.currentTarget).toBe(70000);
        });

        it('resets to baseline if nothing completed yet', () => {
            const session = new TimerSession(60000, 10000);

            // Fail during round 1
            const failTarget = session.fail();
            expect(failTarget).toBe(60000);
        });

        it('does not reset round counter on fail', () => {
            const session = new TimerSession(60000, 10000);
            session.completeRound(0);  // Round 2
            session.completeRound(0);  // Round 3
            session.fail();
            expect(session.round).toBe(3);  // Still round 3
        });
    });

    describe('resume after fail', () => {
        it('increments round counter on resume', () => {
            const session = new TimerSession(60000, 10000);
            session.completeRound(0);  // Round 2
            session.fail();
            session.resume();
            expect(session.round).toBe(3);
        });

        it('uses the exact fail target (no variance on recovery)', () => {
            const session = new TimerSession(60000, 10000);
            // Round 1: target = 60000
            session.completeRound(0);  // Complete round 1, now at 70000, lastCompleted = 60000
            // Round 2: target = 70000
            session.completeRound(0.5);  // Complete round 2, now at 88000, lastCompleted = 70000
            session.fail();  // Reset to lastCompleted = 70000
            const resumeTarget = session.resume();
            expect(resumeTarget).toBe(70000);  // Exact last completed, no variance
        });

        it('next target after recovery cannot be lower than recovery target', () => {
            const session = new TimerSession(60000, 10000);

            // Complete a few rounds
            session.completeRound(0.5);  // Round 1 done
            session.completeRound(0.5);  // Round 2 done
            const lastCompleted = session.lastCompletedTarget;

            // Fail
            session.fail();
            session.resume();

            // Complete the recovery round
            const nextTarget = session.completeRound(0);  // Minimum variance

            // Next target should be > recovery target (which = last completed)
            expect(nextTarget).toBeGreaterThan(lastCompleted);
        });
    });

    describe('previewNextTarget', () => {
        it('shows what next target will be without changing state', () => {
            const session = new TimerSession(60000, 10000);
            const preview = session.previewNextTarget(0.5);
            // (60000 + 10000) * 1.1 = 77000
            expect(preview).toBe(77000);
            // State unchanged
            expect(session.currentTarget).toBe(60000);
            expect(session.round).toBe(1);
        });
    });

    describe('variance stays within bounds', () => {
        it('variance is always 1.0x to 1.2x of base', () => {
            const session = new TimerSession(60000, 10000);

            for (let i = 0; i < 100; i++) {
                const previousTarget = session.currentTarget;
                session.completeRound();
                const base = previousTarget + 10000;

                expect(session.currentTarget).toBeGreaterThanOrEqual(base);
                expect(session.currentTarget).toBeLessThanOrEqual(base * 1.2);
            }
        });
    });
});
