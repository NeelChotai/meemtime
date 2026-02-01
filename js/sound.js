/**
 * Sound notification module for meemtime
 * Handles preloading and playback of completion sounds
 */
(function(global) {
    'use strict';

    // Sound configuration
    const SOUNDS = {
        'dog-clicker': './assets/sounds/dog-clicker.mp3',
        'anime-cute': './assets/sounds/anime-cute-sound.mp3',
        'apple-pay': './assets/sounds/apple-pay-sound.mp3',
        'good-job': './assets/sounds/good-job.mp3'
    };

    const STORAGE_KEY = 'meemtime-notification-sound';
    const DEFAULT_SOUND = 'dog-clicker';

    // Preloaded Audio objects
    let audioCache = {};
    let currentSound = DEFAULT_SOUND;

    /**
     * Preload all sounds into Audio objects for instant playback
     */
    function preloadSounds() {
        for (const [id, path] of Object.entries(SOUNDS)) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            audioCache[id] = audio;
        }
    }

    /**
     * Play the current notification sound
     */
    function playNotificationSound() {
        if (currentSound === 'off' || !audioCache[currentSound]) {
            return;
        }

        const audio = audioCache[currentSound];
        // Reset to start if already playing
        audio.currentTime = 0;
        audio.play().catch(function(err) {
            // Ignore autoplay errors (user hasn't interacted yet)
            console.warn('Sound playback failed:', err);
        });
    }

    /**
     * Set the notification sound and save to localStorage
     * @param {string} soundId - The sound identifier
     * @param {boolean} [preview=true] - Whether to play a preview
     */
    function setNotificationSound(soundId, preview) {
        if (preview === undefined) preview = true;

        currentSound = soundId;
        localStorage.setItem(STORAGE_KEY, soundId);

        // Update UI
        const container = document.getElementById('notification-sound');
        if (container) {
            container.querySelectorAll('button').forEach(function(btn) {
                btn.classList.toggle('selected', btn.dataset.sound === soundId);
            });
        }

        // Play preview
        if (preview && soundId !== 'off') {
            playNotificationSound();
        }
    }

    /**
     * Load saved sound setting from localStorage
     */
    function loadSoundSetting() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (SOUNDS[saved] || saved === 'off')) {
            currentSound = saved;
        } else {
            currentSound = DEFAULT_SOUND;
        }

        // Update UI
        const container = document.getElementById('notification-sound');
        if (container) {
            container.querySelectorAll('button').forEach(function(btn) {
                btn.classList.toggle('selected', btn.dataset.sound === currentSound);
            });
        }
    }

    /**
     * Get current sound setting
     * @returns {string} Current sound ID
     */
    function getCurrentSound() {
        return currentSound;
    }

    // Export
    global.SoundModule = {
        preloadSounds: preloadSounds,
        playNotificationSound: playNotificationSound,
        setNotificationSound: setNotificationSound,
        loadSoundSetting: loadSoundSetting,
        getCurrentSound: getCurrentSound
    };

})(typeof window !== 'undefined' ? window : this);
