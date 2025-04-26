document.addEventListener('DOMContentLoaded', () => {
    const API_URL = `http://localhost:8080`;
    const randomEntryLink = document.getElementById('random-entry-link');
    const randomEntryLinkCollection = document.getElementById('random-entry-link-collection');


    const handleRandomEntryClick = (event) => {
        event.preventDefault();

        fetch(`${API_URL}/api/random_entry`)
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
                    window.location.href = `/My_Collection/entry_detail.html?entryid=${data.entry_id}`;
                } else {
                    alert('Could not retrieve a random entry ID.');
                }
            })
            .catch(error => {
                console.error('Error fetching random entry:', error);
                alert(error.message);
            });
    };

    if (randomEntryLink) {
        randomEntryLink.addEventListener('click', handleRandomEntryClick);
    }

    if (randomEntryLinkCollection) {
        randomEntryLinkCollection.addEventListener('click', handleRandomEntryClick);
    }

});