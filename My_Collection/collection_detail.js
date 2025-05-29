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
            fetchCollectionTitle(collectionId); // Fetch and display the collection title
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
    const list = document.createDocumentFragment();

    entries.map(function (entry) {
        let div = document.createElement('div');

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
        viewLink.href = `/My_collection/entry_detail.html?entry_id=${entry.id}`;
        viewLink.textContent = 'View Entry Details';
        div.appendChild(viewLink);

        if (entry.type === 'media') {
            let details = document.createElement('p');
            details.textContent = `Rating: ${entry.rating || 'N/A'}`;
            div.appendChild(details);

            let imdbLink = document.createElement('a');
            imdbLink.href = entry.link || '#';
            imdbLink.textContent = 'IMDb Link';
            imdbLink.target = '_blank';
            div.appendChild(imdbLink);

            let genres = document.createElement('p');
            genres.textContent = `Genres: ${entry.genres ? entry.genres.join(', ') : 'N/A'}`;
            div.appendChild(genres);
        }

        list.appendChild(div);
    });

    entriesListDiv.appendChild(list);
}

function updateSortLink(collectionId) {
    const sortLink = document.getElementById('sort-link');
    if (sortLink) {
        sortLink.href = `/My_collection/sort.html?collectionid=${collectionId}`; //check if collection_id
    }
}

function handlePage() {
    const collectionId = getCollectionIdFromUrl();
    if (collectionId) {
        fetchCollectionDetails(collectionId);
        updateSortLink(collectionId);
    } else {
        document.getElementById(ENTRIES_LIST_ID).textContent = 'Invalid Collection ID';
    }
}

document.addEventListener('DOMContentLoaded', handlePage);
