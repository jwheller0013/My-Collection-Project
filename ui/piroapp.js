const API_URL = `http://localhost:8080`;

function fetchData() {
  fetch(`${API_URL}/api/piros/`)
    .then(res => {
      //let resstr = res.json();
      //console.log("res is ", resstr);
      return res.json();
    })
    .then(data => {
      show(data);
    })
    .catch(error => {
      errm = `Error Fetching data : ${error}`
      console.log(errm);
      document.getElementById('posts').innerHTML = errm;
    });
}

// takes a UNIX integer date, and produces a prettier human string
function dateOf(date) {
  const milliseconds = date * 1000; // 1575909015000
  const dateObject = new Date(milliseconds);
  const humanDateFormat = dateObject.toLocaleString(); //2019-12-9 10:30:15
  return humanDateFormat;
}

function show(data) {
  // the data parameter will be a JS array of JS objects
  // this uses a combination of "HTML building" DOM methods (the document createElements) and
  // simple string interpolation (see the 'a' tag on title)
  // both are valid ways of building the html.
  const ul = document.getElementById('posts');
  const list = document.createDocumentFragment();
  //console.log('Data:', data);

  data.map(function (post) {
    console.log('Piro:', post);
    let li = document.createElement('li');
    let title = document.createElement('h3');
    let body = document.createElement('p');
    let by = document.createElement('p');
    title.innerHTML = `<a href="/ui/pirodetail.html?piroid=${post.id}">${post.title}</a>`;
    body.innerHTML = `${post.description}`;
    by.innerHTML = `${post.created} - ${post.key}`;

    li.appendChild(title);
    li.appendChild(body);
    li.appendChild(by);
    list.appendChild(li);
  });

  ul.appendChild(list);
}

fetchData();
