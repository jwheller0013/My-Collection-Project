from app import create_app
from models import Media, db, Genre

app = create_app()

def add_entries():
    entries_to_add = [
        {"id": 2, "user_id": 1, "collection_id": 1, "title": "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
         "tv_film": 1, "rating": 8.118, "link": "https://www.imdb.com/title/tt0057012", "poster": "https://image.tmdb.org/t/p/original/6x7MzQ6BOMlRzam1StcmPO9v61g.jpg",
         "upc": "43396061873", "genres": [35, 10752], "type": 'media'},
        {"id": 3, "user_id": 1, "collection_id": 1,
         "title": "Seven Samurai",
         "tv_film": 1, "rating": 8.457, "link": "https://www.imdb.com/title/tt0047478",
         "poster": "https://image.tmdb.org/t/p/original/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg",
         "upc": "715515019927", "genres": [28, 18], "type": 'media'},
        {"id": 4, "user_id": 1, "collection_id": 1,
         "title": "The Usual Suspects",
         "tv_film": 1, "rating": 8.176, "link": "https://www.imdb.com/title/tt0114814",
         "poster": "https://image.tmdb.org/t/p/original/rWbsxdwF9qQzpTPCLmDfVnVqTK1.jpg",
         "upc": "27616780126", "genres": [18, 80, 53], "type": 'media'},
        {"id": 5, "user_id": 1, "collection_id": 1,
         "title": "Thank you for Smoking",
         "tv_film": 1, "rating": 7.193, "link": "https://www.imdb.com/title/tt0427944",
         "poster": "https://image.tmdb.org/t/p/original/cJpeM7U36diFinieBWNLVi0FlQz.jpg",
         "upc": "24543255048", "genres": [35, 18], "type": 'media'},
        {"id": 6, "user_id": 1, "collection_id": 1,
         "title": "Oldboy",
         "tv_film": 1, "rating": 8.25, "link": "https://www.imdb.com/title/tt0364569",
         "poster": "https://image.tmdb.org/t/p/original/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg",
         "upc": "842498030042", "genres": [18, 53, 9648, 28], "type": 'media'},
        ]

    for entry_data in entries_to_add:
        existing_entry = Media.query.get(entry_data["id"])
        if not existing_entry:
            new_entry = Media(
                user_id=entry_data["user_id"],
                collection_id=entry_data["collection_id"],
                title=entry_data["title"],
                tv_film=entry_data["tv_film"],
                rating=entry_data["rating"],
                link=entry_data["link"],
                poster=entry_data["poster"],
                upc=entry_data["upc"]
            )
            db.session.add(new_entry)

            if "genres" in entry_data:
                genres_to_associate = Genre.query.filter(Genre.id.in_(entry_data["genres"])).all()
                for genre in genres_to_associate:
                    if genre not in new_entry.genres:
                        new_entry.genres.append(genre)
                db.session.commit()

    db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        add_entries()
        print("Entries added to the database.")