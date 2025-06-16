const API_URL = `http://localhost:8080`;
const ENTRY_DETAIL_CONTAINER_ID = 'entry-detail-container';

let allGenres = [];
let currentGenres = [];
let entryId = null;
let entryType = null;
let entryData = {};

function getEntryIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('entry_id');
}

function fetchAllGenres() {
    return fetch(`${API_URL}/genres`)
        .then(res => res.json())
        .then(data => {
            allGenres = data;
        })
        .catch(err => console.error("Failed to fetch genres", err));
}

function fetchEntryDetails(entryId, retries = 3) {
    // Show loading state immediately
    const container = document.getElementById(ENTRY_DETAIL_CONTAINER_ID);
    if (container) {
        container.innerHTML = 'Loading entry details...';
    }

    fetch(`${API_URL}/entries/${entryId}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
        })
        .then(data => {
            entryData = data;
            entryType = data.entryType;
            currentGenres = data.genres || [];
            showEntryDetails(data);
        })
        .catch(error => {
            console.error(`Error fetching entry details (attempts left: ${retries}):`, error);
            if (retries > 0) {
                setTimeout(() => fetchEntryDetails(entryId, retries - 1), 5000); // Retry after 5 seconds
            } else {
                const container = document.getElementById(ENTRY_DETAIL_CONTAINER_ID);
                if (container) {
                    container.innerHTML = 'Error Loading Entry Details.';
                }
            }
        });
}

function showEntryDetails(entry) {
    const container = document.getElementById(ENTRY_DETAIL_CONTAINER_ID);
    if (!container) {
        console.error('Entry detail container not found');
        return;
    }

    container.innerHTML = '';

    // Add "Back to Collection" link
    let backLink = document.createElement('a');
    backLink.href = `/My_Collection/collection_detail.html?collectionid=${entry.collection_id}`;
    backLink.textContent = 'Back to Collection';
    backLink.style.marginBottom = '20px';
    backLink.style.display = 'block';

    let title = document.createElement('h1');
    title.textContent = entry.title || 'No Title';

    let posterImg = document.createElement('img');
    posterImg.src = entry.poster || 'placeholder.jpg';
    posterImg.alt = `${entry.title || 'No Title'} Poster`;
    posterImg.classList.add('entry-poster');

    let rating = document.createElement('p');
    rating.textContent = `Rating: ${entry.rating || 'N/A'}`;

    let overview = document.createElement('p');
    overview.textContent = `Overview: ${entry.overview || 'N/A'}`;

    let imdbLink = document.createElement('a');
    imdbLink.href = entry.link || '#';
    imdbLink.textContent = 'IMDb Link';
    imdbLink.target = '_blank';

    let genreLabel = document.createElement('p');
    genreLabel.innerHTML = '<strong>Genres:</strong> <span id="genre-display">' +
        (currentGenres.length ? currentGenres.map(g => g.name).join(', ') : 'None') + '</span>';

    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        const section = document.getElementById('entry-edit-section');
        const isVisible = section.style.display === 'block';
        section.style.display = isVisible ? 'none' : 'block';
        editButton.textContent = isVisible ? 'Edit' : 'Cancel';
        if (!isVisible) renderEditForm(entry);
    });

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Entry';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            deleteEntry(entry.id, entry.collection_id);
        }
    });

    let editSection = document.createElement('div');
    editSection.id = 'entry-edit-section';
    editSection.style.display = 'none';

    // Append elements in new order
    container.appendChild(backLink);
    container.appendChild(title);
    container.appendChild(posterImg);
    container.appendChild(rating);
    container.appendChild(overview);
    container.appendChild(imdbLink);
    container.appendChild(genreLabel);
    container.appendChild(editButton);
    container.appendChild(deleteButton);
    container.appendChild(editSection);
}

function renderEditForm(entry) {
    const section = document.getElementById('entry-edit-section');
    if (!section) return;

    section.innerHTML = '';

    const fields = [
        { id: 'edit-title', label: 'Title', value: entry.title || '' },
        { id: 'edit-rating', label: 'Rating', value: entry.rating || '' },
        { id: 'edit-overview', label: 'Overview', value: entry.overview || '' },
        { id: 'edit-link', label: 'Link', value: entry.link || '' },
        { id: 'edit-poster', label: 'Poster URL', value: entry.poster || '' }
    ];

    fields.forEach(field => {
        const label = document.createElement('label');
        label.textContent = field.label + ': ';
        const input = document.createElement('input');
        input.type = 'text';
        input.id = field.id;
        input.value = field.value;
        input.style.marginBottom = '10px';
        input.style.display = 'block';
        section.appendChild(label);
        section.appendChild(input);
    });

    const genreLabel = document.createElement('p');
    genreLabel.innerHTML = '<strong>Edit Genres:</strong>';
    section.appendChild(genreLabel);

    const checkboxContainer = document.createElement('div');
    checkboxContainer.id = 'genre-checkboxes';
    section.appendChild(checkboxContainer);

    renderGenreCheckboxes();

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Changes';
    saveButton.addEventListener('click', saveAllChanges);

    section.appendChild(saveButton);
}

function renderGenreCheckboxes() {
    const container = document.getElementById("genre-checkboxes");
    if (!container) return;

    container.innerHTML = "";
    allGenres.forEach(genre => {
        const label = document.createElement("label");
        label.style.marginRight = "10px";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = genre.id;
        checkbox.checked = currentGenres.some(g => g.id === genre.id);
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(` ${genre.name}`));
        container.appendChild(label);
    });
}

function saveAllChanges() {
    const selectedGenreIds = Array.from(
        document.querySelectorAll('#genre-checkboxes input[type="checkbox"]:checked')
    ).map(cb => parseInt(cb.value));

    const updatedData = {
        entryType: entryType,
        title: document.getElementById('edit-title').value,
        rating: document.getElementById('edit-rating').value,
        overview: document.getElementById('edit-overview').value,
        link: document.getElementById('edit-link').value,
        poster: document.getElementById('edit-poster').value,
        genres: selectedGenreIds
    };

    fetch(`${API_URL}/entries/${entryId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    }).then(res => {
        if (res.ok) {
            location.reload();
        } else {
            res.text().then(txt => console.error("Error response:", txt));
            alert("Failed to update entry.");
        }
    }).catch(err => {
        alert("Error while updating entry.");
        console.error(err);
    });
}

async function deleteEntry(entryIdToDelete, collectionId) {
    try {
        const response = await fetch(`${API_URL}/entries/${entryIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert('Entry deleted successfully!');
            // Redirect back to the collection detail page after successful deletion
            window.location.href = `/My_Collection/collection_detail.html?collectionid=${collectionId}`;
        } else {
            const errorData = await response.json();
            alert(`Failed to delete entry: ${errorData.msg || response.statusText}`);
            console.error('Delete failed:', errorData);
        }
    } catch (error) {
        alert('An error occurred while deleting the entry.');
        console.error('Network error during delete:', error);
    }
}

function handlePage() {
    console.log('handlePage called'); // Debug log
    entryId = getEntryIdFromUrl();
    console.log('Entry ID:', entryId); // Debug log

    if (!entryId) {
        const container = document.getElementById(ENTRY_DETAIL_CONTAINER_ID);
        if (container) {
            container.textContent = 'Invalid Entry ID';
        }
        return;
    }

    fetchAllGenres().then(() => {
        console.log('Genres fetched, now fetching entry details'); // Debug log
        fetchEntryDetails(entryId);
    }).catch(err => {
        console.error('Error fetching genres:', err);
        fetchEntryDetails(entryId); // Try to fetch entry details anyway
    });
}

// Multiple ways to ensure the script runs
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handlePage);
} else {
    // DOM is already loaded
    handlePage();
}

// Fallback for when DOM is ready but DOMContentLoaded didn't fire
window.addEventListener('load', () => {
    if (!entryId) {
        handlePage();
    }
});