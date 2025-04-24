const API_URL = `http://localhost:8080`;

function fetchPiro(piroid) {
  fetch(`${API_URL}/api/piros/${piroid}`)
    .then(res => {
      //console.log("res is ", Object.prototype.toString.call(res));
      return res.json();
    })
    .then(data => {
      showPiroDetail(data);
    })
    .catch(error => {
      console.log(`Error Fetching data : ${error}`);
      document.getElementById('posts').innerHTML = 'Error Loading Single Piro Data';
    });
}

function parsePiroId() {
  try {
    var url_string = window.location.href.toLowerCase();
    var url = new URL(url_string);
    var piroid = url.searchParams.get('piroid');
    return piroid;
  } catch (err) {
    console.log("Issues with Parsing URL Parameter's - " + err);
    return '0';
  }
}
// takes a UNIX integer date, and produces a prettier human string
function dateOf(date) {
  const milliseconds = date * 1000; // 1575909015000
  const dateObject = new Date(milliseconds);
  const humanDateFormat = dateObject.toLocaleString(); //2019-12-9 10:30:15
  return humanDateFormat;
}

function showPiroDetail(post) {
  // the data parameter will be a JS array of JS objects
  // this uses a combination of "HTML building" DOM methods (the document createElements) and
  // simple string interpolation (see the 'a' tag on title)
  // both are valid ways of building the html.
  const ul = document.getElementById('post');
  const detail = document.createDocumentFragment();

  console.log('Piro:', post);
  let li = document.createElement('div');
  let title = document.createElement('h2');
  let body = document.createElement('p');
  let by = document.createElement('p');
  let img = document.createElement('p');
  title.innerHTML = `${post.title}`;
  body.innerHTML = `${post.description}`;
  img.innerHTML = `<img src="http://localhost:8080/api/piros/${post.id}/image" alt="image" width="300" height="300">`;
  by.innerHTML = `${post.created} - ${post.id}`;
// http://localhost:8080/api/piros/5/image
  li.appendChild(title);
  li.appendChild(body);
  li.appendChild(img);
  li.appendChild(by);
  detail.appendChild(li);

  ul.appendChild(detail);
}

function handlePage() {
  let piroid = parsePiroId();
  console.log('piroId: ', piroid);

  if (piroid != null) {
    console.log('found a piroId');
    fetchPiro(piroid);
  }
}

handlePage();
