/**
 * Stopwatch (Countdown Timer) UI Integration
 * Single screen with idle/running states
 */
(function () {
  "use strict";

  // Get modules from globals
  const { TimerDisplay, formatTime } = window.TimerDisplayModule;

  // Constants
  const STORAGE_KEY = "meemtime-stopwatch-presets";
  const MAX_PRESETS = 6;
  const MIN_DURATION_MS = 1000; // 1 second minimum
  const DEFAULT_PRESETS = [3000, 5000, 10000, 20000]; // 3s, 5s, 10s, 20s

  // State
  let timer = null;
  let currentDurationMs = 5000; // Default 5 seconds
  let presets = [];
  let state = "idle"; // idle, running, paused

  // Elements cache
  const elements = {};
  let flash = null;

  /**
   * Show a screen by ID
   */
  function showScreen(screenId) {
    document
      .querySelectorAll(".screen")
      .forEach((s) => s.classList.remove("active"));
    const screen = document.getElementById(screenId);
    if (screen) screen.classList.add("active");
  }

  /**
   * Trigger completion feedback
   */
  function triggerFeedback() {
    const savedColor = localStorage.getItem("meemtime-flash-color");
    if (savedColor !== "off") {
      flash.style.background = savedColor || "#4ade80";
      flash.classList.remove("active");
      void flash.offsetWidth;
      flash.classList.add("active");
    }

    const vibrateEnabled = localStorage.getItem("meemtime-vibrate") !== "false";
    if (vibrateEnabled) {
      window.HapticModule.trigger();
    }

    window.SoundModule.playNotificationSound();
  }

  /**
   * Update UI based on current state
   */
  function updateUI() {
    if (state === "idle") {
      // Enable inputs for editing
      elements.minInput.disabled = false;
      elements.secInput.disabled = false;
      // Hide ms display
      elements.msDisplay.classList.add("hidden");
      // Show Start button, hide controls
      elements.startBtn.classList.remove("hidden");
      elements.controlsSection.classList.add("hidden");
    } else {
      // Disable inputs during countdown
      elements.minInput.disabled = true;
      elements.secInput.disabled = true;
      // Show ms display
      elements.msDisplay.classList.remove("hidden");
      // Hide Start button, show controls
      elements.startBtn.classList.add("hidden");
      elements.controlsSection.classList.remove("hidden");

      if (state === "running") {
        elements.pauseBtn.classList.remove("hidden");
        elements.resumeBtn.classList.add("hidden");
      } else if (state === "paused") {
        elements.pauseBtn.classList.add("hidden");
        elements.resumeBtn.classList.remove("hidden");
      }
    }
  }

  // === Preset Management ===

  function loadPresets() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.presets)) {
          presets = parsed.presets;
        }
      }
    } catch (err) {
      console.warn("Failed to load stopwatch presets:", err);
      presets = [];
    }
  }

  function savePresets() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ presets }));
    } catch (err) {
      console.warn("Failed to save stopwatch presets:", err);
    }
  }

  function addPreset(durationMs) {
    // Don't save default presets
    if (DEFAULT_PRESETS.includes(durationMs)) return;

    // Remove existing entry with same duration
    presets = presets.filter((p) => p.durationMs !== durationMs);

    // Add to front (MRU)
    presets.unshift({
      durationMs,
      lastUsed: Date.now(),
    });

    // Limit to MAX_PRESETS
    if (presets.length > MAX_PRESETS) {
      presets = presets.slice(0, MAX_PRESETS);
    }

    savePresets();
  }

  function renderPresets() {
    const defaultContainer = elements.defaultPresetButtons;
    const recentContainer = elements.recentPresetButtons;
    if (!defaultContainer) return;

    // Render default presets (always visible)
    defaultContainer.innerHTML = "";
    DEFAULT_PRESETS.forEach((durationMs) => {
      const btn = document.createElement("button");
      btn.className = "preset-btn";
      btn.textContent = formatTime(durationMs);
      btn.addEventListener("click", () => startWithDuration(durationMs));
      defaultContainer.appendChild(btn);
    });

    // Render recent presets (user's history)
    if (recentContainer) {
      if (presets.length === 0) {
        elements.recentPresetsSection.classList.add("hidden");
      } else {
        elements.recentPresetsSection.classList.remove("hidden");
        recentContainer.innerHTML = "";

        presets.forEach((preset) => {
          const btn = document.createElement("button");
          btn.className = "preset-btn";
          btn.textContent = formatTime(preset.durationMs);
          btn.addEventListener("click", () =>
            startWithDuration(preset.durationMs),
          );
          recentContainer.appendChild(btn);
        });
      }
    }
  }

  // === Timer Handlers ===

  function getDurationFromInputs() {
    const min = Math.max(
      0,
      Math.min(59, parseInt(elements.minInput.value) || 0),
    );
    const sec = Math.max(
      0,
      Math.min(59, parseInt(elements.secInput.value) || 0),
    );
    return (min * 60 + sec) * 1000;
  }

  function updateInputsFromDuration(durationMs) {
    const totalSec = Math.ceil(durationMs / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    elements.minInput.value = min;
    elements.secInput.value = sec.toString().padStart(2, "0");

    // Update ms display
    const fraction = Math.floor((durationMs % 1000) / 10);
    if (elements.msDisplay) {
      elements.msDisplay.textContent = `.${fraction.toString().padStart(2, "0")}`;
    }
  }

  function startWithDuration(durationMs) {
    currentDurationMs = durationMs;
    updateInputsFromDuration(durationMs);
    handleStart();
  }

  function handleStart() {
    // Stop any existing timer first
    if (timer) {
      timer.stop();
    }

    currentDurationMs = getDurationFromInputs();

    // Enforce minimum
    if (currentDurationMs < MIN_DURATION_MS) {
      currentDurationMs = MIN_DURATION_MS;
    }

    // Save as preset (if custom)
    addPreset(currentDurationMs);

    // Create timer - use onTick to update inputs directly
    timer = new TimerDisplay({
      countdownElement: elements.minInput, // dummy, we'll use onTick
      onTick: updateInputsFromDuration,
      onComplete: handleTimerComplete,
    });

    timer.start(currentDurationMs);
    state = "running";
    updateUI();
  }

  function handlePause() {
    if (timer) {
      timer.pause();
    }
    state = "paused";
    updateUI();
  }

  function handleResume() {
    if (timer) {
      timer.resume();
    }
    state = "running";
    updateUI();
  }

  function handleRestart() {
    if (timer) {
      timer.stop();
      timer.start(currentDurationMs);
    }
    // Reset to original duration and go back to idle
    state = "running";
    updateUI();
  }

  function handleTimerComplete() {
    triggerFeedback();

    // Return to idle state with original duration
    if (timer) {
      timer.stop();
    }
    state = "idle";
    updateInputsFromDuration(currentDurationMs);
    updateUI();
    renderPresets(); // Refresh presets in case new one was added
  }

  function handleBackHome() {
    // Stop timer if running
    if (timer) {
      timer.stop();
    }
    // Reset to original duration
    updateInputsFromDuration(currentDurationMs);
    state = "idle";
    updateUI();
    showScreen("home-screen");
  }

  // === Initialization ===

  function cacheElements() {
    flash = document.getElementById("flash");

    // Input elements
    elements.backHome = document.getElementById("stopwatch-back-home");
    elements.minInput = document.getElementById("stopwatch-min");
    elements.secInput = document.getElementById("stopwatch-sec");
    elements.msDisplay = document.getElementById("stopwatch-ms");

    // Preset elements
    elements.defaultPresetButtons = document.getElementById(
      "default-preset-buttons",
    );
    elements.recentPresetsSection = document.getElementById(
      "stopwatch-recent-presets",
    );
    elements.recentPresetButtons = document.getElementById(
      "recent-preset-buttons",
    );

    // Control elements
    elements.startBtn = document.getElementById("stopwatch-start");
    elements.controlsSection = document.getElementById("stopwatch-controls");
    elements.pauseBtn = document.getElementById("stopwatch-pause-btn");
    elements.resumeBtn = document.getElementById("stopwatch-resume-btn");
    elements.restartBtn = document.getElementById("stopwatch-restart-btn");

    // Settings toggle
    elements.settingsToggle = document.getElementById(
      "settings-toggle-stopwatch",
    );
  }

  function attachEventListeners() {
    // Mode button on home screen
    const modeBtn = document.getElementById("mode-stopwatch");
    if (modeBtn) {
      modeBtn.addEventListener("click", () => {
        state = "idle";
        updateUI();
        renderPresets();
        showScreen("stopwatch-screen");
      });
    }

    // Back button
    elements.backHome.addEventListener("click", handleBackHome);

    // Start button
    elements.startBtn.addEventListener("click", handleStart);

    // Timer controls
    elements.pauseBtn.addEventListener("click", handlePause);
    elements.resumeBtn.addEventListener("click", handleResume);
    elements.restartBtn.addEventListener("click", handleRestart);

    // Input defaults
    [elements.minInput, elements.secInput].forEach((input) => {
      input.addEventListener("blur", () => {
        if (input.value === "") input.value = "0";
      });
    });
  }

  function initSettingsToggle() {
    const panel = document.getElementById("settings-panel");

    if (elements.settingsToggle) {
      elements.settingsToggle.addEventListener("click", () => {
        panel.classList.toggle("hidden");
        const isOpen = !panel.classList.contains("hidden");
        document.querySelectorAll(".settings-toggle").forEach((t) => {
          t.classList.toggle("active", isOpen);
        });
      });
    }
  }

  function init() {
    cacheElements();
    loadPresets();
    attachEventListeners();
    initSettingsToggle();
  }

  // Run init when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
