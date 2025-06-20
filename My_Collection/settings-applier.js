// settings-applier.js
// Include this script in your main pages to apply saved settings

(function() {
    'use strict';

    // Load and apply settings when page loads
    function applySettings() {
        const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');

        if (Object.keys(settings).length === 0) return; // No settings saved

        const root = document.documentElement;

        // Apply CSS custom properties
        if (settings.textColor) {
            root.style.setProperty('--text-color', settings.textColor);
        }
        if (settings.accentColor) {
            root.style.setProperty('--accent-color', settings.accentColor);
        }
        if (settings.headingColor) {
            root.style.setProperty('--heading-color', settings.headingColor);
        }
        if (settings.fontFamily) {
            root.style.setProperty('--font-family', settings.fontFamily);
        }
        if (settings.maxWidth) {
            root.style.setProperty('--max-width', settings.maxWidth + 'rem');
        }
        if (settings.padding) {
            root.style.setProperty('--padding', settings.padding + 'rem');
        }

        // Apply text outline settings
        if (settings.textOutline) {
            let textStroke = 'none';
            let headingStroke = 'none';

            switch(settings.textOutline) {
                case 'light':
                    textStroke = '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000';
                    headingStroke = textStroke;
                    break;
                case 'dark':
                    textStroke = '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff';
                    headingStroke = textStroke;
                    break;
                case 'heavy':
                    textStroke = '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000';
                    headingStroke = textStroke;
                    break;
            }

            root.style.setProperty('--text-stroke', textStroke);
            root.style.setProperty('--heading-stroke', headingStroke);
        }

        // Apply font size to body
        if (settings.fontSize) {
            document.body.style.fontSize = settings.fontSize + 'px';
        }

        // Apply background image
        if (settings.bgImage) {
            document.body.style.backgroundImage = `url(${settings.bgImage})`;
            document.body.classList.add('has-bg-image');
        }
    }

    // Add settings button to page
    function addSettingsButton() {
        // Check if button already exists
        if (document.querySelector('.settings-btn')) return;

        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'settings-btn';
        settingsBtn.innerHTML = '⚙️';
        settingsBtn.title = 'Open Settings';
        settingsBtn.onclick = function() {
            window.open('settings.html', '_blank');
        };

        document.body.appendChild(settingsBtn);
    }

    // Listen for settings changes from other tabs
    function listenForSettingsChanges() {
        window.addEventListener('storage', function(e) {
            if (e.key === 'appSettings') {
                applySettings();
            }
        });

        // Also listen for focus events to catch changes
        window.addEventListener('focus', applySettings);
    }

    // Initialize when DOM is loaded
    function init() {
        applySettings();
        addSettingsButton();
        listenForSettingsChanges();
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();