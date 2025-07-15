const API_URL = 'http://localhost:8080';
let currentCollectionId = null;
let collectionData = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Get collection ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    currentCollectionId = urlParams.get('collectionid');

    if (!currentCollectionId) {
        showError('No collection ID provided');
        return;
    }

    // Update back to collection link
    const backLink = document.getElementById('back-to-collection');
    backLink.href = `/My_Collection/collection_detail.html?collectionid=${currentCollectionId}`;

    // Load collection data and check token status
    loadCollectionData();
    checkTokenStatus();
});

async function loadCollectionData() {
    try {
        const response = await fetch(`${API_URL}/collections/${currentCollectionId}`);
        if (!response.ok) throw new Error('Failed to load collection');

        collectionData = await response.json();

        // Update UI with collection info
        document.getElementById('collection-title').textContent = `AI Recommendations for Collection`;
        document.getElementById('collection-description').textContent =
            `Based on ${collectionData.length} items in your collection, AI will suggest similar content you might enjoy.`;

    } catch (error) {
        showError('Failed to load collection data: ' + error.message);
    }
}

async function checkTokenStatus() {
    try {
        const response = await fetch(`${API_URL}/api/user/ai_token`);
        const data = await response.json();

        if (data.has_token) {
            // User has token, show recommendation controls
            document.getElementById('recommendations-controls').style.display = 'block';
        } else {
            // User needs to set up token
            document.getElementById('token-setup').style.display = 'block';
        }
    } catch (error) {
        showError('Failed to check token status: ' + error.message);
    }
}

async function saveAiToken() {
    const token = document.getElementById('ai-token-input').value.trim();

    if (!token) {
        showError('Please enter your OpenRouter API token');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/user/ai_token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ai_token: token })
        });

        if (!response.ok) throw new Error('Failed to save token');

        showSuccess('API token saved successfully!');

        // Hide token setup and show controls
        document.getElementById('token-setup').style.display = 'none';
        document.getElementById('recommendations-controls').style.display = 'block';

        // Clear the input
        document.getElementById('ai-token-input').value = '';

    } catch (error) {
        showError('Failed to save token: ' + error.message);
    }
}

function showTokenSetup() {
    document.getElementById('token-setup').style.display = 'block';
    document.getElementById('recommendations-controls').style.display = 'none';
}

async function generateRecommendations() {
    if (!currentCollectionId) {
        showError('No collection selected');
        return;
    }

    // Show loading state
    document.getElementById('loading').style.display = 'block';
    document.getElementById('generate-btn').disabled = true;
    document.getElementById('recommendations-grid').innerHTML = '';
    hideMessages();

    try {
        const response = await fetch(`${API_URL}/api/ai_recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ collection_id: currentCollectionId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate recommendations');
        }

        const data = await response.json();
        displayRecommendations(data.recommendations);

    } catch (error) {
        showError('Failed to generate recommendations: ' + error.message);
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('generate-btn').disabled = false;
    }
}

function displayRecommendations(recommendations) {
    const grid = document.getElementById('recommendations-grid');
    grid.innerHTML = '';

    if (!recommendations || recommendations.length === 0) {
        grid.innerHTML = '<p>No recommendations generated. Please try again.</p>';
        return;
    }

    recommendations.forEach(rec => {
        const card = createRecommendationCard(rec);
        grid.appendChild(card);
    });
}

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

    // Add reason
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Hide success message
    document.getElementById('success-message').style.display = 'none';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.style.display = 'block';

    // Hide error message
    document.getElementById('error-message').style.display = 'none';

    // Auto-hide after 3 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function hideMessages() {
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('success-message').style.display = 'none';
}