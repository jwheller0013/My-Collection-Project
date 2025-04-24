const API_URL = `http://localhost:8080`;

function fetchCollectionsData() {
  fetch(`${API_URL}/collections`)
    .then(res => res.json())
    .then(data => {
      showCollectionList(data);
    })
    .catch(error => {
      console.error(`Error Fetching collections: ${error}`);
      document.getElementById('collections-list').innerHTML = 'Error Loading Collections';
    });
}

function showCollectionList(data) {
  const ul = document.getElementById('collections-list');
  const list = document.createDocumentFragment();

  data.map(function (collection) {
    let li = document.createElement('li');
    let title = document.createElement('h3');
    title.textContent = collection.collection_title; // Use textContent for simple text

    let viewLink = document.createElement('a');
    viewLink.href = `/ui/collection_detail.html?collectionid=${collection.id}`;
    viewLink.textContent = 'View Details';

    li.appendChild(title);
    li.appendChild(viewLink);
    list.appendChild(li);
  });

  ul.appendChild(list);
}

function handlePage() {
  console.log('load all collections');
  fetchCollectionsData();
}

handlePage();