#SQL Alchemy and SQL Lite
from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_login import UserMixin
from flask import render_template
from werkzeug.security import generate_password_hash, check_password_hash

from . import create_app
app = create_app()
socketio = SocketIO(app)

from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

if __name__ == '__main__':
    socketio.run(app,port=5555, debug=True)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True)
    password_hash = db.Column(db.Text)
    email = db.Column(db.String(64), unqiue=True)
    collection = db.Column(db.Integer, unqiue=True)

    def __init__(self, email, username, password):
        self.email = email
        self.username = username
        self.password_hash = generate_password_hash(password)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Collection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    collection_title = db.Column(db.String(64))

    def __init__(self, title):
        self.title = title


class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    collection_id = db.Column(db.Integer, db.ForeignKey('collection.id'))

class Media(Entry):

    def __init__(self, title, tv_film, genre, rating, link):
        self.title = title
        self.tv_film = tv_film #can be a boolean i.e. 0=tv 1=movie
        self.genre = genre #from what I have seen this is a large list of booleans
        self.rating = rating
        self.link = link #IMDb link

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(userid):
    return User.query.get(userid)

with app.app_context():
    db.create_all()