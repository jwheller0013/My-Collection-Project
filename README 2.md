# piro360vjs
a simple vanillaJS piro360 frontend

## FOCUS On

>>>>> `rest.py` and `models.py`

to run the front end with a very simple web server,

at a shell, `run-piro.sh`

the shell script launches a very simple local python webserver to serve up the pages of
the UI.
`python3 -m http.server 9000`

Go to `http://localhost:9000` (which should load `index.html`)

This UI looks for piro360 REST server on `localhost:8080` and currently works (mostly) with 
both the Java Spring server (https://github.com/kristofer/piro360j) and the Python3 FastAPI server (https://github.com/kristofer/piro360b).