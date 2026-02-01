/**
 * Haptic feedback module for meemtime
 * Uses Vibration API for Chromium browsers, falls back to iOS checkbox switch trick
 * Note: iOS haptic only works on direct user interaction, not timer auto-completion
 */
(function (global) {
  "use strict";

  var HAPTIC_ID = "___haptic-switch___";
  var LABEL_ID = "___haptic-label___";
  var HAPTIC_DURATION_MS = 10;

  var inputElement = null;
  var labelElement = null;
  var isIOS = false;

  /**
   * Detect if running on iOS
   */
  function detectIOS() {
    if (typeof navigator === "undefined" || typeof window === "undefined") {
      return false;
    }

    var iOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    var iPadOS =
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

    return iOSDevice || iPadOS;
  }

  /**
   * Mount - find elements and attach click listener
   */
  function mount() {
    if (labelElement && inputElement) return;

    isIOS = detectIOS();

    // Find elements from HTML
    inputElement = document.getElementById(HAPTIC_ID);
    labelElement = document.getElementById(LABEL_ID);

    // Attach click listener to label - this enables programmatic haptic on iOS
    if (labelElement) {
      labelElement.addEventListener("click", function () {
        // Empty handler - attaching it enables programmatic clicks to trigger haptic
      });
    }
  }

  /**
   * Click the label to trigger iOS haptic
   */
  function clickLabel() {
    if (!labelElement) return;
    var event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    labelElement.dispatchEvent(event);
  }

  /**
   * Trigger haptic feedback (2 pulses)
   * @param {number} [duration] - Vibration duration in ms (ignored on iOS)
   */
  function trigger(duration) {
    if (typeof window === "undefined") return;
    if (duration === undefined) duration = HAPTIC_DURATION_MS;

    if (isIOS) {
      // iOS: use checkbox switch trick (2 pulses)
      if (!labelElement) mount();
      if (labelElement) {
        clickLabel();
        setTimeout(function () {
          clickLabel();
        }, 100);
      }
    } else {
      // Non-iOS: try vibrate first, fall back to label click
      if (navigator && navigator.vibrate) {
        // Pattern: vibrate, pause, vibrate
        navigator.vibrate([duration, 50, duration]);
      } else if (labelElement) {
        clickLabel();
        setTimeout(function () {
          clickLabel();
        }, 100);
      }
    }
  }

  // Auto-mount when DOM is ready
  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount, { once: true });
    } else {
      mount();
    }
  }

  // Export
  global.HapticModule = {
    trigger: trigger,
  };
})(typeof window !== "undefined" ? window : this);
