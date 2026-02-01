/**
 * Relaxation Protocol Logic Module
 * Pure logic for progress tracking and session management
 *
 * UMD pattern for consistency and testability
 */
(function(global) {
    'use strict';

    const STORAGE_KEY = 'meemtime-relax-progress';

    /**
     * Progress tracking class
     * Manages completion status for all 15 days
     */
    class RelaxationProgress {
        constructor() {
            this.progress = this._load();
        }

        /**
         * Load progress from localStorage
         * @returns {Object} Progress object
         * @private
         */
        _load() {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    // Validate structure
                    if (parsed && typeof parsed === 'object') {
                        return this._migrate(parsed);
                    }
                }
            } catch (err) {
                console.warn('Failed to load relaxation progress:', err);
            }
            return this._getDefaultProgress();
        }

        /**
         * Migrate old progress format if needed
         * @param {Object} data - Loaded data
         * @returns {Object} Migrated progress
         * @private
         */
        _migrate(data) {
            const defaults = this._getDefaultProgress();
            // Ensure all days exist
            for (let day = 1; day <= 15; day++) {
                if (!data[day]) {
                    data[day] = defaults[day];
                } else {
                    // Ensure required fields exist
                    if (!Array.isArray(data[day].completed)) {
                        data[day].completed = [];
                    }
                    if (typeof data[day].lastTaskIndex !== 'number') {
                        data[day].lastTaskIndex = 0;
                    }
                    if (typeof data[day].isComplete !== 'boolean') {
                        data[day].isComplete = false;
                    }
                }
            }
            return data;
        }

        /**
         * Get default progress structure
         * @returns {Object} Default progress for all 15 days
         * @private
         */
        _getDefaultProgress() {
            const progress = {};
            for (let day = 1; day <= 15; day++) {
                progress[day] = {
                    completed: [],      // Array of completed task IDs
                    lastTaskIndex: 0,   // Resume point
                    isComplete: false   // Entire day marked complete
                };
            }
            return progress;
        }

        /**
         * Save progress to localStorage
         */
        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
            } catch (err) {
                console.warn('Failed to save relaxation progress:', err);
            }
        }

        /**
         * Mark a task as complete
         * @param {number} day - Day number (1-15)
         * @param {string} taskId - Task ID
         */
        completeTask(day, taskId) {
            if (!this.progress[day]) return;
            if (!this.progress[day].completed.includes(taskId)) {
                this.progress[day].completed.push(taskId);
                this.save();
            }
        }

        /**
         * Check if a task is complete
         * @param {number} day - Day number (1-15)
         * @param {string} taskId - Task ID
         * @returns {boolean}
         */
        isTaskComplete(day, taskId) {
            if (!this.progress[day]) return false;
            return this.progress[day].completed.includes(taskId);
        }

        /**
         * Update last task index for resume functionality
         * @param {number} day - Day number (1-15)
         * @param {number} index - Task index
         */
        setLastTaskIndex(day, index) {
            if (!this.progress[day]) return;
            this.progress[day].lastTaskIndex = index;
            this.save();
        }

        /**
         * Get last task index for a day
         * @param {number} day - Day number (1-15)
         * @returns {number}
         */
        getLastTaskIndex(day) {
            if (!this.progress[day]) return 0;
            return this.progress[day].lastTaskIndex;
        }

        /**
         * Mark an entire day as complete
         * @param {number} day - Day number (1-15)
         */
        markDayComplete(day) {
            if (!this.progress[day]) return;
            this.progress[day].isComplete = true;
            this.save();
        }

        /**
         * Check if a day is complete
         * @param {number} day - Day number (1-15)
         * @returns {boolean}
         */
        isDayComplete(day) {
            if (!this.progress[day]) return false;
            return this.progress[day].isComplete;
        }

        /**
         * Get completion count for a day
         * @param {number} day - Day number (1-15)
         * @returns {number}
         */
        getCompletedCount(day) {
            if (!this.progress[day]) return 0;
            return this.progress[day].completed.length;
        }

        /**
         * Get progress percentage for a day
         * @param {number} day - Day number (1-15)
         * @param {number} totalTasks - Total number of tasks in the day
         * @returns {number} Percentage (0-100)
         */
        getDayProgress(day, totalTasks) {
            if (!this.progress[day] || totalTasks === 0) return 0;
            const completed = this.progress[day].completed.length;
            return Math.round((completed / totalTasks) * 100);
        }

        /**
         * Reset progress for a specific day
         * @param {number} day - Day number (1-15)
         */
        resetDay(day) {
            this.progress[day] = {
                completed: [],
                lastTaskIndex: 0,
                isComplete: false
            };
            this.save();
        }

        /**
         * Reset all progress
         */
        resetAll() {
            this.progress = this._getDefaultProgress();
            this.save();
        }

        /**
         * Get summary of all days progress
         * @param {Array} daysData - Array of day data with tasks
         * @returns {Array} Summary for each day
         */
        getSummary(daysData) {
            return daysData.map(dayData => ({
                day: dayData.day,
                title: dayData.title,
                totalTasks: dayData.tasks.length,
                completedTasks: this.getCompletedCount(dayData.day),
                progress: this.getDayProgress(dayData.day, dayData.tasks.length),
                isComplete: this.isDayComplete(dayData.day)
            }));
        }
    }

    /**
     * Task session manager
     * Manages navigation through a day's tasks
     */
    class TaskSession {
        /**
         * Create a task session
         * @param {Object} dayData - Day data with tasks array
         */
        constructor(dayData) {
            this.dayData = dayData;
            this.currentTaskIndex = 0;
        }

        /**
         * Get the current task
         * @returns {Object|null}
         */
        getCurrentTask() {
            return this.dayData.tasks[this.currentTaskIndex] || null;
        }

        /**
         * Get task at specific index
         * @param {number} index - Task index
         * @returns {Object|null}
         */
        getTask(index) {
            return this.dayData.tasks[index] || null;
        }

        /**
         * Move to next task
         * @returns {Object|null} Next task or null if at end
         */
        nextTask() {
            if (this.currentTaskIndex < this.dayData.tasks.length - 1) {
                this.currentTaskIndex++;
                return this.getCurrentTask();
            }
            return null;
        }

        /**
         * Move to previous task
         * @returns {Object|null} Previous task or null if at start
         */
        previousTask() {
            if (this.currentTaskIndex > 0) {
                this.currentTaskIndex--;
                return this.getCurrentTask();
            }
            return null;
        }

        /**
         * Set task index directly
         * @param {number} index - Task index
         * @returns {Object|null} Task at index or null if invalid
         */
        setTaskIndex(index) {
            if (index >= 0 && index < this.dayData.tasks.length) {
                this.currentTaskIndex = index;
                return this.getCurrentTask();
            }
            return null;
        }

        /**
         * Check if current task is the last
         * @returns {boolean}
         */
        isLastTask() {
            return this.currentTaskIndex === this.dayData.tasks.length - 1;
        }

        /**
         * Check if current task is the first
         * @returns {boolean}
         */
        isFirstTask() {
            return this.currentTaskIndex === 0;
        }

        /**
         * Get total number of tasks
         * @returns {number}
         */
        getTotalTasks() {
            return this.dayData.tasks.length;
        }

        /**
         * Get current position info
         * @returns {Object}
         */
        getPosition() {
            return {
                current: this.currentTaskIndex + 1,
                total: this.dayData.tasks.length,
                isFirst: this.isFirstTask(),
                isLast: this.isLastTask()
            };
        }

        /**
         * Get day number
         * @returns {number}
         */
        getDayNumber() {
            return this.dayData.day;
        }

        /**
         * Get day title
         * @returns {string}
         */
        getDayTitle() {
            return this.dayData.title;
        }
    }

    // Export
    const exports = {
        RelaxationProgress,
        TaskSession,
        STORAGE_KEY
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = exports;
    } else {
        global.RelaxationLogic = exports;
    }

})(typeof window !== 'undefined' ? window : this);
