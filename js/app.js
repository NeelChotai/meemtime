// Get TimerSession from global (loaded via script tag before this file)
const { TimerSession } = window.TimerLogic;

// Session state (uses tested TimerSession class)
let session = null;

// UI/timing state (not part of timer logic)
let timerEndTime = null;
let animationId = null;
let isPaused = false;
let isAfterFail = false;
let sessionStartTime = null;
let totalActiveTime = 0;
let remainingTimeAtPause = 0;
let nextRandomValue = 0;  // Sync preview with actual next target

// Settings state
let vibrateEnabled = false;
let flashColor = '#4ade80';

// Elements
const flash = document.getElementById('flash');
const setupScreen = document.getElementById('setup-screen');
const trainingScreen = document.getElementById('training-screen');
const countdown = document.getElementById('countdown');
const countdownMs = document.getElementById('countdown-ms');
const targetDisplay = document.getElementById('target-display');
const roundNum = document.getElementById('round-num');
const buttonRow = document.getElementById('button-row');
const failBtn = document.getElementById('fail-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const failMessage = document.getElementById('fail-message');
const startTrainingBtn = document.getElementById('start-training');
const endSessionBtn = document.getElementById('end-session');
const sessionTimerDisplay = document.getElementById('session-timer');
const nextTargetDisplay = document.getElementById('next-target');
const roundHistoryContainer = document.getElementById('round-history');

// Settings elements
const settingsToggle = document.getElementById('settings-toggle');
const settingsToggleTraining = document.getElementById('settings-toggle-training');
const settingsPanel = document.getElementById('settings-panel');
const vibrateToggle = document.getElementById('vibrate-toggle');
const flashColorContainer = document.getElementById('flash-color');

// Input elements
const baselineMinInput = document.getElementById('baseline-min');
const baselineSecInput = document.getElementById('baseline-sec');
const intervalMinInput = document.getElementById('interval-min');
const intervalSecInput = document.getElementById('interval-sec');

// Keep screen awake
let wakeLock = null;
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.warn('Wake lock unavailable:', err);
    }
}

function releaseWakeLock() {
    if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
    }
}

// Format time
function formatTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatMs(ms) {
    const fraction = Math.floor((ms % 1000) / 10);
    return `.${fraction.toString().padStart(2, '0')}`;
}

// Flash screen and vibrate
function triggerFlash() {
    if (flashColor !== 'off') {
        flash.style.background = flashColor;
        flash.classList.remove('active');
        void flash.offsetWidth;
        flash.classList.add('active');
    }

    if (vibrateEnabled && navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// Settings functions
function toggleSettings() {
    const isHidden = settingsPanel.classList.toggle('hidden');
    settingsToggle.classList.toggle('active', !isHidden);
    settingsToggleTraining.classList.toggle('active', !isHidden);
}

function closeSettings() {
    settingsPanel.classList.add('hidden');
    settingsToggle.classList.remove('active');
    settingsToggleTraining.classList.remove('active');
}

function setFlashColor(color) {
    flashColor = color;
    localStorage.setItem('meemtime-flash-color', color);
    flashColorContainer.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === color);
    });
}

function setVibrate(enabled) {
    vibrateEnabled = enabled;
    localStorage.setItem('meemtime-vibrate', enabled ? 'true' : 'false');

    // Provide immediate feedback when enabling
    if (enabled && navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function loadSettings() {
    const savedColor = localStorage.getItem('meemtime-flash-color');
    if (savedColor) {
        flashColor = savedColor;
        flashColorContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === savedColor);
        });
    }

    const savedVibrate = localStorage.getItem('meemtime-vibrate');
    if (savedVibrate === 'true') {
        vibrateEnabled = true;
        vibrateToggle.checked = true;
    }
}

// Update session timer display
function updateSessionTimer() {
    const elapsed = totalActiveTime + (isPaused ? 0 : (Date.now() - sessionStartTime));
    sessionTimerDisplay.textContent = formatTime(elapsed);
}

// Add round to history display
function addToHistory(roundNumber, durationMs) {
    const emptyMsg = roundHistoryContainer.querySelector('.round-history-empty');
    if (emptyMsg) {
        emptyMsg.remove();
    }

    const item = document.createElement('div');
    item.className = 'round-history-item';
    item.innerHTML = `Round ${roundNumber} <span>${formatTime(durationMs)}</span>`;
    roundHistoryContainer.appendChild(item);
    roundHistoryContainer.scrollTop = roundHistoryContainer.scrollHeight;
}

// Generate next random value and update preview display
function updateNextTargetPreview() {
    nextRandomValue = Math.random();
    const preview = session.previewNextTarget(nextRandomValue);
    nextTargetDisplay.textContent = formatTime(preview);
}

// Timer loop
function updateTimer() {
    const now = Date.now();
    const remaining = Math.max(0, timerEndTime - now);

    countdown.textContent = formatTime(remaining);
    countdownMs.textContent = formatMs(remaining);
    updateSessionTimer();

    if (remaining <= 0) {
        triggerFlash();

        // Record completed round before advancing
        addToHistory(session.round, session.currentTarget);

        // Advance to next round using pre-calculated random value
        session.completeRound(nextRandomValue);

        // Update display
        roundNum.textContent = session.round;
        targetDisplay.textContent = formatTime(session.currentTarget);

        // Calculate next preview
        updateNextTargetPreview();

        // Start next timer
        timerEndTime = Date.now() + session.currentTarget;
    }

    animationId = requestAnimationFrame(updateTimer);
}

// Show buttons for active state
function showActiveButtons() {
    buttonRow.classList.remove('hidden');
    resumeBtn.classList.add('hidden');
    failMessage.classList.add('hidden');
}

// Show resume button (after pause or fail)
function showResumeState(afterFail = false) {
    buttonRow.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    if (afterFail) {
        failMessage.classList.remove('hidden');
    } else {
        failMessage.classList.add('hidden');
    }
}

// Input validation helper
function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// Start training
function startTraining() {
    // Parse and validate inputs
    const baselineMin = clamp(parseInt(baselineMinInput.value) || 0, 0, 59);
    const baselineSec = clamp(parseInt(baselineSecInput.value) || 0, 0, 59);
    const intervalMin = clamp(parseInt(intervalMinInput.value) || 0, 0, 59);
    const intervalSec = clamp(parseInt(intervalSecInput.value) || 0, 0, 59);

    let baselineMs = baselineMin * 60000 + baselineSec * 1000;
    let intervalMs = intervalMin * 60000 + intervalSec * 1000;

    // Enforce minimums
    if (baselineMs < 1000) baselineMs = 1000;
    if (intervalMs < 1000) intervalMs = 1000;

    // Create new session with validated values
    session = new TimerSession(baselineMs, intervalMs);

    // Reset UI state
    isPaused = false;
    isAfterFail = false;
    remainingTimeAtPause = 0;
    sessionStartTime = Date.now();
    totalActiveTime = 0;

    // Reset history display
    roundHistoryContainer.innerHTML = '<div class="round-history-empty">No rounds completed yet</div>';

    // Update display
    roundNum.textContent = session.round;
    targetDisplay.textContent = formatTime(session.currentTarget);
    updateNextTargetPreview();

    // Switch screens
    closeSettings();
    setupScreen.classList.remove('active');
    trainingScreen.classList.add('active');

    showActiveButtons();
    requestWakeLock();

    // Start timer
    timerEndTime = Date.now() + session.currentTarget;
    animationId = requestAnimationFrame(updateTimer);
}

// Pause - stop timer, can resume from same point
function handlePause() {
    if (isPaused) return;

    cancelAnimationFrame(animationId);
    animationId = null;  // Clear to prevent race conditions

    remainingTimeAtPause = Math.max(0, timerEndTime - Date.now());
    totalActiveTime += Date.now() - sessionStartTime;

    isPaused = true;
    isAfterFail = false;

    countdown.textContent = formatTime(remainingTimeAtPause);
    countdownMs.textContent = '.00';

    showResumeState();
}

// Fail - reset to last completed target
function handleFail() {
    if (isPaused) return;

    cancelAnimationFrame(animationId);
    animationId = null;  // Clear to prevent race conditions

    totalActiveTime += Date.now() - sessionStartTime;

    isPaused = true;
    isAfterFail = true;
    remainingTimeAtPause = 0;

    // Use TimerSession to calculate fail target
    session.fail();

    // Update next preview for after resume
    updateNextTargetPreview();

    // Update display
    targetDisplay.textContent = formatTime(session.currentTarget);
    countdown.textContent = formatTime(session.currentTarget);
    countdownMs.textContent = '.00';

    failMessage.textContent = `Dog broke. Back to ${formatTime(session.currentTarget)}.`;

    showResumeState(true);
}

// Resume after pause or fail
function handleResume() {
    if (!isPaused) return;  // Guard against double-click

    isPaused = false;
    sessionStartTime = Date.now();

    showActiveButtons();

    if (isAfterFail) {
        // After fail: start fresh round with recovery target
        isAfterFail = false;
        session.resume();  // Increments round counter
        roundNum.textContent = session.round;
        timerEndTime = Date.now() + session.currentTarget;
    } else {
        // After pause: continue from where we left off
        timerEndTime = Date.now() + remainingTimeAtPause;
    }

    animationId = requestAnimationFrame(updateTimer);
}

// End session
function endSession() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    releaseWakeLock();
    closeSettings();

    trainingScreen.classList.remove('active');
    setupScreen.classList.add('active');
}

// Ensure inputs show 0 instead of blank
function ensureInputDefaults() {
    [baselineMinInput, baselineSecInput, intervalMinInput, intervalSecInput].forEach(input => {
        if (input.value === '') {
            input.value = '0';
        }
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.value = '0';
            }
        });
    });
}

// Initialize
function init() {
    // Event listeners
    startTrainingBtn.addEventListener('click', startTraining);
    failBtn.addEventListener('click', handleFail);
    pauseBtn.addEventListener('click', handlePause);
    resumeBtn.addEventListener('click', handleResume);
    endSessionBtn.addEventListener('click', endSession);

    // Settings event listeners
    settingsToggle.addEventListener('click', toggleSettings);
    settingsToggleTraining.addEventListener('click', toggleSettings);
    vibrateToggle.addEventListener('change', (e) => setVibrate(e.target.checked));
    flashColorContainer.addEventListener('click', (e) => {
        if (e.target.dataset.color) {
            setFlashColor(e.target.dataset.color);
        }
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.classList.contains('hidden') &&
            !settingsPanel.contains(e.target) &&
            !settingsToggle.contains(e.target) &&
            !settingsToggleTraining.contains(e.target)) {
            closeSettings();
        }
    });

    // Handle visibility change (re-acquire wake lock)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !isPaused && trainingScreen.classList.contains('active')) {
            requestWakeLock();
        }
    });

    // Flash animation cleanup
    flash.addEventListener('animationend', () => {
        flash.classList.remove('active');
    });

    ensureInputDefaults();
    loadSettings();

    // Register service worker
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        navigator.serviceWorker.register('./sw.js');
    }
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
