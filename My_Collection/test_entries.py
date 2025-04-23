from app import create_app
from models import Media, db, Genre

app = create_app()

def add_entries():
    entries_to_add = [
        {"id": 2, "user_id": 1, "collection_id": 1, "title": "Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb",
         "tv_film": 1, "rating": 8.118, "link": "https://www.imdb.com/title/tt0057012", "poster": "https://image.tmdb.org/t/p/original/6x7MzQ6BOMlRzam1StcmPO9v61g.jpg",
         "upc": "43396061873", "genres": [35, 10752]}
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
            db.session.commit()
            if "genres" in entry_data:
                genres_to_associate = Genre.query.filter(Genre.id.in_(entry_data["genres"])).all()
                for genre in genres_to_associate:
                    if genre not in new_entry.genres:
                        new_entry.genres.append(genre)
                db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        add_entries()
        print("Entries added to the database.")