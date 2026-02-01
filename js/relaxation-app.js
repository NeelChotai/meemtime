/**
 * Relaxation Protocol UI Integration
 * Handles DOM manipulation and screen navigation
 * Kept separate from interval timer code (app.js)
 */

// Wrap in IIFE to avoid global namespace conflicts with app.js
(function() {
'use strict';

// Get modules from globals
const { TimerDisplay } = window.TimerDisplayModule;
const { RelaxationProgress, TaskSession } = window.RelaxationLogic;
const { RELAXATION_DAYS, TIPS_CONTENT } = window.RelaxationData;
const formatTimeRelax = window.TimerDisplayModule.formatTime;

// State (scoped to this IIFE)
let relaxProgress = null;
let relaxSession = null;
let relaxTimer = null;

// Elements cache
const elements = {};

// Flash element (shared with main app)
let flash = null;

/**
 * Show a screen by ID, hiding all others
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(screenId);
    if (screen) {
        screen.classList.add('active');
    }
}

/**
 * Trigger completion feedback (flash + vibrate)
 */
function triggerFeedback() {
    // Flash
    const savedColor = localStorage.getItem('meemtime-flash-color');
    if (savedColor !== 'off') {
        flash.style.background = savedColor || '#4ade80';
        flash.classList.remove('active');
        void flash.offsetWidth;
        flash.classList.add('active');
    }

    // Vibrate
    const vibrateEnabled = localStorage.getItem('meemtime-vibrate') === 'true';
    if (vibrateEnabled && navigator.vibrate) {
        navigator.vibrate(100);
    }
}

/**
 * Render the day selector grid
 */
function renderDaySelector() {
    const container = elements.dayGrid;
    container.innerHTML = '';

    RELAXATION_DAYS.forEach(dayData => {
        const btn = document.createElement('button');
        btn.className = 'day-btn';
        btn.dataset.day = dayData.day;

        const progressPct = relaxProgress.getDayProgress(dayData.day, dayData.tasks.length);
        const isComplete = relaxProgress.isDayComplete(dayData.day);

        btn.innerHTML = `
            <span class="day-number">Day ${dayData.day}</span>
            <div class="day-progress">
                <div class="day-progress-bar" style="width: ${progressPct}%"></div>
            </div>
            ${isComplete ? '<span class="day-complete-icon">&#10003;</span>' : ''}
        `;

        if (isComplete) {
            btn.classList.add('complete');
        }

        btn.addEventListener('click', () => selectDay(dayData.day));
        container.appendChild(btn);
    });
}

/**
 * Render the tips page
 */
function renderTipsPage() {
    const container = elements.tipsContent;
    let html = '';

    for (const [key, section] of Object.entries(TIPS_CONTENT)) {
        html += `
            <div class="tips-section">
                <h2>${section.title}</h2>
                <ul class="tips-list">
                    ${section.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Select a day and show task list
 */
function selectDay(dayNum) {
    const dayData = RELAXATION_DAYS.find(d => d.day === dayNum);
    if (!dayData) return;

    relaxSession = new TaskSession(dayData);

    // Resume from last position if available
    const lastIndex = relaxProgress.getLastTaskIndex(dayNum);
    if (lastIndex > 0 && lastIndex < dayData.tasks.length) {
        relaxSession.setTaskIndex(lastIndex);
    }

    renderTaskList();
    showScreen('relax-task-screen');
}

/**
 * Render the task list for current session
 */
function renderTaskList() {
    elements.taskTitle.textContent = relaxSession.getDayTitle();

    const container = elements.taskList;
    container.innerHTML = '';

    relaxSession.dayData.tasks.forEach((task, index) => {
        const item = document.createElement('div');
        item.className = 'task-item';
        item.dataset.index = index;

        const isComplete = relaxProgress.isTaskComplete(relaxSession.getDayNumber(), task.id);
        if (isComplete) {
            item.classList.add('complete');
        }

        if (index === relaxSession.currentTaskIndex) {
            item.classList.add('current');
        }

        item.innerHTML = `
            <span class="task-number">${index + 1}</span>
            <span class="task-text">${task.instruction}</span>
            ${task.type === 'timed' ? `<span class="task-duration">${formatTimeRelax(task.durationMs)}</span>` : ''}
        `;

        item.addEventListener('click', () => startTask(index));
        container.appendChild(item);
    });

    // Scroll current task into view
    const currentItem = container.querySelector('.task-item.current');
    if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Start a specific task
 */
function startTask(index) {
    relaxSession.setTaskIndex(index);
    relaxProgress.setLastTaskIndex(relaxSession.getDayNumber(), index);

    const task = relaxSession.getCurrentTask();
    renderTaskView(task);
    showScreen('relax-timer-screen');
}

/**
 * Render the active task view
 */
function renderTaskView(task) {
    elements.taskInstruction.textContent = task.instruction;

    const pos = relaxSession.getPosition();
    elements.taskProgress.textContent = `Task ${pos.current} of ${pos.total}`;

    // Reset timer state
    if (relaxTimer) {
        relaxTimer.stop();
    }

    // Show/hide timer or mark-complete based on task type
    if (task.type === 'timed' && task.durationMs) {
        elements.timerContainer.classList.remove('hidden');
        elements.markCompleteBtn.classList.add('hidden');

        // Initialize timer display
        relaxTimer = new TimerDisplay({
            countdownElement: elements.countdown,
            msElement: elements.countdownMs,
            onComplete: handleTimerComplete
        });

        relaxTimer.setDisplay(task.durationMs);

        // Reset button states
        elements.startBtn.classList.remove('hidden');
        elements.pauseBtn.classList.add('hidden');
        elements.resumeBtn.classList.add('hidden');
    } else {
        elements.timerContainer.classList.add('hidden');
        elements.markCompleteBtn.classList.remove('hidden');
    }

    // Update navigation buttons
    elements.prevBtn.disabled = pos.isFirst;
    elements.nextBtn.textContent = pos.isLast ? 'Finish Day' : 'Next \u2192';
}

/**
 * Handle timer start
 */
function handleStartTimer() {
    const task = relaxSession.getCurrentTask();
    if (!task || !task.durationMs) return;

    relaxTimer.start(task.durationMs);
    elements.startBtn.classList.add('hidden');
    elements.pauseBtn.classList.remove('hidden');
}

/**
 * Handle timer pause
 */
function handlePauseTimer() {
    relaxTimer.pause();
    elements.pauseBtn.classList.add('hidden');
    elements.resumeBtn.classList.remove('hidden');
}

/**
 * Handle timer resume
 */
function handleResumeTimer() {
    relaxTimer.resume();
    elements.resumeBtn.classList.add('hidden');
    elements.pauseBtn.classList.remove('hidden');
}

/**
 * Handle timer reset
 */
function handleResetTimer() {
    const task = relaxSession.getCurrentTask();
    if (!task || !task.durationMs) return;

    relaxTimer.reset();
    elements.pauseBtn.classList.add('hidden');
    elements.resumeBtn.classList.add('hidden');
    elements.startBtn.classList.remove('hidden');
}

/**
 * Handle timer completion
 */
function handleTimerComplete() {
    triggerFeedback();

    // Mark task complete
    const task = relaxSession.getCurrentTask();
    relaxProgress.completeTask(relaxSession.getDayNumber(), task.id);

    // Auto-advance after delay
    setTimeout(() => {
        if (!relaxSession.isLastTask()) {
            advanceToNextTask();
        } else {
            finishDay();
        }
    }, 800);
}

/**
 * Handle mark complete for non-timed tasks
 */
function handleMarkComplete() {
    triggerFeedback();

    const task = relaxSession.getCurrentTask();
    relaxProgress.completeTask(relaxSession.getDayNumber(), task.id);

    // Auto-advance
    if (!relaxSession.isLastTask()) {
        advanceToNextTask();
    } else {
        finishDay();
    }
}

/**
 * Advance to next task
 */
function advanceToNextTask() {
    const nextTask = relaxSession.nextTask();
    if (nextTask) {
        relaxProgress.setLastTaskIndex(relaxSession.getDayNumber(), relaxSession.currentTaskIndex);
        renderTaskView(nextTask);
    }
}

/**
 * Go to previous task
 */
function goToPreviousTask() {
    const prevTask = relaxSession.previousTask();
    if (prevTask) {
        relaxProgress.setLastTaskIndex(relaxSession.getDayNumber(), relaxSession.currentTaskIndex);
        renderTaskView(prevTask);
    }
}

/**
 * Handle next button click
 */
function handleNextClick() {
    if (relaxSession.isLastTask()) {
        finishDay();
    } else {
        advanceToNextTask();
    }
}

/**
 * Finish the current day
 */
function finishDay() {
    relaxProgress.markDayComplete(relaxSession.getDayNumber());

    // Stop timer if running
    if (relaxTimer) {
        relaxTimer.stop();
    }

    // Return to day selector
    renderDaySelector();
    showScreen('relax-day-screen');
}

/**
 * Go back to task list from task view
 */
function backToTaskList() {
    if (relaxTimer) {
        relaxTimer.stop();
    }
    renderTaskList();
    showScreen('relax-task-screen');
}

/**
 * Initialize home screen mode buttons
 */
function initHomeScreen() {
    const modeInterval = document.getElementById('mode-interval');
    const modeRelax = document.getElementById('mode-relax');

    modeInterval.addEventListener('click', () => {
        showScreen('setup-screen');
    });

    modeRelax.addEventListener('click', () => {
        renderDaySelector();
        showScreen('relax-day-screen');
    });
}

/**
 * Cache element references
 */
function cacheElements() {
    flash = document.getElementById('flash');
    elements.dayGrid = document.getElementById('relax-day-grid');
    elements.tipsContent = document.getElementById('relax-tips-content');
    elements.taskTitle = document.getElementById('relax-task-title');
    elements.taskList = document.getElementById('relax-task-list');
    elements.taskInstruction = document.getElementById('relax-task-instruction');
    elements.taskProgress = document.getElementById('relax-task-progress');
    elements.timerContainer = document.getElementById('relax-timer-container');
    elements.countdown = document.getElementById('relax-countdown');
    elements.countdownMs = document.getElementById('relax-countdown-ms');
    elements.startBtn = document.getElementById('relax-start-btn');
    elements.pauseBtn = document.getElementById('relax-pause-btn');
    elements.resumeBtn = document.getElementById('relax-resume-btn');
    elements.resetBtn = document.getElementById('relax-reset-btn');
    elements.markCompleteBtn = document.getElementById('relax-mark-complete');
    elements.prevBtn = document.getElementById('relax-prev-btn');
    elements.nextBtn = document.getElementById('relax-next-btn');

    // Back buttons
    elements.backHome = document.getElementById('relax-back-home');
    elements.tipsBtn = document.getElementById('relax-tips-btn');
    elements.tipsBack = document.getElementById('relax-tips-back');
    elements.taskBack = document.getElementById('relax-task-back');
    elements.timerBack = document.getElementById('relax-timer-back');
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
    // Navigation
    elements.backHome.addEventListener('click', () => showScreen('home-screen'));
    elements.tipsBtn.addEventListener('click', () => {
        renderTipsPage();
        showScreen('relax-tips-screen');
    });
    elements.tipsBack.addEventListener('click', () => showScreen('relax-day-screen'));
    elements.taskBack.addEventListener('click', () => {
        renderDaySelector();
        showScreen('relax-day-screen');
    });
    elements.timerBack.addEventListener('click', backToTaskList);

    // Timer controls
    elements.startBtn.addEventListener('click', handleStartTimer);
    elements.pauseBtn.addEventListener('click', handlePauseTimer);
    elements.resumeBtn.addEventListener('click', handleResumeTimer);
    elements.resetBtn.addEventListener('click', handleResetTimer);

    // Task controls
    elements.markCompleteBtn.addEventListener('click', handleMarkComplete);
    elements.prevBtn.addEventListener('click', goToPreviousTask);
    elements.nextBtn.addEventListener('click', handleNextClick);
}

/**
 * Initialize relaxation app
 */
function initRelaxation() {
    // Initialize progress tracker
    relaxProgress = new RelaxationProgress();

    // Cache elements
    cacheElements();

    // Attach event listeners
    attachEventListeners();

    // Initialize home screen
    initHomeScreen();
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelaxation);
} else {
    initRelaxation();
}

})(); // End IIFE
