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
            entryType = data.type;
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

    // Back link
    let backLink = document.createElement('a');
    backLink.href = `/My_Collection/collection_detail.html?collectionid=${entry.collection_id}`;
    backLink.textContent = 'Back to Collection';
    backLink.style.marginBottom = '20px';
    backLink.style.display = 'block';
    container.appendChild(backLink);

    // Title
    let title = document.createElement('h1');
    title.textContent = entry.title || 'No Title';
    container.appendChild(title);

    // Entry type indicator
    let typeIndicator = document.createElement('p');
    typeIndicator.innerHTML = `<strong>Type:</strong> ${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}`;
    typeIndicator.style.fontStyle = 'italic';
    typeIndicator.style.marginBottom = '10px';
    container.appendChild(typeIndicator);

    // Poster
    let posterImg = document.createElement('img');
    posterImg.src = entry.poster || 'placeholder.jpg';
    posterImg.alt = `${entry.title || 'No Title'} Poster`;
    posterImg.classList.add('entry-poster');
    container.appendChild(posterImg);

    // Common fields
    let overview = document.createElement('p');
    overview.innerHTML = `<strong>Overview:</strong> ${entry.overview || 'N/A'}`;
    container.appendChild(overview);

    // Type-specific fields
    if (entry.type === 'media') {
        let tvFilm = document.createElement('p');
        tvFilm.innerHTML = `<strong>Type:</strong> ${entry.tv_film ? 'TV Show' : 'Movie'}`;
        container.appendChild(tvFilm);

        let rating = document.createElement('p');
        rating.innerHTML = `<strong>Rating:</strong> ${entry.rating || 'N/A'}`;
        container.appendChild(rating);

        if (entry.link) {
            let imdbLink = document.createElement('a');
            imdbLink.href = entry.link;
            imdbLink.textContent = 'IMDb Link';
            imdbLink.target = '_blank';
            imdbLink.style.display = 'block';
            imdbLink.style.marginBottom = '10px';
            container.appendChild(imdbLink);
        }
    } else if (entry.type === 'book') {
        let author = document.createElement('p');
        author.innerHTML = `<strong>Author:</strong> ${entry.author || 'Unknown Author'}`;
        container.appendChild(author);

        let isRead = document.createElement('p');
        isRead.innerHTML = `<strong>Status:</strong> ${entry.is_read ? 'Read' : 'Not Read'}`;
        container.appendChild(isRead);
    }

    // UPC if available
    if (entry.upc) {
        let upc = document.createElement('p');
        upc.innerHTML = `<strong>UPC:</strong> ${entry.upc}`;
        container.appendChild(upc);
    }

    // Genres
    let genreLabel = document.createElement('p');
    genreLabel.innerHTML = '<strong>Genres:</strong> <span id="genre-display">' +
        (currentGenres.length ? currentGenres.map(g => g.name).join(', ') : 'None') + '</span>';
    container.appendChild(genreLabel);

    // Edit button
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

    // Delete button
    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Entry';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            deleteEntry(entry.id, entry.collection_id);
        }
    });
    container.appendChild(deleteButton);

    // Edit section
    let editSection = document.createElement('div');
    editSection.id = 'entry-edit-section';
    editSection.style.display = 'none';
    container.appendChild(editSection);
}

function renderEditForm(entry) {
    const section = document.getElementById('entry-edit-section');
    if (!section) return;

    section.innerHTML = '';

    // Create form
    const form = document.createElement('form');
    form.style.marginTop = '20px';
    form.style.padding = '20px';
    form.style.border = '1px solid #ccc';
    form.style.borderRadius = '5px';

    const formTitle = document.createElement('h3');
    formTitle.textContent = 'Edit Entry';
    form.appendChild(formTitle);

    // Common fields
    const commonFields = [
        { id: 'edit-title', label: 'Title', value: entry.title || '', required: true },
        { id: 'edit-overview', label: 'Overview', value: entry.overview || '', type: 'textarea' },
        { id: 'edit-poster', label: 'Poster URL', value: entry.poster || '' },
        { id: 'edit-upc', label: 'UPC', value: entry.upc || '' }
    ];

    // Add type-specific fields
    let typeSpecificFields = [];
    if (entry.type === 'media') {
        typeSpecificFields = [
            { id: 'edit-tv-film', label: 'Type', value: entry.tv_film, type: 'select', options: [
                { value: false, label: 'Movie' },
                { value: true, label: 'TV Show' }
            ]},
            { id: 'edit-rating', label: 'Rating (0-10)', value: entry.rating || '', type: 'number', min: 0, max: 10, step: 0.1 },
            { id: 'edit-link', label: 'IMDb Link', value: entry.link || '', type: 'url' }
        ];
    } else if (entry.type === 'book') {
        typeSpecificFields = [
            { id: 'edit-author', label: 'Author', value: entry.author || 'Unknown Author', required: true },
            { id: 'edit-is-read', label: 'Have you read this book?', value: entry.is_read, type: 'checkbox' }
        ];
    }

    // Combine all fields
    const allFields = [...commonFields, ...typeSpecificFields];

    // Create form fields
    allFields.forEach(field => {
        const fieldContainer = document.createElement('div');
        fieldContainer.style.marginBottom = '15px';

        const label = document.createElement('label');
        label.textContent = field.label + (field.required ? ' *' : '') + ': ';
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        label.style.fontWeight = 'bold';

        let input;
        if (field.type === 'textarea') {
            input = document.createElement('textarea');
            input.rows = 4;
            input.style.resize = 'vertical';
        } else if (field.type === 'select') {
            input = document.createElement('select');
            field.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.label;
                optionElement.selected = option.value === field.value;
                input.appendChild(optionElement);
            });
        } else if (field.type === 'checkbox') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = field.value;
        } else {
            input = document.createElement('input');
            input.type = field.type || 'text';
            if (field.min !== undefined) input.min = field.min;
            if (field.max !== undefined) input.max = field.max;
            if (field.step !== undefined) input.step = field.step;
        }

        input.id = field.id;
        if (field.type !== 'checkbox') {
            input.value = field.value;
        }
        input.style.width = '100%';
        input.style.padding = '8px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '3px';

        if (field.required) {
            input.required = true;
        }

        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);
        form.appendChild(fieldContainer);
    });

    // Genres section
    const genreContainer = document.createElement('div');
    genreContainer.style.marginBottom = '15px';

    const genreLabel = document.createElement('label');
    genreLabel.innerHTML = '<strong>Genres:</strong>';
    genreLabel.style.display = 'block';
    genreLabel.style.marginBottom = '10px';

    const checkboxContainer = document.createElement('div');
    checkboxContainer.id = 'genre-checkboxes';
    checkboxContainer.style.display = 'flex';
    checkboxContainer.style.flexWrap = 'wrap';
    checkboxContainer.style.gap = '10px';

    genreContainer.appendChild(genreLabel);
    genreContainer.appendChild(checkboxContainer);
    form.appendChild(genreContainer);

    // Buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';

    const saveButton = document.createElement('button');
    saveButton.type = 'button';
    saveButton.textContent = 'Save Changes';
    saveButton.style.backgroundColor = '#4CAF50';
    saveButton.style.color = 'white';
    saveButton.style.padding = '10px 20px';
    saveButton.style.border = 'none';
    saveButton.style.borderRadius = '5px';
    saveButton.style.cursor = 'pointer';
    saveButton.addEventListener('click', saveAllChanges);

    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.textContent = 'Cancel';
    cancelButton.style.backgroundColor = '#f44336';
    cancelButton.style.color = 'white';
    cancelButton.style.padding = '10px 20px';
    cancelButton.style.border = 'none';
    cancelButton.style.borderRadius = '5px';
    cancelButton.style.cursor = 'pointer';
    cancelButton.addEventListener('click', () => {
        section.style.display = 'none';
        document.querySelector('button[onclick*="Edit"]').textContent = 'Edit';
    });

    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(cancelButton);
    form.appendChild(buttonContainer);

    section.appendChild(form);

    // Render genre checkboxes AFTER the form is added to the DOM
    renderGenreCheckboxes();
}

function renderGenreCheckboxes() {
    const container = document.getElementById("genre-checkboxes");
    if (!container) {
        console.error("Genre checkboxes container not found");
        return;
    }

    container.innerHTML = "";

    if (!allGenres || allGenres.length === 0) {
        console.error("No genres available");
        container.textContent = "No genres available";
        return;
    }

    console.log("Rendering genres:", allGenres);
    console.log("Current genres:", currentGenres);

    allGenres.forEach(genre => {
        const label = document.createElement("label");
        label.style.display = 'flex';
        label.style.alignItems = 'center';
        label.style.padding = '5px';
        label.style.border = '1px solid #ddd';
        label.style.borderRadius = '3px';
        label.style.cursor = 'pointer';
        label.style.marginBottom = '5px';

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = genre.id;
        checkbox.name = "genre";

        // More robust checking for current genres
        const isChecked = currentGenres.some(g => {
            return parseInt(g.id) === parseInt(genre.id);
        });
        checkbox.checked = isChecked;
        checkbox.style.marginRight = '5px';

        const text = document.createTextNode(genre.name);

        label.appendChild(checkbox);
        label.appendChild(text);
        container.appendChild(label);
    });
}

function saveAllChanges() {
    // Debug: Check if checkboxes exist
    const checkboxes = document.querySelectorAll('#genre-checkboxes input[type="checkbox"]');
    console.log("Found checkboxes:", checkboxes.length);

    const checkedBoxes = document.querySelectorAll('#genre-checkboxes input[type="checkbox"]:checked');
    console.log("Checked boxes:", checkedBoxes.length);

    const selectedGenreIds = Array.from(checkedBoxes).map(cb => {
        const id = parseInt(cb.value);
        console.log("Selected genre ID:", id);
        return id;
    });

    console.log("Final selected genre IDs:", selectedGenreIds);

    // Start with common fields
    const updatedData = {
        title: document.getElementById('edit-title').value,
        overview: document.getElementById('edit-overview').value,
        poster: document.getElementById('edit-poster').value,
        upc: document.getElementById('edit-upc').value,
        genres: selectedGenreIds,
        type: entryType
    };

    // Add type-specific fields
    if (entryType === 'media') {
        const tvFilmSelect = document.getElementById('edit-tv-film');
        updatedData.tv_film = tvFilmSelect.value === 'true';
        updatedData.rating = parseFloat(document.getElementById('edit-rating').value) || null;
        updatedData.link = document.getElementById('edit-link').value;
    } else if (entryType === 'book') {
        updatedData.author = document.getElementById('edit-author').value;
        updatedData.is_read = document.getElementById('edit-is-read').checked;
    }

    // Validate required fields
    if (!updatedData.title.trim()) {
        alert('Title is required');
        return;
    }

    if (entryType === 'book' && !updatedData.author.trim()) {
        alert('Author is required for books');
        return;
    }

    console.log("Sending updated data:", updatedData);

    fetch(`${API_URL}/entries/${entryId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
    }).then(res => {
        if (res.ok) {
            alert('Entry updated successfully!');
            location.reload();
        } else {
            return res.text().then(txt => {
                console.error("Error response:", txt);
                alert("Failed to update entry: " + txt);
            });
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