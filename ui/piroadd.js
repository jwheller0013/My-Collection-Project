const API_URL = `http://localhost:8080`;

function doPostOfForm(event) {
  //event.preventDefault();
  var floozy = new FormData(document.getElementById('addpiroform'));

  var object = {};
  for (var p of floozy) {
    let name = p[0];
    let value = p[1];
    object[name] = value;
  }
  object['created'] = Date.now().toString();
  console.log('object is ', object);
  var json = JSON.stringify(object);
  // only need to stringify once
  postJSON(json);
}

async function postJSON(data) {
  try {
    const response = await fetch(`${API_URL}/api/piros`, {
      method: 'POST', // or 'PUT'
      headers: {
        accept: '*/*',
        'Content-Type': 'application/json',
      },
      body: data, // This was ALSO Stringifying the data
      // body: JSON.stringify(data)
      // but this is already a string because I did the stringify above
    });

    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

window.addEventListener(
  'DOMContentLoaded',
  function () {
    const form = document.getElementById('addpiroform');
    const button1 = document.getElementById('button1');
    console.log('form is ', form, 'button1 is ', button1, 'doPostOfForm is ', doPostOfForm);

    form.addEventListener(button1, doPostOfForm);
  },
  false,
);
