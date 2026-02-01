(function() {
    'use strict';

    const installBtn = document.getElementById('install-btn');
    const installModal = document.getElementById('install-modal');
    const installModalBackdrop = document.getElementById('install-modal-backdrop');
    const installModalClose = document.getElementById('install-modal-close');

    let deferredPrompt = null;

    // Check if running in standalone mode (already installed)
    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches
            || window.navigator.standalone === true;
    }

    // Check if running on iOS Safari
    function isIOSSafari() {
        const ua = window.navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(ua);
        const isWebkit = /WebKit/.test(ua);
        const isChrome = /CriOS/.test(ua);
        const isFirefox = /FxiOS/.test(ua);
        return isIOS && isWebkit && !isChrome && !isFirefox;
    }

    // Check if Safari on macOS
    function isMacSafari() {
        const ua = window.navigator.userAgent;
        const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua) && !/Chromium/.test(ua);
        const isMac = /Macintosh/.test(ua);
        return isMac && isSafari;
    }

    function showInstallButton() {
        installBtn.style.display = 'inline-block';
    }

    function hideInstallButton() {
        installBtn.style.display = 'none';
    }

    function showModal() {
        installModal.classList.add('active');
    }

    function hideModal() {
        installModal.classList.remove('active');
    }

    // Initialize install functionality
    function init() {
        // Don't show install button if already installed
        if (isStandalone()) {
            hideInstallButton();
            return;
        }

        // Safari/iOS: show button immediately, open modal on click
        if (isIOSSafari() || isMacSafari()) {
            showInstallButton();

            installBtn.addEventListener('click', function() {
                showModal();
            });

            installModalClose.addEventListener('click', function() {
                hideModal();
            });

            installModalBackdrop.addEventListener('click', function() {
                hideModal();
            });

            return;
        }

        // Chromium: wait for beforeinstallprompt
        window.addEventListener('beforeinstallprompt', function(e) {
            e.preventDefault();
            deferredPrompt = e;
            showInstallButton();
        });

        installBtn.addEventListener('click', async function() {
            if (!deferredPrompt) {
                return;
            }

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            hideInstallButton();
        });

        // Hide button after successful install
        window.addEventListener('appinstalled', function() {
            hideInstallButton();
            deferredPrompt = null;
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
