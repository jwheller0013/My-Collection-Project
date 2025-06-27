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
            // Also apply directly to body for immediate effect
            document.body.style.color = settings.textColor;
        }
        if (settings.accentColor) {
            root.style.setProperty('--accent-color', settings.accentColor);
        }
        if (settings.headingColor) {
            root.style.setProperty('--heading-color', settings.headingColor);
            // Apply to headings directly
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(h => h.style.color = settings.headingColor);
        }
        if (settings.fontFamily) {
            root.style.setProperty('--font-family', settings.fontFamily);
            document.body.style.fontFamily = settings.fontFamily;
        }
        if (settings.fontSize) {
            root.style.setProperty('--font-size', settings.fontSize + 'px');
            document.body.style.fontSize = settings.fontSize + 'px';
        }
        if (settings.maxWidth) {
            root.style.setProperty('--max-width', settings.maxWidth + 'rem');
            // Apply to body and common container classes
            document.body.style.maxWidth = settings.maxWidth + 'rem';
            const containers = document.querySelectorAll('.container, .main-content, .content');
            containers.forEach(container => {
                container.style.maxWidth = settings.maxWidth + 'rem';
            });
        }
        if (settings.padding) {
            root.style.setProperty('--padding', settings.padding + 'rem');
            document.body.style.padding = settings.padding + 'rem';
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

            // Apply text shadows directly
            document.body.style.textShadow = textStroke;
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            headings.forEach(h => h.style.textShadow = headingStroke);
        }

        // Apply background image
        if (settings.bgImage) {
            document.body.style.backgroundImage = `url(${settings.bgImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
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
        settingsBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: #1e60ca;
            color: white;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transition: all 0.2s ease;
        `;

        // Change from window.open to window.location for same-tab navigation
        settingsBtn.onclick = function() {
            window.location.href = 'settings.html';
        };

        // Add hover effect
        settingsBtn.onmouseenter = function() {
            this.style.transform = 'scale(1.1)';
            this.style.background = '#155aa0';
        };
        settingsBtn.onmouseleave = function() {
            this.style.transform = 'scale(1)';
            this.style.background = '#1e60ca';
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

    // Add base CSS for settings support
    function addBaseCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* CSS Custom Properties for settings */
            :root {
                --text-color: #222;
                --accent-color: #5eb5f4;
                --heading-color: #1e60ca;
                --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
                --font-size: 16px;
                --max-width: 50rem;
                --padding: 2rem;
                --text-stroke: none;
                --heading-stroke: none;
            }

            /* Apply CSS variables where possible */
            body {
                font-family: var(--font-family);
                color: var(--text-color);
                font-size: var(--font-size);
                max-width: var(--max-width);
                padding: var(--padding);
                text-shadow: var(--text-stroke);
            }

            h1, h2, h3, h4, h5, h6 {
                color: var(--heading-color);
                text-shadow: var(--heading-stroke);
            }

            /* Background image support */
            body.has-bg-image {
                background-size: cover !important;
                background-position: center !important;
                background-attachment: fixed !important;
            }

            /* Common container classes */
            .container, .main-content, .content {
                max-width: var(--max-width);
                padding: var(--padding);
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize when DOM is loaded
    function init() {
        addBaseCSS();
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