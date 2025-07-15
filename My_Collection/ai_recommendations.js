// ai_recommendations.js

const API_URL = 'http://localhost:8080'; // Ensure this matches your backend Flask server address
let currentCollectionId = null;
let collectionData = null;

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');

    // Get collection ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentCollectionId = urlParams.get('collectionid');

    // Display an error and stop if no collection ID is provided
    if (!currentCollectionId) {
        showError('No collection ID provided. Please navigate from a collection page.');
        return;
    }

    console.log('Collection ID:', currentCollectionId);

    // Update the "Back to Collection" link with the current collection ID
    const backLink = document.getElementById('back-to-collection');
    if (backLink) {
        backLink.href = `/My_Collection/collection_detail.html?collectionid=${currentCollectionId}`;
    }

    // Initialize the page
    initializePage();
});

/**
 * Handles the case where AI returns JSON wrapped in markdown code blocks
 */
function showMarkdownJsonError(errorMessage) {
    console.log('Detected markdown-wrapped JSON in error message');

    // Extract JSON from markdown code blocks
    const jsonMatch = errorMessage.match(/```json\n([\s\S]*?)\n```/);

    if (jsonMatch) {
        try {
            const jsonString = jsonMatch[1];
            const recommendations = JSON.parse(jsonString);

            console.log('Successfully extracted recommendations from error message:', recommendations);

            // Display the recommendations even though they came in an "error" response
            displayRecommendations(recommendations);

            showError('⚠️ AI recommendations received with formatting issues, but displayed successfully. Your backend may need updates to handle AI response formatting.');

            return;
        } catch (parseError) {
            console.error('Failed to parse extracted JSON:', parseError);
        }
    }

    // If we can't extract the JSON, show the full error
    showError('AI response formatting error: The AI returned valid recommendations but your backend couldn\'t process them. Please check your backend AI response parsing.');
}

/**
 * Initialize the page by loading collection data and checking token status
 */
async function initializePage() {
    try {
        await loadCollectionData();
        await checkTokenStatus();
    } catch (error) {
        console.error('Error during initialization:', error);
        showError('Failed to initialize page: ' + error.message);
    }
}

/**
 * Fetches and displays the current collection's data.
 */
async function loadCollectionData() {
    try {
        console.log('Loading collection data...');

        // Fetch collection data from the backend API
        const response = await fetch(`${API_URL}/collections/${currentCollectionId}`);

        // If the response is not OK (e.g., 404, 500), throw an error
        if (!response.ok) {
            throw new Error(`Failed to load collection: HTTP status ${response.status}`);
        }

        // Parse the JSON response
        collectionData = await response.json();
        console.log('Collection data loaded:', collectionData);

        // Update the UI with the collection title and description
        const collectionTitleElement = document.getElementById('collection-title');
        const collectionDescriptionElement = document.getElementById('collection-description');

        if (collectionTitleElement) {
            collectionTitleElement.textContent = `AI Recommendations for Collection`;
        }
        if (collectionDescriptionElement) {
            const itemCount = Array.isArray(collectionData) ? collectionData.length : (collectionData.items ? collectionData.items.length : 0);
            collectionDescriptionElement.textContent =
                `Based on ${itemCount} items in your collection, AI will suggest similar content you might enjoy.`;
        }

    } catch (error) {
        console.error('Error loading collection data:', error);
        showError('Failed to load collection data: ' + error.message);
    }
}

/**
 * Checks if the user has an AI token configured with the backend.
 */
async function checkTokenStatus() {
    const tokenSetupDiv = document.getElementById('token-setup');
    const recommendationsControlsDiv = document.getElementById('recommendations-controls');

    console.log('Checking token status...');

    try {
        // Fetch AI token status from the backend API
        const response = await fetch(`${API_URL}/api/user/ai_token`);

        if (!response.ok) {
            console.error(`Failed to fetch token status: HTTP status ${response.status}`);
            // Show token setup for any error
            showTokenSetupUI();

            if (response.status === 404) {
                showError('AI token endpoint not found. Please ensure your backend supports AI recommendations.');
            } else {
                showError('Could not verify AI token status. Please ensure your backend is running and enter your token.');
            }
            return;
        }

        // Try to parse JSON response
        let data;
        try {
            const responseText = await response.text();
            console.log('Token status response:', responseText);
            data = JSON.parse(responseText);
        } catch (jsonError) {
            console.error('Failed to parse token status response as JSON:', jsonError);
            showTokenSetupUI();
            showError('Invalid response from server when checking token status.');
            return;
        }

        if (data.has_token) {
            console.log('User has token, showing controls');
            showRecommendationControlsUI();
        } else {
            console.log('User needs to set up token');
            showTokenSetupUI();
        }

    } catch (error) {
        console.error('Network error checking token status:', error);
        showTokenSetupUI();
        showError('Network error: Could not connect to the backend to check AI token status. Please ensure the server is running.');
    }
}

/**
 * Show token setup UI and hide controls
 */
function showTokenSetupUI() {
    const tokenSetupDiv = document.getElementById('token-setup');
    const recommendationsControlsDiv = document.getElementById('recommendations-controls');

    if (tokenSetupDiv) tokenSetupDiv.style.display = 'block';
    if (recommendationsControlsDiv) recommendationsControlsDiv.style.display = 'none';
}

/**
 * Show recommendation controls UI and hide token setup
 */
function showRecommendationControlsUI() {
    const tokenSetupDiv = document.getElementById('token-setup');
    const recommendationsControlsDiv = document.getElementById('recommendations-controls');

    if (recommendationsControlsDiv) recommendationsControlsDiv.style.display = 'block';
    if (tokenSetupDiv) tokenSetupDiv.style.display = 'none';
}

/**
 * Saves the user-provided AI token to the backend.
 */
async function saveAiToken() {
    const tokenInput = document.getElementById('ai-token-input');
    const token = tokenInput ? tokenInput.value.trim() : '';

    // Validate if a token was entered
    if (!token) {
        showError('Please enter your OpenRouter API token before saving.');
        return;
    }

    console.log('Saving AI token...');

    try {
        // Send the token to the backend for saving
        const response = await fetch(`${API_URL}/api/user/ai_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ai_token: token })
        });

        // If saving failed, throw an error
        if (!response.ok) {
            let errorMessage = `Failed to save token: HTTP status ${response.status}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
                console.error('Could not parse error response:', jsonError);
            }

            throw new Error(errorMessage);
        }

        console.log('Token saved successfully');
        showSuccess('API token saved successfully!');

        // Show recommendation controls
        showRecommendationControlsUI();

        // Clear the input field after successful save
        if (tokenInput) tokenInput.value = '';

    } catch (error) {
        console.error('Error saving token:', error);
        showError('Failed to save token: ' + error.message);
    }
}

/**
 * Shows the token setup section and hides the recommendation controls.
 */
function showTokenSetup() {
    showTokenSetupUI();
    hideMessages();
}

/**
 * Generates AI recommendations based on the current collection.
 */
async function generateRecommendations() {
    // Ensure a collection is selected
    if (!currentCollectionId) {
        showError('No collection selected. Please refresh the page or navigate from a collection.');
        return;
    }

    console.log('Generating recommendations for collection:', currentCollectionId);

    // Get UI elements
    const loadingDiv = document.getElementById('loading');
    const generateButton = document.getElementById('generate-btn');
    const recommendationsGrid = document.getElementById('recommendations-grid');

    // Show loading state and disable the generate button
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (generateButton) generateButton.disabled = true;
    if (recommendationsGrid) recommendationsGrid.innerHTML = '';
    hideMessages();

    try {
        // Send a request to the backend to generate recommendations
        const response = await fetch(`${API_URL}/api/ai_recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collection_id: currentCollectionId })
        });

        console.log('Recommendations response status:', response.status);

        // Handle non-OK responses
        if (!response.ok) {
            let errorMessage = `Failed to generate recommendations: HTTP status ${response.status}`;

            try {
                const responseText = await response.text();
                console.log('Error response text:', responseText);

                // Try to parse as JSON
                const errorData = JSON.parse(responseText);

                // Check if the error contains JSON wrapped in markdown
                if (errorData.error && errorData.error.includes('```json')) {
                    showMarkdownJsonError(errorData.error);
                    return; // Exit early to avoid throwing the error
                }

                errorMessage = errorData.error || errorMessage;
            } catch (jsonError) {
                console.error('Could not parse error response as JSON:', jsonError);
                // Use the raw response text as error message if it's not too long
                if (responseText && responseText.length < 200) {
                    errorMessage = responseText;
                }
            }

            throw new Error(errorMessage);
        }

        // Parse the successful response
        let data;
        try {
            const responseText = await response.text();
            console.log('Success response text:', responseText);
            data = JSON.parse(responseText);
        } catch (jsonError) {
            console.error('Failed to parse recommendations response as JSON:', jsonError);
            throw new Error('Invalid JSON response from server');
        }

        console.log('Recommendations data:', data);

        if (data.recommendations) {
            displayRecommendations(data.recommendations);
        } else {
            throw new Error('No recommendations found in response');
        }

    } catch (error) {
        console.error('Error generating recommendations:', error);
        showError('Failed to generate recommendations: ' + error.message);
    } finally {
        // Hide loading state and re-enable the generate button
        if (loadingDiv) loadingDiv.style.display = 'none';
        if (generateButton) generateButton.disabled = false;
    }
}

/**
 * Displays the generated recommendations in the grid.
 * @param {Array} recommendations - An array of recommendation objects.
 */
function displayRecommendations(recommendations) {
    const grid = document.getElementById('recommendations-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Display a message if no recommendations were returned
    if (!recommendations || recommendations.length === 0) {
        grid.innerHTML = '<p class="text-center text-gray-600">No recommendations generated. Please try again or check your collection data.</p>';
        return;
    }

    console.log('Displaying', recommendations.length, 'recommendations');

    // Create and append a card for each recommendation
    recommendations.forEach((rec, index) => {
        try {
            const card = createRecommendationCard(rec);
            grid.appendChild(card);
        } catch (error) {
            console.error('Error creating recommendation card', index, ':', error);
        }
    });
}

/**
 * Creates an HTML card element for a single recommendation.
 * @param {Object} recommendation - The recommendation object.
 * @returns {HTMLElement} The created div element for the card.
 */
function createRecommendationCard(recommendation) {
    const card = document.createElement('div');
    card.className = 'recommendation-card';

    let cardContent = `
        <div class="recommendation-title">${escapeHtml(recommendation.title || 'Unknown Title')}</div>
    `;

    // Add author if present (for books)
    if (recommendation.author) {
        cardContent += `<div class="recommendation-author">by ${escapeHtml(recommendation.author)}</div>`;
    }

    // Add description
    if (recommendation.description) {
        cardContent += `<div class="recommendation-description">${escapeHtml(recommendation.description)}</div>`;
    }

    // Add reason for recommendation
    if (recommendation.reason) {
        cardContent += `<div class="recommendation-reason"><strong>Why this matches:</strong> ${escapeHtml(recommendation.reason)}</div>`;
    }

    // Add review link
    if (recommendation.review_link) {
        cardContent += `<a href="${escapeHtml(recommendation.review_link)}" target="_blank" class="review-link">Read Reviews</a>`;
    }

    card.innerHTML = cardContent;
    return card;
}

/**
 * Escapes HTML special characters in a string to prevent XSS.
 * @param {string} text - The text to escape.
 * @returns {string} The escaped HTML string.
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

/**
 * Displays an error message in the dedicated error div.
 * @param {string} message - The error message to display.
 */
function showError(message) {
    console.error('Showing error:', message);

    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // Hide success message if an error occurs
    const successDiv = document.getElementById('success-message');
    if (successDiv) successDiv.style.display = 'none';

    // Auto-hide the error message after 10 seconds
    setTimeout(() => {
        if (errorDiv) errorDiv.style.display = 'none';
    }, 10000);
}

/**
 * Displays a success message in the dedicated success div.
 * @param {string} message - The success message to display.
 */
function showSuccess(message) {
    console.log('Showing success:', message);

    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }

    // Hide error message if a success occurs
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) errorDiv.style.display = 'none';

    // Auto-hide the success message after 5 seconds
    setTimeout(() => {
        if (successDiv) successDiv.style.display = 'none';
    }, 5000);
}

/**
 * Hides both the error and success message divs.
 */
function hideMessages() {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    if (errorDiv) errorDiv.style.display = 'none';
    if (successDiv) successDiv.style.display = 'none';
}