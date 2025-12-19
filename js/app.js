// State
let baselineMs = 60000;
let intervalMs = 10000;
let currentTargetMs = 60000;
let lastCompletedTarget = 0;
let nextTargetMs = 0;
let round = 1;
let timerEndTime = null;
let animationId = null;
let isPaused = false;
let isAfterFail = false;
let sessionStartTime = null;
let totalActiveTime = 0;
let roundHistory = [];
let remainingTimeAtPause = 0;  // For pause/resume

// Settings state
let vibrateEnabled = false;
let flashColor = '#4ade80';  // default green

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
const startTrainingBtn = document.getElementById('start-training');
const endSessionBtn = document.getElementById('end-session');
const sessionTimerDisplay = document.getElementById('session-timer');
const nextTargetDisplay = document.getElementById('next-target');
const roundHistoryContainer = document.getElementById('round-history');

// Settings elements
const settingsToggle = document.getElementById('settings-toggle');
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
        console.log('Wake lock failed:', err);
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

// Calculate next target with upward-only variance (1.0x to 1.2x)
function calculateNextTarget(baseTarget) {
    const maxVariance = 0.2;
    const random = Math.random();
    const multiplier = 1 + (random * maxVariance);
    return Math.round(baseTarget * multiplier);
}

// Flash screen and vibrate
function triggerFlash() {
    // Flash if not disabled
    if (flashColor !== 'off') {
        flash.style.background = flashColor;
        flash.classList.remove('active');
        void flash.offsetWidth;
        flash.classList.add('active');
    }

    // Vibrate if enabled
    if (vibrateEnabled && navigator.vibrate) {
        navigator.vibrate(100);
    }
}

// Settings functions
function toggleSettings() {
    settingsPanel.classList.toggle('hidden');
    settingsToggle.classList.toggle('active');
}

function setFlashColor(color) {
    flashColor = color;
    localStorage.setItem('meemtime-flash-color', color);

    // Update selected state
    flashColorContainer.querySelectorAll('button').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.color === color);
    });
}

function setVibrate(enabled) {
    vibrateEnabled = enabled;
    localStorage.setItem('meemtime-vibrate', enabled ? 'true' : 'false');
}

function loadSettings() {
    // Load flash color
    const savedColor = localStorage.getItem('meemtime-flash-color');
    if (savedColor) {
        flashColor = savedColor;
        flashColorContainer.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.color === savedColor);
        });
    }

    // Load vibrate setting
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
    roundHistory.push({ round: roundNumber, duration: durationMs });

    // Remove empty state message if present
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

// Calculate and display next target preview
function updateNextTargetPreview() {
    const baseTarget = currentTargetMs + intervalMs;
    nextTargetMs = calculateNextTarget(baseTarget);
    nextTargetDisplay.textContent = formatTime(nextTargetMs);
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
        addToHistory(round, currentTargetMs);
        lastCompletedTarget = currentTargetMs;

        round++;
        roundNum.textContent = round;

        currentTargetMs = nextTargetMs;
        targetDisplay.textContent = formatTime(currentTargetMs);

        updateNextTargetPreview();

        timerEndTime = Date.now() + currentTargetMs;
    }

    animationId = requestAnimationFrame(updateTimer);
}

// Show buttons for active state
function showActiveButtons() {
    buttonRow.classList.remove('hidden');
    resumeBtn.classList.add('hidden');
}

// Show resume button (after pause or fail)
function showResumeState() {
    buttonRow.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
}

// Start training
function startTraining() {
    baselineMs = (parseInt(baselineMinInput.value) || 0) * 60000 +
                 (parseInt(baselineSecInput.value) || 0) * 1000;
    intervalMs = (parseInt(intervalMinInput.value) || 0) * 60000 +
                 (parseInt(intervalSecInput.value) || 0) * 1000;

    if (baselineMs <= 0) {
        baselineMs = 60000;
    }
    if (intervalMs <= 0) {
        intervalMs = 10000;
    }

    currentTargetMs = baselineMs;
    lastCompletedTarget = 0;
    round = 1;
    isPaused = false;
    isAfterFail = false;
    remainingTimeAtPause = 0;

    sessionStartTime = Date.now();
    totalActiveTime = 0;
    roundHistory = [];

    // Reset history with empty state
    roundHistoryContainer.innerHTML = '<div class="round-history-empty">No rounds completed yet</div>';

    roundNum.textContent = round;
    targetDisplay.textContent = formatTime(currentTargetMs);
    updateNextTargetPreview();

    setupScreen.classList.remove('active');
    trainingScreen.classList.add('active');

    showActiveButtons();
    requestWakeLock();

    timerEndTime = Date.now() + currentTargetMs;
    animationId = requestAnimationFrame(updateTimer);
}

// Pause - stop timer, can resume from same point
function handlePause() {
    if (isPaused) return;

    cancelAnimationFrame(animationId);

    // Save remaining time
    remainingTimeAtPause = Math.max(0, timerEndTime - Date.now());

    // Accumulate active time
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

    // Accumulate active time
    totalActiveTime += Date.now() - sessionStartTime;

    isPaused = true;
    isAfterFail = true;
    remainingTimeAtPause = 0;

    // Reset to last completed target (or baseline)
    currentTargetMs = lastCompletedTarget > 0 ? lastCompletedTarget : baselineMs;
    updateNextTargetPreview();

    targetDisplay.textContent = formatTime(currentTargetMs);
    countdown.textContent = formatTime(currentTargetMs);
    countdownMs.textContent = '.00';

    showResumeState();
}

// Resume after pause or fail
function handleResume() {
    isPaused = false;
    sessionStartTime = Date.now();

    showActiveButtons();

    if (isAfterFail) {
        // After fail: start fresh round with last completed target
        isAfterFail = false;
        round++;
        roundNum.textContent = round;
        timerEndTime = Date.now() + currentTargetMs;
    } else {
        // After pause: continue from where we left off
        timerEndTime = Date.now() + remainingTimeAtPause;
    }

    animationId = requestAnimationFrame(updateTimer);
}

// End session
function endSession() {
    cancelAnimationFrame(animationId);
    releaseWakeLock();

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

// Initialize when DOM is ready
function init() {
    // Event listeners
    startTrainingBtn.addEventListener('click', startTraining);
    failBtn.addEventListener('click', handleFail);
    pauseBtn.addEventListener('click', handlePause);
    resumeBtn.addEventListener('click', handleResume);
    endSessionBtn.addEventListener('click', endSession);

    // Settings event listeners
    settingsToggle.addEventListener('click', toggleSettings);
    vibrateToggle.addEventListener('change', (e) => setVibrate(e.target.checked));
    flashColorContainer.addEventListener('click', (e) => {
        if (e.target.dataset.color) {
            setFlashColor(e.target.dataset.color);
        }
    });

    // Handle visibility change (re-acquire wake lock)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !isPaused && trainingScreen.classList.contains('active')) {
            requestWakeLock();
        }
    });

    // Ensure inputs show 0 instead of blank
    ensureInputDefaults();

    // Load saved settings
    loadSettings();

    // Register service worker (only works over HTTP)
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
