from flask import Flask
from models import db, User, Collection, Entry, Media, Genre, Videogame, Book
from os import path
from routes import init_routes, init_ai_routes
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize the extension with the app
    db.init_app(app)

    # CORS configuration
    CORS(app, resources={r"/*": {"origins": ["http://localhost:8080", "http://localhost:9000"]}})

    # Create database if it doesn't exist and add initial genres
    if not path.exists('database.db'):
        with app.app_context():
            print("Creating database tables...")
            db.create_all()
            print("Database tables created.")
            add_initial_genres(app) # Pass app to ensure context
            add_initial_users(app)  # Add initial users when creating db

    # Register all routes
    init_routes(app, db, User, Collection, Entry, Media, Genre, Videogame, Book)
    init_ai_routes(app, db, User, Collection, Media, Book, Videogame, Entry)


    return app

def add_initial_genres(app):
    """
    Adds initial genres to the database if they don't already exist.
    """
    genres_to_add = [
        {"id": 28, "name": "Action"},
        {"id": 12, "name": "Adventure"},
        {"id": 16, "name": "Animation"},
        {"id": 35, "name": "Comedy"},
        {"id": 80, "name": "Crime"},
        {"id": 99, "name": "Documentary"},
        {"id": 18, "name": "Drama"},
        {"id": 10751, "name": "Family"},
        {"id": 14, "name": "Fantasy"},
        {"id": 36, "name": "History"},
        {"id": 27, "name": "Horror"},
        {"id": 10402, "name": "Music"},
        {"id": 9648, "name": "Mystery"},
        {"id": 10749, "name": "Romance"},
        {"id": 878, "name": "Science Fiction"},
        {"id": 10770, "name": "TV Movie"},
        {"id": 53, "name": "Thriller"},
        {"id": 10752, "name": "War"},
        {"id": 37, "name": "Western"},
        {"id": 10759, "name": "Action & Adventure"},
        {"id": 10762, "name": "Kids"},
        {"id": 10763, "name": "News"},
        {"id": 10764, "name": "Reality"},
        {"id": 10765, "name": "Sci-Fi & Fantasy"},
        {"id": 10766, "name": "Soap"},
        {"id": 10767, "name": "Talk"},
        {"id": 10768, "name": "War & Politics"},
    ]
    with app.app_context(): # Ensure we are in the app context for DB operations
        for genre_data in genres_to_add:
            # Check if genre exists by ID. If not, add it.
            existing_genre = db.session.get(Genre, genre_data["id"])
            if not existing_genre:
                new_genre = Genre(id=genre_data["id"], name=genre_data["name"])
                db.session.add(new_genre)
        try:
            db.session.commit()
            print("Genres checked and added/updated if needed.")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding genres: {e}")

def add_initial_users(app):
    """
    Adds initial users to the database if they don't already exist.
    """
    users_to_add = [
        {"id": 1, "username": "tester", "password": "test", "email": "test@test.com"}
    ]

    with app.app_context():
        for user_data in users_to_add:
            existing_user = db.session.get(User, user_data["id"])
            if not existing_user:
                new_user = User(
                    id=user_data["id"],
                    username=user_data["username"],
                    password=user_data["password"], # IMPORTANT: Hash passwords in real apps!
                    email=user_data["email"]
                )
                db.session.add(new_user)
        try:
            db.session.commit()
            # print("Users checked and added if needed.") # Commented to combine print
        except Exception as e:
            db.session.rollback()
            print(f"Error adding users: {e}")

if __name__ == '__main__':
    app = create_app()
    app.run(port= 8080, debug=True)