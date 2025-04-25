const API_URL = `http://localhost:8080`;

function fetchEntriesData() {
    fetch(`${API_URL}/entries`)
        .then(res => res.json())
        .then(data => {
            showEntryList(data);
        })
        .catch(error => {
            console.error(`Error Fetching entries: ${error}`);
            document.getElementById('entries-list').innerHTML = 'Error Loading Entries';
        });
}

function showEntryList(data) {
    const entriesListDiv = document.getElementById('entries-list');
    const list = document.createDocumentFragment();

    data.map(function (entry) {
        let div = document.createElement('div');
        let title = document.createElement('h3');
        title.textContent = entry.title || 'No Title';

        let details = document.createElement('p');
        details.textContent = `Rating ${entry.rating}`;

        let imdbLink = document.createElement('a');
        imdbLink.href = `${entry.link}`;
        imdbLink.textContent = 'IMDb Link';

        let genres = document.createElement('p');
        genres.textContent = `Genres: ${entry.genres.join(', ')}`;

        let viewLink = document.createElement('a');
        viewLink.href = `/ui/entry_detail.html?entryid=${entry.id}`;
        viewLink.textContent = 'View Details';

        div.appendChild(title);
        div.appendChild(details);
        div.appendChild(imdbLink);
        div.appendChild(genres);
        div.appendChild(viewLink);

        list.appendChild(div);
    });

    entriesListDiv.appendChild(list);
}

function handlePage() {
    console.log('load all entries');
    fetchEntriesData();
}

handlePage();