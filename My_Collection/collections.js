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
    collectionsListDiv.innerHTML = '';
    const list = document.createDocumentFragment();

    data.map(function (collection) {
        let div = document.createElement('div');
        let title = document.createElement('h3');
        title.textContent = collection.collection_title || 'No Title';

        let viewLink = document.createElement('a');
        viewLink.href = `/My_Collection/collection_detail.html?collectionid=${collection.id}`;
        viewLink.textContent = 'View Details';

        let deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete Collection';
        deleteButton.classList.add('delete-button'); // Add a class for specific delete button styling
        deleteButton.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the collection "${collection.collection_title}" and ALL its entries? This action cannot be undone.`)) {
                deleteCollection(collection.id);
            }
        });

        div.appendChild(title);
        div.appendChild(viewLink);
        div.appendChild(document.createElement('br'));
        div.appendChild(deleteButton);

        list.appendChild(div);
    });

    collectionsListDiv.appendChild(list);
}

async function deleteCollection(collectionIdToDelete) {
    try {
        const response = await fetch(`${API_URL}/collections/${collectionIdToDelete}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
                // Add authorization headers if your app uses them
            }
        });

        if (response.ok) {
            alert('Collection and its entries deleted successfully!');
            // Only re-fetch and display the updated list AFTER successful deletion
            fetchCollectionsData();
        } else {
            const errorData = await response.json(); // Attempt to parse error message from server
            alert(`Failed to delete collection: ${errorData.msg || response.statusText}`);
            console.error('Delete collection failed:', errorData);
        }
    } catch (error) {
        alert('An error occurred while deleting the collection.');
        console.error('Network error during collection delete:', error);
    }
}

function handlePage() {
    console.log('load all collections');
    fetchCollectionsData();
}

handlePage();