from flask import render_template, session
from flask_login import LoginManager
from My_Collection.models import db, User
from flask_socketio import SocketIO

from My_Collection import create_app
app = create_app()
socketio = SocketIO(app)


app.config['SITE_NAME'] = 'Something, Anything, that is not that'
app.config['SITE_DESCRIPTION'] = 'a forum for Data to learn from'
app.config['FLASK_DEBUG'] = 1

if __name__ == '__main__':
    socketio.run(app,port=5555, debug=True)

login_manager = LoginManager()
login_manager.init_app(app)
@login_manager.user_loader
def load_user(userid):
    return User.query.get(int(userid))

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template("Home.html")