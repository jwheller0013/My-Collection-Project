const API_URL = `http://localhost:8080`;

// uses FETCH web api
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
//
function fetchTicketsData() {
  fetch(`${API_URL}/api/tickets`)
    .then(res => {
      //console.log("res is ", Object.prototype.toString.call(res));
      return res.json();
    })
    .then(data => {
      showTicketList(data);
    })
    .catch(error => {
      console.log(`Error Fetching data : ${error}`);
      document.getElementById('posts').innerHTML = 'Error Loading Tickets Data';
    });
}

// takes a UNIX integer date, and produces a prettier human string
function dateOf(date) {
  const milliseconds = date * 1000; // 1575909015000
  const dateObject = new Date(milliseconds);
  const humanDateFormat = dateObject.toLocaleString(); //2019-12-9 10:30:15
  return humanDateFormat;
}

function showTicketList(data) {
  // the data parameter will be a JS array of JS objects
  // this uses a combination of "HTML building" DOM methods (the document createElements) and
  // simple string interpolation (see the 'a' tag on title)
  // both are valid ways of building the html.
  const posts = document.getElementById('posts');
  const list = document.createDocumentFragment();

  data.map(function (post) {
    let div = document.createElement('div');
    let title = document.createElement('h3');
    title.innerHTML = `<a href="/ticketdetail.html?ticketid=${post.id}">${post.title}</a>`;

    div.appendChild(title);
    list.appendChild(div);
  });

  posts.appendChild(list);
}

function handlePage() {
  console.log('load all tickets');
  fetchTicketsData();
}

handlePage();
