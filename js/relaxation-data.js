/**
 * Relaxation Protocol Data
 * Dr. Karen Overall's 15-day relaxation protocol for dogs
 *
 * Task types:
 * - 'timed': Has a duration, shows countdown timer
 * - 'action': No duration, shows "Mark Complete" button
 */
(function(global) {
    'use strict';

    /**
     * Tips content extracted from the protocol introduction
     */
    const TIPS_CONTENT = {
        foodTreats: {
            title: 'About Food Treats',
            points: [
                'Foods high in protein may help induce brain chemistry changes that help the dog relax',
                'Dogs should not have chocolate - it can be toxic',
                'Some dogs do not do well with treats containing artificial colors or preservatives',
                'Treats should be tiny (less than half the size of a thumbnail) so the dog does not get full, fat, or bored',
                'Suggestions: boiled, slivered chicken or tiny pieces of cheese',
                'Dog biscuits are generally not sufficient motivation',
                'If the dog stops responding for one kind of treat, try another'
            ]
        },
        rewardProcess: {
            title: 'The Reward Process',
            points: [
                'Keep prepared treats in a cup or bag behind your back',
                'Keep one treat in your reward hand',
                'Do not wave your hands or the treat around - this confuses the dog',
                'The treat must be small so the focus is on your cues, not the food',
                'When rewarding, bring your hand up quickly and open to give the treat',
                'You can move your hand to your eye to teach the dog to make eye contact'
            ]
        },
        protocolGuidelines: {
            title: 'Protocol Guidelines',
            points: [
                'Work 15-20 minutes once or twice per day',
                'Work only as long as both you and the dog are enjoying it',
                'Do NOT end on a bad note - if behavior deteriorates, do one final easy exercise and stop',
                'Before starting, practice until the dog can sit perfectly for 15 seconds without moving',
                'Reward ONLY for performing each task perfectly',
                'If behavior gets worse for 3-7 days, this is normal - stick with it',
                'When mastered in one location, repeat in other rooms and circumstances'
            ]
        },
        anxietySigns: {
            title: 'Signs of Anxiety',
            points: [
                'Lips retracted',
                'Pupils dilated',
                'Head lowered',
                'Ears pulled down and back',
                'Trembling',
                'Scanning',
                'If you see these signs, return to an easier exercise or break it into smaller steps'
            ]
        }
    };

    /**
     * Helper to create a task object
     */
    function task(dayNum, taskNum, instruction, durationMs) {
        return {
            id: `day${dayNum}_task${taskNum}`,
            type: durationMs ? 'timed' : 'action',
            instruction: instruction,
            durationMs: durationMs || null
        };
    }

    // Day 1 Tasks
    const day1 = {
        day: 1,
        title: 'Day 1: Foundation',
        tasks: [
            task(1, 1, 'Down for 5 seconds', 5000),
            task(1, 2, 'Down for 10 seconds', 10000),
            task(1, 3, 'Down while you take 1 step back and return', null),
            task(1, 4, 'Down while you take 2 steps back and return', null),
            task(1, 5, 'Down for 10 seconds', 10000),
            task(1, 6, 'Down while you take 1 step to the right and return', null),
            task(1, 7, 'Down while you take 1 step to the left and return', null),
            task(1, 8, 'Down for 10 seconds', 10000),
            task(1, 9, 'Down while you take 2 steps back and return', null),
            task(1, 10, 'Down while you take 2 steps to the right and return', null),
            task(1, 11, 'Down for 15 seconds', 15000),
            task(1, 12, 'Down while you take 2 steps to the left and return', null),
            task(1, 13, 'Down while you clap your hands softly once', null),
            task(1, 14, 'Down while you take 3 steps back and return', null),
            task(1, 15, 'Down while you count out loud to 10', null),
            task(1, 16, 'Down while you clap your hands softly once', null),
            task(1, 17, 'Down while you count out loud to 20', null),
            task(1, 18, 'Down while you take 3 steps to the right and return', null),
            task(1, 19, 'Down while you clap your hands softly twice', null),
            task(1, 20, 'Down for 3 seconds', 3000),
            task(1, 21, 'Down for 5 seconds', 5000),
            task(1, 22, 'Down while you take 1 step back and return', null),
            task(1, 23, 'Down for 3 seconds', 3000),
            task(1, 24, 'Down for 10 seconds', 10000),
            task(1, 25, 'Down for 5 seconds', 5000),
            task(1, 26, 'Down for 3 seconds', 3000)
        ]
    };

    // Day 2 Tasks
    const day2 = {
        day: 2,
        title: 'Day 2: Building Duration',
        tasks: [
            task(2, 1, 'Down for 10 seconds', 10000),
            task(2, 2, 'Down while you take 1 step back and return', null),
            task(2, 3, 'Down while you take 3 steps back and return', null),
            task(2, 4, 'Down for 10 seconds', 10000),
            task(2, 5, 'Down while you take 3 steps to the right and return', null),
            task(2, 6, 'Down while you take 3 steps to the left and return', null),
            task(2, 7, 'Down for 10 seconds', 10000),
            task(2, 8, 'Down while you take 3 steps to the right and clap your hands', null),
            task(2, 9, 'Down while you take 3 steps to the left and clap your hands', null),
            task(2, 10, 'Down for 5 seconds', 5000),
            task(2, 11, 'Down for 10 seconds', 10000),
            task(2, 12, 'Down while you walk one fourth of the way around the dog to the right', null),
            task(2, 13, 'Down while you take 4 steps back', null),
            task(2, 14, 'Down while you walk one fourth of the way around the dog to the left', null),
            task(2, 15, 'Down for 10 seconds', 10000),
            task(2, 16, 'Down while you take 5 steps back from the dog, clapping your hands, and return', null),
            task(2, 17, 'Down while you walk halfway around the dog to the right and return', null),
            task(2, 18, 'Down while you walk halfway around the dog to the left and return', null),
            task(2, 19, 'Down for 10 seconds', 10000),
            task(2, 20, 'Down while you jog quietly in place for 3 seconds', 3000),
            task(2, 21, 'Down while you jog quietly in place for 5 seconds', 5000),
            task(2, 22, 'Down while you jog quietly in place for 10 seconds', 10000),
            task(2, 23, 'Down for 10 seconds', 10000),
            task(2, 24, 'Down while you jog one fourth of the way around the dog to the right and return', null),
            task(2, 25, 'Down while you jog one fourth of the way around the dog to the left and return', null),
            task(2, 26, 'Down for 5 seconds', 5000),
            task(2, 27, 'Down for 10 seconds', 10000)
        ]
    };

    // Day 3 Tasks
    const day3 = {
        day: 3,
        title: 'Day 3: Increasing Distance',
        tasks: [
            task(3, 1, 'Down for 10 seconds', 10000),
            task(3, 2, 'Down for 15 seconds', 15000),
            task(3, 3, 'Down while you take 2 steps backward and return', null),
            task(3, 4, 'Down while you jog 5 steps backward from the dog and return', null),
            task(3, 5, 'Down while you walk halfway around the dog to the right and return', null),
            task(3, 6, 'Down while you walk halfway around the dog to the left and return', null),
            task(3, 7, 'Down while you take 10 steps backward and return', null),
            task(3, 8, 'Down for 15 seconds', 15000),
            task(3, 9, 'Down while you take 10 steps to the left and return', null),
            task(3, 10, 'Down while you take 10 steps to the right and return', null),
            task(3, 11, 'Down for 20 seconds', 20000),
            task(3, 12, 'Down while you walk halfway around the dog to the right, clapping your hands, and return', null),
            task(3, 13, 'Down for 20 seconds', 20000),
            task(3, 14, 'Down while you walk halfway around the dog to the left, clapping your hands, and return', null),
            task(3, 15, 'Down for 10 seconds', 10000),
            task(3, 16, 'Down while you jog 10 steps to the right and return', null),
            task(3, 17, 'Down while you jog 10 steps to the left and return', null),
            task(3, 18, 'Down while you jog in place for 10 seconds', 10000),
            task(3, 19, 'Down for 15 seconds', 15000),
            task(3, 20, 'Down while you jog in place for 20 seconds', 20000),
            task(3, 21, 'Down for 10 seconds', 10000),
            task(3, 22, 'Down while you jog backward 5 steps and return', null),
            task(3, 23, 'Down while you jog to the right 5 steps and return', null),
            task(3, 24, 'Down while you jog to the left 5 steps and return', null),
            task(3, 25, 'Down for 5 seconds while you clap your hands', 5000),
            task(3, 26, 'Down for 10 seconds while you clap your hands', 10000),
            task(3, 27, 'Down for 10 seconds', 10000),
            task(3, 28, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 4 Tasks
    const day4 = {
        day: 4,
        title: 'Day 4: Adding Movement',
        tasks: [
            task(4, 1, 'Down for 10 seconds', 10000),
            task(4, 2, 'Down while you jog backward 5 steps and return', null),
            task(4, 3, 'Down for 20 seconds', 20000),
            task(4, 4, 'Down while you jog halfway around the dog to the right and return', null),
            task(4, 5, 'Down while you jog halfway around the dog to the left and return', null),
            task(4, 6, 'Down while you move three fourths of the way around the dog to the right and return', null),
            task(4, 7, 'Down while you move three fourths of the way around the dog to the left and return', null),
            task(4, 8, 'Down while you jog backward 5 steps, clapping your hands, and return', null),
            task(4, 9, 'Down for 10 seconds', 10000),
            task(4, 10, 'Down while you clap your hands for 20 seconds', 20000),
            task(4, 11, 'Down while you move quickly backward 10 steps and return', null),
            task(4, 12, 'Down while you move quickly 15 steps backward and return', null),
            task(4, 13, 'Down for 20 seconds', 20000),
            task(4, 14, 'Down while you jog halfway around the dog to the right and return', null),
            task(4, 15, 'Down while you jog halfway around the dog to the left and return', null),
            task(4, 16, 'Down while you walk quickly 15 steps to the left and return', null),
            task(4, 17, 'Down while you walk quickly 15 steps to the right and return', null),
            task(4, 18, 'Down for 20 seconds', 20000),
            task(4, 19, 'Down while you move three fourths of the way around the dog to the right and return', null),
            task(4, 20, 'Down while you move three fourths of the way around the dog to the left and return', null),
            task(4, 21, 'Down while you walk all the way around the dog', null),
            task(4, 22, 'Down while you walk approximately 20 steps to an entrance and return', null),
            task(4, 23, 'Down while you walk approximately 20 steps to an entrance, clapping your hands, and return', null),
            task(4, 24, 'Down while you walk around the dog, quietly clapping your hands, and then return', null),
            task(4, 25, 'Down for 20 seconds', 20000),
            task(4, 26, 'Down while you jog quickly around the dog', null),
            task(4, 27, 'Down for 20 seconds', 20000),
            task(4, 28, 'Down for 10 seconds while you clap your hands', 10000)
        ]
    };

    // Day 5 Tasks
    const day5 = {
        day: 5,
        title: 'Day 5: Door Approaches',
        tasks: [
            task(5, 1, 'Down for 5 seconds', 5000),
            task(5, 2, 'Down for 15 seconds', 15000),
            task(5, 3, 'Down while you walk quickly 15 steps to the right and return', null),
            task(5, 4, 'Down while you walk quickly 15 steps to the left and return', null),
            task(5, 5, 'Down while you walk approximately 20 steps to an entrance and return', null),
            task(5, 6, 'Down while you walk approximately 20 steps to an entrance, clapping your hands, and return', null),
            task(5, 7, 'Down for 20 seconds', 20000),
            task(5, 8, 'Down while you walk around the dog, clapping your hands', null),
            task(5, 9, 'Down for 20 seconds', 20000),
            task(5, 10, 'Down for 10 seconds', 10000),
            task(5, 11, 'Down while you walk quickly backward, clapping your hands, and return', null),
            task(5, 12, 'Down while you walk approximately 20 steps to an entrance and return', null),
            task(5, 13, 'Down while you walk approximately 20 steps to an entrance, clapping your hands, and return', null),
            task(5, 14, 'Down while you go to an entrance and just touch the doorknob or wall and return', null),
            task(5, 15, 'Down for 10 seconds', 10000),
            task(5, 16, 'Down while you walk quickly backward, clapping your hands, and return', null),
            task(5, 17, 'Down while you walk approximately 20 steps to an entrance and return', null),
            task(5, 18, 'Down while you walk approximately 20 steps to an entrance, clapping your hands, and return', null),
            task(5, 19, 'Down while you go to an entrance and just touch the doorknob or wall and return', null),
            task(5, 20, 'Down for 20 seconds', 20000),
            task(5, 21, 'Down while you walk approximately 20 steps to an entrance, clapping your hands, and return', null),
            task(5, 22, 'Down while you go to an entrance and just touch the doorknob or wall and return', null),
            task(5, 23, 'Down for 10 seconds', 10000),
            task(5, 24, 'Down while the doorknob is touched or you move into entryway and return', null),
            task(5, 25, 'Down for 10 seconds', 10000),
            task(5, 26, 'Down for 15 seconds while you clap your hands', 15000),
            task(5, 27, 'Down for 10 seconds while you jog in place', 10000),
            task(5, 28, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 6 Tasks
    const day6 = {
        day: 6,
        title: 'Day 6: Going Through Doors',
        tasks: [
            task(6, 1, 'Down for 10 seconds', 10000),
            task(6, 2, 'Down for 20 seconds while you jog back and forth in front of the dog', 20000),
            task(6, 3, 'Down for 15 seconds', 15000),
            task(6, 4, 'Down while you walk approximately 20 steps to an entrance and return', null),
            task(6, 5, 'Down while you walk quickly backward, clapping your hands, and return', null),
            task(6, 6, 'Down while you go to an entrance and just touch the doorknob or wall and return', null),
            task(6, 7, 'Down for 20 seconds while jogging', 20000),
            task(6, 8, 'Down while you walk around the dog', null),
            task(6, 9, 'Down while you walk around the dog, clapping your hands', null),
            task(6, 10, 'Down for 15 seconds', 15000),
            task(6, 11, 'Down for 20 seconds', 20000),
            task(6, 12, 'Down for 30 seconds', 30000),
            task(6, 13, 'Down while you walk quickly backward, clapping your hands, and return', null),
            task(6, 14, 'Down while you go to an entrance and just touch the doorknob or wall and return', null),
            task(6, 15, 'Down while you open the door or go into the entranceway for 5 seconds and return', 5000),
            task(6, 16, 'Down while you open the door or go into the entranceway for 10 seconds and return', 10000),
            task(6, 17, 'Down for 30 seconds', 30000),
            task(6, 18, 'Down while you walk quickly backward, clapping your hands, and return', null),
            task(6, 19, 'Down while you go to an entrance and just touch the doorknob or wall and return', null),
            task(6, 20, 'Down for 10 seconds', 10000),
            task(6, 21, 'Down while you go through the door or the entranceway and return', null),
            task(6, 22, 'Down while you go through the door or the entranceway, clapping your hands, and return', null),
            task(6, 23, 'Down while you open the door or go through the entranceway for 10 seconds and return', 10000),
            task(6, 24, 'Down for 30 seconds', 30000),
            task(6, 25, 'Down while you disappear from view for 5 seconds and return', 5000),
            task(6, 26, 'Down for 20 seconds', 20000),
            task(6, 27, 'Down for 10 seconds while you clap your hands', 10000),
            task(6, 28, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 7 Tasks
    const day7 = {
        day: 7,
        title: 'Day 7: Disappearing',
        tasks: [
            task(7, 1, 'Down for 10 seconds', 10000),
            task(7, 2, 'Down for 20 seconds while you clap your hands', 20000),
            task(7, 3, 'Down while you take 10 steps backward and return', null),
            task(7, 4, 'Down while you walk around the dog', null),
            task(7, 5, 'Down while you go through the door or the entranceway and then return', null),
            task(7, 6, 'Down while you go through the door or the entranceway, clapping your hands, and return', null),
            task(7, 7, 'Down while you open the door or go through the entranceway for 10 seconds and return', 10000),
            task(7, 8, 'Down for 30 seconds', 30000),
            task(7, 9, 'Down while you disappear from view for 5 seconds and return', 5000),
            task(7, 10, 'Down while you go through the door or the entranceway and return', null),
            task(7, 11, 'Down while you go through the door or the entranceway, clapping your hands, and return', null),
            task(7, 12, 'Down while you open the door or go through the entranceway for 10 seconds and return', 10000),
            task(7, 13, 'Down for 30 seconds', 30000),
            task(7, 14, 'Down while you disappear from view for 10 seconds and return', 10000),
            task(7, 15, 'Down while you disappear from view for 15 seconds and return', 15000),
            task(7, 16, 'Down for 10 seconds', 10000),
            task(7, 17, 'Down for 15 seconds', 15000),
            task(7, 18, 'Down for 5 seconds while you clap your hands', 5000),
            task(7, 19, 'Down while you jog in place for 10 seconds', 10000),
            task(7, 20, 'Down while you jog three fourths of the way to the right and return', null),
            task(7, 21, 'Down while you jog three fourths of the way to the left and return', null),
            task(7, 22, 'Down while you go through the door or the entranceway, clapping your hands, and return', null),
            task(7, 23, 'Down while you open the door or go through the entranceway for 10 seconds and return', 10000),
            task(7, 24, 'Down for 30 seconds', 30000),
            task(7, 25, 'Down while you disappear from view for 15 seconds and return', 15000),
            task(7, 26, 'Down for 10 seconds', 10000),
            task(7, 27, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 8 Tasks
    const day8 = {
        day: 8,
        title: 'Day 8: Extended Absence',
        tasks: [
            task(8, 1, 'Down for 10 seconds', 10000),
            task(8, 2, 'Down for 15 seconds while you jog and clap your hands', 15000),
            task(8, 3, 'Down while you back up 15 steps and return', null),
            task(8, 4, 'Down while you circle the dog and return', null),
            task(8, 5, 'Down while you disappear from view for 20 seconds and return', 20000),
            task(8, 6, 'Down while you disappear from view for 25 seconds and return', 25000),
            task(8, 7, 'Down for 5 seconds', 5000),
            task(8, 8, 'Down for 5 seconds while you sit in a chair (placed 5 feet from the dog)', 5000),
            task(8, 9, 'Down for 5 seconds', 5000),
            task(8, 10, 'Down for 15 seconds while you jog and clap your hands', 15000),
            task(8, 11, 'Down while you back up 15 steps and return', null),
            task(8, 12, 'Down while you circle the dog and return', null),
            task(8, 13, 'Down while you disappear from view for 20 seconds and return', 20000),
            task(8, 14, 'Down while you disappear from view for 30 seconds and return', 30000),
            task(8, 15, 'Down for 5 seconds', 5000),
            task(8, 16, 'Down while you circle the dog and return', null),
            task(8, 17, 'Down while you disappear from view for 20 seconds and return', 20000),
            task(8, 18, 'Down while you disappear from view for 25 seconds and return', 25000),
            task(8, 19, 'Down for 5 seconds while you sit in a chair near the dog', 5000),
            task(8, 20, 'Down while you disappear from view for 10 seconds, sit in a chair for 5 seconds, and return', 15000),
            task(8, 21, 'Down for 10 seconds', 10000),
            task(8, 22, 'Down for 20 seconds while you jog and clap your hands', 20000),
            task(8, 23, 'Down for 15 seconds while you run around the dog', 15000),
            task(8, 24, 'Down for 10 seconds', 10000),
            task(8, 25, 'Down for 5 seconds while you turn around', 5000),
            task(8, 26, 'Down for 5 seconds while you sit in a chair near the dog', 5000),
            task(8, 27, 'Down while you disappear from view for 10 seconds, sit in a chair for 5 seconds, and return', 15000),
            task(8, 28, 'Down for 10 seconds', 10000)
        ]
    };

    // Day 9 Tasks
    const day9 = {
        day: 9,
        title: 'Day 9: Physical Movements',
        tasks: [
            task(9, 1, 'Down for 5 seconds', 5000),
            task(9, 2, 'Down for 10 seconds while you turn around', 10000),
            task(9, 3, 'Down for 5 seconds while you jog', 5000),
            task(9, 4, 'Down while you walk around the dog', null),
            task(9, 5, 'Down while you jog around the dog', null),
            task(9, 6, 'Down while you jog around the dog, clapping your hands', null),
            task(9, 7, 'Down while you jog twice around the dog', null),
            task(9, 8, 'Down for 10 seconds', 10000),
            task(9, 9, 'Down for 15 seconds while you clap your hands', 15000),
            task(9, 10, 'Down for 20 seconds', 20000),
            task(9, 11, 'Down while you move three fourths of the way around the dog to the right and return', null),
            task(9, 12, 'Down while you move three fourths of the way around the dog to the left and return', null),
            task(9, 13, 'Down while you disappear from view for 10 seconds and return', 10000),
            task(9, 14, 'Down while you circle the dog and return', null),
            task(9, 15, 'Down while you disappear from view for 20 seconds and return', 20000),
            task(9, 16, 'Down while you disappear from view for 25 seconds and return', 25000),
            task(9, 17, 'Down for 5 seconds while you sit in a chair near the dog', 5000),
            task(9, 18, 'Down while you disappear from view for 10 seconds, sit in a chair for 5 seconds, and return', 15000),
            task(9, 19, 'Down for 10 seconds', 10000),
            task(9, 20, 'Down while you bend down and touch your toes', null),
            task(9, 21, 'Down while you stretch your arms', null),
            task(9, 22, 'Down while you stretch your arms and jump once', null),
            task(9, 23, 'Down while you touch your toes 5 times', null),
            task(9, 24, 'Down while you stretch your arms and jump 3 times', null),
            task(9, 25, 'Down for 15 seconds', 15000),
            task(9, 26, 'Down for 10 seconds', 10000),
            task(9, 27, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 10 Tasks
    const day10 = {
        day: 10,
        title: 'Day 10: Knocking Sounds',
        tasks: [
            task(10, 1, 'Down for 5 seconds while you clap', 5000),
            task(10, 2, 'Down for 10 seconds while you touch your toes', 10000),
            task(10, 3, 'Down for 15 seconds while you sit in a chair', 15000),
            task(10, 4, 'Down while you walk quickly 15 steps to the right and return', null),
            task(10, 5, 'Down while you walk quickly 15 steps to the left and return', null),
            task(10, 6, 'Down while you walk approximately 20 steps to an entrance and return', null),
            task(10, 7, 'Down while you disappear from view for 5 seconds and return', 5000),
            task(10, 8, 'Down while you disappear from view for 10 seconds and return', 10000),
            task(10, 9, 'Down while you disappear from view for 15 seconds and return', 15000),
            task(10, 10, 'Down for 10 seconds', 10000),
            task(10, 11, 'Down for 5 seconds', 5000),
            task(10, 12, 'Down while you walk quickly 15 steps to the right and return', null),
            task(10, 13, 'Down while you walk quickly 15 steps to the left and return', null),
            task(10, 14, 'Down while you walk approximately 20 steps to an entrance and return', null),
            task(10, 15, 'Down while you disappear from view for 5 seconds and return', 5000),
            task(10, 16, 'Down while you disappear from view for 10 seconds and return', 10000),
            task(10, 17, 'Down while you disappear from view for 15 seconds and return', 15000),
            task(10, 18, 'Down while you disappear from view for 5 seconds, knock softly on the wall, and return', 5000),
            task(10, 19, 'Down for 5 seconds', 5000),
            task(10, 20, 'Down while you disappear from view for 5 seconds and return', 5000),
            task(10, 21, 'Down while you disappear from view for 10 seconds and return', 10000),
            task(10, 22, 'Down while you disappear from view for 15 seconds and return', 15000),
            task(10, 23, 'Down while you disappear from view for 5 seconds, knock softly on the wall, and return', 5000),
            task(10, 24, 'Down while you disappear from view, knock quickly but softly on the wall, and return', null),
            task(10, 25, 'Down for 5 seconds', 5000),
            task(10, 26, 'Down while you disappear from view for 10 seconds, knock softly on the wall, and return', 10000),
            task(10, 27, 'Down for 10 seconds', 10000),
            task(10, 28, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 11 Tasks
    const day11 = {
        day: 11,
        title: 'Day 11: Doorbell Introduction',
        tasks: [
            task(11, 1, 'Down for 5 seconds', 5000),
            task(11, 2, 'Down for 10 seconds', 10000),
            task(11, 3, 'Down while you disappear from view, knock quickly but softly on the wall, and return', null),
            task(11, 4, 'Down for 5 seconds', 5000),
            task(11, 5, 'Down while you disappear from view for 10 seconds, knock softly on the wall, and return', 10000),
            task(11, 6, 'Down for 30 seconds', 30000),
            task(11, 7, 'Down while you disappear from view, ring the doorbell, and immediately return', null),
            task(11, 8, 'Down while you disappear from view, ring the doorbell, wait 2 seconds, and return', 2000),
            task(11, 9, 'Down for 30 seconds', 30000),
            task(11, 10, 'Down while you disappear from view, ring the doorbell, and immediately return', null),
            task(11, 11, 'Down while you disappear from view, ring the doorbell, wait 5 seconds, and return', 5000),
            task(11, 12, 'Down for 30 seconds', 30000),
            task(11, 13, 'Down while you disappear from view, ring the doorbell, and immediately return', null),
            task(11, 14, 'Down while you disappear from view, ring the doorbell, wait 10 seconds, and return', 10000),
            task(11, 15, 'Down for 5 seconds while you jog around the dog', 5000),
            task(11, 16, 'Down while you walk around the dog', null),
            task(11, 17, 'Down while you jog around the dog', null),
            task(11, 18, 'Down while you jog around the dog, clapping your hands', null),
            task(11, 19, 'Down while you jog twice around the dog', null),
            task(11, 20, 'Down for 10 seconds', 10000),
            task(11, 21, 'Down for 15 seconds while you clap your hands', 15000),
            task(11, 22, 'Down for 20 seconds', 20000),
            task(11, 23, 'Down while you move three fourths of the way around the dog to the right and return', null),
            task(11, 24, 'Down while you move three fourths of the way around the dog to the left and return', null),
            task(11, 25, 'Down while you disappear from view for 10 seconds and return', 10000),
            task(11, 26, 'Down while you circle the dog and return', null),
            task(11, 27, 'Down for 10 seconds', 10000),
            task(11, 28, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 12 Tasks
    const day12 = {
        day: 12,
        title: 'Day 12: Greetings',
        tasks: [
            task(12, 1, 'Down for 10 seconds', 10000),
            task(12, 2, 'Down for 5 seconds while you clap your hands', 5000),
            task(12, 3, 'Down for 15 seconds', 15000),
            task(12, 4, 'Down for 20 seconds while you hum', 20000),
            task(12, 5, 'Down while you disappear from view for 20 seconds and return', 20000),
            task(12, 6, 'Down while you disappear from view for 25 seconds and return', 25000),
            task(12, 7, 'Down for 5 seconds while you sit in a chair near the dog', 5000),
            task(12, 8, 'Down while you disappear from view for 10 seconds, sit in a chair for 5 seconds, and return', 15000),
            task(12, 9, 'Down for 15 seconds', 15000),
            task(12, 10, 'Down for 20 seconds while you hum', 20000),
            task(12, 11, 'Down while you disappear from view for 20 seconds and return', 20000),
            task(12, 12, 'Down while you disappear from view for 25 seconds and return', 25000),
            task(12, 13, 'Down while you move three fourths of the way around the dog to the right and return', null),
            task(12, 14, 'Down while you move three fourths of the way around the dog to the left and return', null),
            task(12, 15, 'Down while you disappear from view for 10 seconds and return', 10000),
            task(12, 16, 'Down while you circle the dog and return', null),
            task(12, 17, 'Down for 10 seconds', 10000),
            task(12, 18, 'Down while you disappear from view, knock quickly but softly on the wall, and return', null),
            task(12, 19, 'Down for 5 seconds', 5000),
            task(12, 20, 'Down while you disappear from view for 10 seconds, knock softly on the wall, and return', 10000),
            task(12, 21, 'Down for 30 seconds', 30000),
            task(12, 22, 'Down while you disappear from view, ring the doorbell, and immediately return', null),
            task(12, 23, 'Down while you disappear from view, ring the doorbell, wait 2 seconds, and return', 2000),
            task(12, 24, 'Down for 30 seconds', 30000),
            task(12, 25, 'Down while you disappear from view, say "hello," and return', null),
            task(12, 26, 'Down while you disappear from view, say "hello," wait 3 seconds, and return', 3000),
            task(12, 27, 'Down for 10 seconds', 10000),
            task(12, 28, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 13 Tasks
    const day13 = {
        day: 13,
        title: 'Day 13: Complex Sequences',
        tasks: [
            task(13, 1, 'Down for 5 seconds', 5000),
            task(13, 2, 'Down for 15 seconds while you hum', 15000),
            task(13, 3, 'Down for 15 seconds while you clap your hands and hum', 15000),
            task(13, 4, 'Down while you disappear from view for 20 seconds and return', 20000),
            task(13, 5, 'Down while you disappear from view for 25 seconds and return', 25000),
            task(13, 6, 'Down for 5 seconds while you sit in a chair near the dog', 5000),
            task(13, 7, 'Down while you disappear from view for 10 seconds, sit in a chair for 5 seconds, and return', 15000),
            task(13, 8, 'Down for 5 seconds', 5000),
            task(13, 9, 'Down for 10 seconds', 10000),
            task(13, 10, 'Down while you disappear from view, knock quickly but softly on the wall, and return', null),
            task(13, 11, 'Down for 5 seconds', 5000),
            task(13, 12, 'Down while you disappear from view for 10 seconds, knock softly on the wall, and return', 10000),
            task(13, 13, 'Down for 30 seconds', 30000),
            task(13, 14, 'Down while you disappear from view, ring the doorbell, and immediately return', null),
            task(13, 15, 'Down while you disappear from view, ring the doorbell, wait 2 seconds, and return', 2000),
            task(13, 16, 'Down for 30 seconds', 30000),
            task(13, 17, 'Down while you disappear from view, say "hello," wait 5 seconds, and return', 5000),
            task(13, 18, 'Down while you disappear from view, knock or ring the doorbell, say "hello," wait 5 seconds, and return', 5000),
            task(13, 19, 'Down for 30 seconds', 30000),
            task(13, 20, 'Down while you disappear from view, say "hello," wait 5 seconds, and return', 5000),
            task(13, 21, 'Down while you disappear from view, knock or ring the doorbell, say "hello," wait 5 seconds, and return', 5000),
            task(13, 22, 'Down for 20 seconds while you hum', 20000),
            task(13, 23, 'Down for 15 seconds while you clap your hands', 15000),
            task(13, 24, 'Down for 5 seconds', 5000),
            task(13, 25, 'Down while you jog around the dog', null),
            task(13, 26, 'Down for 10 seconds while you clap your hands and hum', 10000),
            task(13, 27, 'Down for 5 seconds while you jog in place', 5000),
            task(13, 28, 'Down while you jog around the dog, humming', null)
        ]
    };

    // Day 14 Tasks
    const day14 = {
        day: 14,
        title: 'Day 14: Advanced Sequences',
        tasks: [
            task(14, 1, 'Down for 10 seconds', 10000),
            task(14, 2, 'Down for 10 seconds', 10000),
            task(14, 3, 'Down for 5 seconds while you clap your hands and hum', 5000),
            task(14, 4, 'Down while you run around the dog', null),
            task(14, 5, 'Down while you walk back and forth to the door', null),
            task(14, 6, 'Down while you leave the room, quickly knock or ring the doorbell, and return', null),
            task(14, 7, 'Down for 5 seconds', 5000),
            task(14, 8, 'Down for 10 seconds', 10000),
            task(14, 9, 'Down for 10 seconds', 10000),
            task(14, 10, 'Down for 5 seconds while you clap your hands and hum', 5000),
            task(14, 11, 'Down while you run around the dog', null),
            task(14, 12, 'Down while you walk back and forth to the door', null),
            task(14, 13, 'Down while you leave the room, quickly knock or ring the doorbell, and return', null),
            task(14, 14, 'Down for 5 seconds', 5000),
            task(14, 15, 'Down for 10 seconds', 10000),
            task(14, 16, 'Down while you disappear from view for 10 seconds, knock softly on the wall, and return', 10000),
            task(14, 17, 'Down for 30 seconds', 30000),
            task(14, 18, 'Down while you disappear from view, ring the doorbell, and immediately return', null),
            task(14, 19, 'Down while you disappear from view, ring the doorbell, wait 2 seconds, and return', 2000),
            task(14, 20, 'Down for 30 seconds', 30000),
            task(14, 21, 'Down while you disappear from view, say "hello," wait 5 seconds, and return', 5000),
            task(14, 22, 'Down while you disappear from view, knock or ring the doorbell, say "hello," wait 10 seconds, and return', 10000),
            task(14, 23, 'Down for 30 seconds', 30000),
            task(14, 24, 'Down while you disappear from view, say "hello," wait 10 seconds, and return', 10000),
            task(14, 25, 'Down while you disappear from view, knock or ring the doorbell, say "hello," wait 10 seconds, and return', 10000),
            task(14, 26, 'Down for 20 seconds while you hum', 20000),
            task(14, 27, 'Down for 20 seconds', 20000),
            task(14, 28, 'Down for 5 seconds', 5000)
        ]
    };

    // Day 15 Tasks
    const day15 = {
        day: 15,
        title: 'Day 15: Final Challenge',
        tasks: [
            task(15, 1, 'Down for 10 seconds', 10000),
            task(15, 2, 'Down for 5 seconds', 5000),
            task(15, 3, 'Down for 15 seconds while you clap your hands and hum', 15000),
            task(15, 4, 'Down while you disappear from view, knock or ring the doorbell, say "hello," talk for 10 seconds, and return', 10000),
            task(15, 5, 'Down for 20 seconds while you hum', 20000),
            task(15, 6, 'Down while you disappear from view, say "hello," invite the imaginary person in, wait 5 seconds, and return', 5000),
            task(15, 7, 'Down for 10 seconds', 10000),
            task(15, 8, 'Down for 5 seconds', 5000),
            task(15, 9, 'Down while you disappear from view, say "hello," invite the imaginary person in, wait 10 seconds, and return', 10000),
            task(15, 10, 'Down while you disappear from view, say "hello," talk (as if to someone) for 5 seconds, and return', 5000),
            task(15, 11, 'Down for 5 seconds while you clap your hands and hum', 5000),
            task(15, 12, 'Down while you run around the dog', null),
            task(15, 13, 'Down while you walk back and forth to the door', null),
            task(15, 14, 'Down while you leave the room, quickly knock or ring the doorbell, and return', null),
            task(15, 15, 'Down for 5 seconds', 5000),
            task(15, 16, 'Down while you leave the room, knock or ring the doorbell for 3 seconds, and return', 3000),
            task(15, 17, 'Down while you leave the room and knock or ring the doorbell for 5 seconds', 5000),
            task(15, 18, 'Down while you leave the room and talk for 3 seconds to people who are not there', 3000),
            task(15, 19, 'Down while you leave the room and talk for 5 seconds to people who are not there', 5000),
            task(15, 20, 'Down while you leave the room and talk for 10 seconds to people who are not there', 10000),
            task(15, 21, 'Down while you run around the dog', null),
            task(15, 22, 'Down for 10 seconds while you sit in a chair', 10000),
            task(15, 23, 'Down for 30 seconds while you sit in a chair', 30000),
            task(15, 24, 'Down for 15 seconds while you clap your hands and jog', 15000),
            task(15, 25, 'Down for 5 seconds', 5000)
        ]
    };

    /**
     * All 15 days of relaxation protocol tasks
     */
    const RELAXATION_DAYS = [
        day1, day2, day3, day4, day5,
        day6, day7, day8, day9, day10,
        day11, day12, day13, day14, day15
    ];

    // Export
    const exports = {
        RELAXATION_DAYS,
        TIPS_CONTENT
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exports;
    } else {
        global.RelaxationData = exports;
    }

})(typeof window !== 'undefined' ? window : this);
