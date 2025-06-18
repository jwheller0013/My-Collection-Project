const API_URL = `http://localhost:8080`;
const ENTRIES_LIST_ID = 'entries-list';
const COLLECTION_TITLE_ID = 'collection-title';

function getCollectionIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('collectionid');
}

function fetchCollectionDetails(collectionId) {
    fetch(`${API_URL}/collections/${collectionId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            showCollectionEntries(data);
            fetchCollectionTitle(collectionId);
        })
        .catch(error => {
            console.error(`Error fetching collection entries: ${error}`);
            document.getElementById(ENTRIES_LIST_ID).innerHTML = 'Error Loading Entries for this Collection';
        });
}

function fetchCollectionTitle(collectionId) {
    fetch(`${API_URL}/collections`)
        .then(res => res.json())
        .then(collections => {
            const collection = collections.find(c => c.id === parseInt(collectionId));
            if (collection && collection.collection_title) {
                document.getElementById(COLLECTION_TITLE_ID).textContent = collection.collection_title;
            }
        })
        .catch(error => {
            console.error(`Error fetching collection title: ${error}`);
            document.getElementById(COLLECTION_TITLE_ID).textContent = 'Collection Details';
        });
}

function showCollectionEntries(entries) {
    const entriesListDiv = document.getElementById(ENTRIES_LIST_ID);
    entriesListDiv.innerHTML = '';
    const list = document.createDocumentFragment();

    if (entries.length === 0) {
        entriesListDiv.innerHTML = '<p>No entries found in this collection.</p>';
        return;
    }

    entries.map(function (entry) {
        let div = document.createElement('div');
        div.classList.add('entry-item');

        if (entry.poster) {
            let posterImg = document.createElement('img');
            posterImg.src = entry.poster;
            posterImg.alt = `${entry.title || 'No Title'} Poster`;
            posterImg.classList.add('entry-poster');
            div.appendChild(posterImg);
        }

        let title = document.createElement('h4');
        title.textContent = entry.title || 'No Title';
        div.appendChild(title);

        let viewLink = document.createElement('a');
        viewLink.href = `entry_detail.html?entry_id=${entry.id}`;
        viewLink.textContent = 'View Entry Details';
        div.appendChild(viewLink);

        if (entry.type === 'media' || typeof entry.rating !== 'undefined' || typeof entry.link !== 'undefined') {
            let details = document.createElement('p');
            details.textContent = `Rating: ${entry.rating || 'N/A'}`;
            div.appendChild(details);

            let imdbLink = document.createElement('a');
            imdbLink.href = entry.link || '#';
            imdbLink.textContent = 'IMDb Link';
            imdbLink.target = '_blank';
            div.appendChild(imdbLink);
        }

        let genres = document.createElement('p');
        const genreNames = entry.genres && Array.isArray(entry.genres) && entry.genres.length > 0
            ? entry.genres.map(genre => genre.name).join(', ')
            : 'N/A';
        genres.textContent = `Genres: ${genreNames}`;
        div.appendChild(genres);

        list.appendChild(div);
    });

    entriesListDiv.appendChild(list);
}

function updateSortLink(collectionId) {
    const sortLink = document.getElementById('sort-link');
    if (sortLink) {
        sortLink.href = `sort.html?collectionid=${collectionId}`;
    }
}

// Handler for the NEW "Random Entry from this Collection" link (header button)
const handleRandomCollectionEntryClick = (event) => {
    event.preventDefault(); // Stop the default '#' behavior
    const collectionId = getCollectionIdFromUrl();

    if (!collectionId) {
        alert('Could not determine collection ID for random entry in this collection.');
        return;
    }

    fetch(`${API_URL}/api/random_entry_from_collection?collection_id=${collectionId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to get random entry ID from collection');
                });
            }
            return response.json();
        })
        .then(data => {
            if (data && data.entry_id) {
                window.location.href = `/My_Collection/entry_detail.html?entry_id=${data.entry_id}`;
            } else {
                alert(data.error || 'No entries found in this collection for a random pick.');
            }
        })
        .catch(error => {
            console.error('Error fetching random entry from collection:', error);
            alert(error.message);
        });
};


function handlePage() {
    const collectionId = getCollectionIdFromUrl();
    if (collectionId) {
        fetchCollectionDetails(collectionId);
        updateSortLink(collectionId);

        // Attach event listener for the NEW "Random Entry from this Collection" button
        const randomCollectionEntryLink = document.getElementById('random-collection-entry-link');
        if (randomCollectionEntryLink) {
            randomCollectionEntryLink.addEventListener('click', handleRandomCollectionEntryClick);
        }

    } else {
        document.getElementById(ENTRIES_LIST_ID).textContent = 'Invalid Collection ID';
    }
}

document.addEventListener('DOMContentLoaded', handlePage);