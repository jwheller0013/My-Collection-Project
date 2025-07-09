from app import create_app
from models import Collection, db

app = create_app()


def add_collections():
    collections_to_add = [
        {"id": 1, "user_id": 1, "collection_title": "Movies", "collection_type": "media"}
    ]

    for collection_data in collections_to_add:
        existing_collection = Collection.query.get(collection_data["id"])  # Use get() by ID
        if not existing_collection:
            new_collections = Collection(id=collection_data["id"], user_id=collection_data["user_id"], collection_title=collection_data["collection_title"],
                                         collection_type=collection_data["collection_type"])
            db.session.add(new_collections)
    db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        add_collections()