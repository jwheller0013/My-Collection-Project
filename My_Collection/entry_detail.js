const API_URL = `http://localhost:8080`;
const ENTRY_DETAIL_CONTAINER_ID = 'entry-detail-container';

let allGenres = [];
let currentGenres = [];
let entryId = null;
let entryType = null; // Store the entry type
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
            entryType = data.type; // Correctly get entry type from 'type' property
            currentGenres = data.genres || [];
            showEntryDetails(data);
        })
        .catch(error => {
            console.error(`Error fetching entry details (attempts left: ${retries}):`, error);
            if (retries > 0) {
                setTimeout(() => fetchEntryDetails(entryId, retries - 1), 5000);
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

    let backLink = document.createElement('a');
    backLink.href = `/My_Collection/collection_detail.html?collectionid=${entry.collection_id}`;
    backLink.textContent = 'Back to Collection';
    backLink.style.marginBottom = '20px';
    backLink.style.display = 'block';
    container.appendChild(backLink);

    let title = document.createElement('h1');
    title.textContent = entry.title || 'No Title';
    container.appendChild(title);

    let posterImg = document.createElement('img');
    posterImg.src = entry.poster || 'placeholder.jpg';
    posterImg.alt = `${entry.title || 'No Title'} Poster`;
    posterImg.classList.add('entry-poster');
    container.appendChild(posterImg);

    // Conditional rendering for Media-specific fields
    if (entry.type === 'media') {
        let rating = document.createElement('p');
        rating.textContent = `Rating: ${entry.rating || 'N/A'}`;
        container.appendChild(rating);

        let imdbLink = document.createElement('a');
        imdbLink.href = entry.link || '#';
        imdbLink.textContent = 'IMDb Link';
        imdbLink.target = '_blank';
        container.appendChild(imdbLink);
    }

    let overview = document.createElement('p');
    overview.textContent = `Overview: ${entry.overview || 'N/A'}`;
    container.appendChild(overview);

    let genreLabel = document.createElement('p');
    genreLabel.innerHTML = '<strong>Genres:</strong> <span id="genre-display">' +
        (currentGenres.length ? currentGenres.map(g => g.name).join(', ') : 'None') + '</span>';
    container.appendChild(genreLabel);

    let editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        const section = document.getElementById('entry-edit-section');
        const isVisible = section.style.display === 'block';
        section.style.display = isVisible ? 'none' : 'block';
        editButton.textContent = isVisible ? 'Edit' : 'Cancel';
        if (!isVisible) renderEditForm(entry);
    });
    container.appendChild(editButton);

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Entry';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            deleteEntry(entry.id, entry.collection_id);
        }
    });
    container.appendChild(deleteButton);

    let editSection = document.createElement('div');
    editSection.id = 'entry-edit-section';
    editSection.style.display = 'none';
    container.appendChild(editSection);
}

function renderEditForm(entry) {
    const section = document.getElementById('entry-edit-section');
    if (!section) return;

    section.innerHTML = '';

    const fields = [
        { id: 'edit-title', label: 'Title', value: entry.title || '' },
        { id: 'edit-overview', label: 'Overview', value: entry.overview || '' },
        { id: 'edit-poster', label: 'Poster URL', value: entry.poster || '' }
    ];

    // Add Media-specific fields conditionally
    if (entry.type === 'media') {
        fields.push(
            { id: 'edit-rating', label: 'Rating', value: entry.rating || '' },
            { id: 'edit-link', label: 'Link', value: entry.link || '' }
        );
    }

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

    // Start with common fields
    const updatedData = {
        title: document.getElementById('edit-title').value,
        overview: document.getElementById('edit-overview').value,
        poster: document.getElementById('edit-poster').value,
        genres: selectedGenreIds,
        type: entryType // Ensure the type is sent back for polymorphic handling on the backend
    };

    // Add Media-specific fields if the entry is of type 'media'
    if (entryType === 'media') {
        updatedData.rating = document.getElementById('edit-rating').value;
        updatedData.link = document.getElementById('edit-link').value;
    }
    // No specific fields needed for 'videogame' beyond the common ones

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
    entryId = getEntryIdFromUrl();

    if (!entryId) {
        const container = document.getElementById(ENTRY_DETAIL_CONTAINER_ID);
        if (container) {
            container.textContent = 'Invalid Entry ID';
        }
        return;
    }

    fetchAllGenres().then(() => {
        fetchEntryDetails(entryId);
    }).catch(err => {
        console.error('Error fetching genres:', err);
        fetchEntryDetails(entryId);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handlePage);
} else {
    handlePage();
}

window.addEventListener('load', () => {
    if (!entryId) {
        handlePage();
    }
});