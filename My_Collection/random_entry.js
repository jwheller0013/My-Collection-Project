document.addEventListener('DOMContentLoaded', () => {
    const API_URL = `http://localhost:8080`;
    const randomEntryLink = document.getElementById('random-entry-link'); // General random link if it exists on other pages
    const randomEntryLinkCollectionFooter = document.getElementById('random-entry-link-collection'); // The footer random link with its consistent ID

    // Helper to get query param (reused from collection_detail.js for consistency)
    const getQueryParam = (name) => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    };

    const handleRandomEntryClick = (event) => {
        event.preventDefault(); // Stop the default '#' behavior

        let fetchUrl = `${API_URL}/api/random_entry`; // Default: general random entry

        // Check if we are on the collection_detail page AND the footer button was clicked
        if (window.location.pathname.includes('/My_Collection/collection_detail.html') && event.currentTarget === randomEntryLinkCollectionFooter) {
            const collectionId = getQueryParam('collectionid'); // Get collection ID from URL
            if (collectionId) {
                fetchUrl = `${API_URL}/api/random_entry_from_collection?collection_id=${collectionId}`;
            } else {
                alert('Collection ID not found for random entry on this page.');
                return; // Prevent fetch if ID is missing
            }
        }

        fetch(fetchUrl)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Failed to get random entry ID');
                    });
                }
                return response.json();
            })
            .then(data => {
                if (data && data.entry_id) {
                    window.location.href = `/My_Collection/entry_detail.html?entry_id=${data.entry_id}`;
                } else {
                    alert(data.error || 'No entries found for a random pick.'); // Use data.error for backend messages
                }
            })
            .catch(error => {
                console.error('Error fetching random entry:', error);
                alert(error.message);
            });
    };

    // Attach the handler to the consistent footer button ID
    if (randomEntryLinkCollectionFooter) {
        randomEntryLinkCollectionFooter.addEventListener('click', handleRandomEntryClick);
    }
    // Also keep the old randomEntryLink if it's used elsewhere (e.g., if you have another random link that's not the footer)
    if (randomEntryLink) {
        randomEntryLink.addEventListener('click', handleRandomEntryClick);
    }

});