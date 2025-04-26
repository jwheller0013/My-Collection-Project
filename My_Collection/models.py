#SQL Alchemy and SQL Lite
# from flask_login import UserMixin
# from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password = db.Column(db.Text)
    email = db.Column(db.String(64), unique=True, nullable=False)
    collection = db.relationship('Collection', backref='user', lazy=True)
    entries = db.relationship('Entry', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

    # def __init__(self, email, username, password):
    #     self.email = email
    #     self.username = username
    #     self.set_password(password) #generate_password_hash(password)

    # def set_password(self, password):
    #     self.password_hash = generate_password_hash(password)
    #
    # def check_password(self, password):
    #     return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'password': self.password,
            'collection': self.collection,
            'entries': self.entries

        }

class Collection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    collection_title = db.Column(db.String(64))
    entries = db.relationship('Entry', backref='collection', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.collection_title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'collection_title': self.collection_title,
            'entries': [self._serialize_entry(entry) for entry in self.entries]
        }

    def _serialize_entry(self, entry):
        print(f"Entry type in _serialize_entry: {type(entry)}")
        entry_dict = {
            'id': entry.id,
            'user_id': entry.user_id,
            'collection_id': entry.collection_id,
            'genres': [genre.name for genre in entry.genres]
            }
        if isinstance(entry, Media):
            entry_dict.update({
                'title': entry.title,
                'tv_film': entry.tv_film,
                'rating': entry.rating,
                'link': entry.link,
                'upc': entry.upc,
                'poster': entry.poster
            })
        return entry_dict

class Genre(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    entries = db.relationship('Entry', secondary='entry_genres', lazy='dynamic')

    def __repr__(self):
        return f'<Genre {self.name}>'

# Association Table for Many-to-Many Relationship between Entry and Genre
entry_genres = db.Table('entry_genres',
    db.Column('entry_id', db.Integer, db.ForeignKey('entry.id'), primary_key=True),
    db.Column('genre_id', db.Integer, db.ForeignKey('genre.id'), primary_key=True)
)


class Entry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    collection_id = db.Column(db.Integer, db.ForeignKey('collection.id'))
    genres = db.relationship('Genre', secondary='entry_genres', lazy='dynamic', overlaps="entries")
    type = db.Column(db.String(50))

    __mapper_args__ = {
        'polymorphic_identity': 'entry',
        'polymorphic_on': type
    }

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'collection_id': self.collection_id,
            'genres': [genre.name for genre in self.genres],
            'type': self.type
            # Add other common entry attributes if needed
        }

class Media(Entry):
    __mapper_args__ = {
        'polymorphic_identity': 'media',
    }
    title = db.Column(db.String(100))
    tv_film = db.Column(db.Boolean)
    rating = db.Column(db.Float)
    link = db.Column(db.String(255))
    poster = db.Column(db.String(255))
    upc = db.Column(db.String(20), unique=True, nullable=True)
    overview = db.Column(db.String(600))

    def __init__(self, title, tv_film, rating, link, poster, upc=None, user_id=None, collection_id=None, overview=None):
        super().__init__(user_id=user_id, collection_id=collection_id, type='media') # Call the __init__ of the parent class (Entry)
        self.title = title
        self.tv_film = tv_film #can be a boolean i.e. 0=tv 1=movie
        self.rating = rating
        self.link = link #IMDb link
        self.upc = upc
        self.poster = poster
        self.overview = overview

    def to_dict(self):
        base_dict = super().to_dict()
        return {
            **base_dict,
            'title': self.title,
            'tv_film': self.tv_film,
            'rating': self.rating,
            'link': self.link,
            'upc': self.upc,
            'poster': self.poster,
            'genres': [genre.name for genre in self.genres],
            'overview': self.overview
        }


