const API_URL = `http://localhost:8080`;
const COLLECTIONS_LIST_ID = 'collections-list'; // Use a constant for the ID

function fetchCollectionsData() {
    fetch(`${API_URL}/collections`)
        .then(res => res.json())
        .then(data => {
            showCollectionList(data);
        })
        .catch(error => {
            console.error(`Error Fetching collections: ${error}`);
            document.getElementById(COLLECTIONS_LIST_ID).innerHTML = 'Error Loading Collections';
        });
}

function showCollectionList(data) {
    const collectionsListDiv = document.getElementById(COLLECTIONS_LIST_ID);
    const list = document.createDocumentFragment();

    data.map(function (collection) {
        let div = document.createElement('div');
        let title = document.createElement('h3');
        title.textContent = collection.collection_title || 'No Title';

        let viewLink = document.createElement('a');
        viewLink.href = `/My_Collection/collection_detail.html?collectionid=${collection.id}`;
        viewLink.textContent = 'View Details';

        div.appendChild(title);
        div.appendChild(viewLink);

        list.appendChild(div);
    });

    collectionsListDiv.appendChild(list);
}

function handlePage() {
    console.log('load all collections');
    fetchCollectionsData();
}

handlePage();