const API_URL = `http://localhost:8080`;
const ENTRY_DETAIL_CONTAINER_ID = 'entry-detail-container';

function getEntryIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('entryid');
}

function fetchEntryDetails(entryId) {
    fetch(`${API_URL}/entries/${entryId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            showEntryDetails(data);
        })
        .catch(error => {
            console.error(`Error fetching entry details: ${error}`);
            document.getElementById(ENTRY_DETAIL_CONTAINER_ID).innerHTML = 'Error Loading Entry Details';
        });
}

function showEntryDetails(entry) {
    const container = document.getElementById(ENTRY_DETAIL_CONTAINER_ID);
    container.innerHTML = '';

    if (entry) {
        let title = document.createElement('h1');
        title.textContent = entry.title || 'No Title';

        let posterImg = document.createElement('img');
        posterImg.src = entry.poster || 'placeholder.jpg';
        posterImg.alt = `${entry.title || 'No Title'} Poster`;
        posterImg.classList.add('entry-poster');

        let rating = document.createElement('p');
        rating.textContent = `Rating: ${entry.rating || 'N/A'}`;

        let imdbLink = document.createElement('a');
        imdbLink.href = entry.link || '#';
        imdbLink.textContent = 'IMDb Link';
        imdbLink.target = '_blank';

        let genres = document.createElement('p');
        genres.textContent = `Genres: ${entry.genres ? entry.genres.join(', ') : 'N/A'}`;


        container.appendChild(title);
        container.appendChild(posterImg);
        container.appendChild(rating);
        container.appendChild(imdbLink);
        container.appendChild(genres);


    } else {
        container.textContent = 'Entry details not found.';
    }
}

function handlePage() {
    const entryId = getEntryIdFromUrl();
    if (entryId) {
        fetchEntryDetails(entryId);
    } else {
        document.getElementById(ENTRY_DETAIL_CONTAINER_ID).textContent = 'Invalid Entry ID';
    }
}

handlePage();