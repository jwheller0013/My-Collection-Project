from app import create_app
from models import Genre, db

app = create_app()

def add_genres():
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
    for genre_data in genres_to_add:
        existing_genre = Genre.query.get(genre_data["id"])  # Use get() by ID
        if not existing_genre:
            new_genre = Genre(id=genre_data["id"], name=genre_data["name"])  # Set the ID
            db.session.add(new_genre)
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        add_genres()
        print("Genres added to the database.")