import random

import requests
import json
from flask import request, jsonify, send_from_directory, render_template
from models import db, User, Collection, Entry, Media, Genre, Videogame, Book
from tmdb_api import search_movie, get_movie_details, get_imdb_link_from_movie_id
from sqlalchemy.orm import joinedload, aliased
from sqlalchemy.sql import func
import os


def init_routes(app):
    @app.route('/hi', methods=['GET'])
    def hi():
        return "Hello, World!"

    @app.route('/')
    def index():
        # Serve index.html from parent directory
        return send_from_directory('..', 'index.html')

    @app.route('/<path:filename>')
    def serve_static_files(filename):
        import os

        # First check if file exists in parent directory (root)
        parent_file = os.path.join('..', filename)
        if os.path.exists(parent_file) and os.path.isfile(parent_file):
            return send_from_directory('..', filename)

        # Then check current directory (My_Collection)
        current_file = os.path.join('.', filename)
        if os.path.exists(current_file) and os.path.isfile(current_file):
            return send_from_directory('.', filename)

        # File not found
        return "File not found", 404

    @app.route('/api/home')
    def get_home_data():
        is_authenticated = True  # Replace with auth check eventually
        response_data = {'isAuthenticated': is_authenticated}
        return jsonify(response_data)

    @app.route('/users', methods=['GET'])
    def get_users():
        users = User.query.all()
        return jsonify([user.to_dict() for user in users])

    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        user = User.query.get_or_404(user_id)
        return jsonify(user.to_dict())

    @app.route('/users', methods=['POST'])
    def create_user():
        data = request.get_json()
        print("data received:", data)
        new_user = User(username=data['username'], email=data['email'])
        db.session.add(new_user)
        db.session.commit()
        return jsonify(new_user.to_dict()), 201

    @app.route('/users/<int:user_id>', methods=['PUT'])
    def update_user(user_id):
        user = User.query.get_or_404(user_id)
        data = request.get_json()

        if 'username' in data:
            user.username = data['username']
        if 'email' in data:
            user.email = data['email']

        db.session.commit()
        return jsonify(user.to_dict())

    @app.route('/users/<int:user_id>', methods=['DELETE'])
    def delete_user(user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return '', 204

    @app.route('/collections', methods=['GET'])
    def get_collections():
        collection = Collection.query.all()
        return jsonify([collection.to_dict() for collection in collection])

    @app.route('/collections/<int:collection_id>', methods=['GET'])
    def get_collection(collection_id):
        collection = Collection.query.get_or_404(collection_id)
        entries = Entry.query.filter_by(collection_id=collection.id).all()
        return jsonify([entry.to_dict() for entry in entries])

    @app.route('/entries', methods=['GET'])
    def get_entries():
        # Query all types of entries
        media_entries = Media.query.all()
        videogame_entries = Videogame.query.all()
        book_entries = Book.query.all()
        general_entries = Entry.query.all()

        # Combine all entries into one list
        all_entries = media_entries + videogame_entries + book_entries + general_entries

        # Return them as JSON
        return jsonify([entry.to_dict() for entry in all_entries])

    @app.route('/entries/<int:entry_id>', methods=['GET', 'PUT', 'DELETE'])
    def entry_detail(entry_id):
        from sqlalchemy.orm import joinedload

        entry = Entry.query.options(joinedload(Entry.genres)).filter_by(id=entry_id).first()
        if not entry:
            return jsonify({"msg": "Entry not found"}), 404

        if request.method == 'GET':
            return jsonify(entry.to_dict())

        elif request.method == 'PUT':
            data = request.get_json()

            # Update common fields
            entry.title = data.get('title', entry.title)
            entry.overview = data.get('overview', entry.overview)
            entry.poster = data.get('poster', entry.poster)

            # Handle genres
            if 'genres' in data:
                new_genre_ids = set(data['genres'])
                current_genre_ids = {genre.id for genre in entry.genres}

                # Remove genres no longer selected
                for genre in list(entry.genres): # Iterate over a copy to modify
                    if genre.id not in new_genre_ids:
                        entry.genres.remove(genre)

                # Add newly selected genres
                for genre_id in new_genre_ids:
                    if genre_id not in current_genre_ids:
                        genre = Genre.query.get(genre_id)
                        if genre:
                            entry.genres.append(genre)

            # Handle type-specific fields
            if entry.type == 'media' and isinstance(entry, Media):
                entry.rating = data.get('rating', entry.rating)
                entry.link = data.get('link', entry.link)
            elif entry.type == 'book' and isinstance(entry, Book):
                entry.author = data.get('author', entry.author)
                entry.is_read = data.get('is_read', entry.is_read)
            # No specific fields to handle for 'videogame' beyond the common ones,
            # but you could add an elif for 'videogame' if you had unique fields later.

            try:
                db.session.commit()
                return jsonify(entry.to_dict()), 200
            except Exception as e:
                db.session.rollback()
                print(f"Error updating entry {entry_id}: {e}") # Debugging
                return jsonify({"msg": "Failed to update entry", "error": str(e)}), 500

        elif request.method == 'DELETE':
            try:
                db.session.delete(entry)
                db.session.commit()
                return jsonify({"msg": "Entry deleted successfully"}), 200
            except Exception as e:
                db.session.rollback()
                print(f"Error deleting entry {entry_id}: {e}") # Debugging
                return jsonify({"msg": "Failed to delete entry", "error": str(e)}), 500


    @app.route('/genres', methods=['GET'])
    def get_genres():
        genres = Genre.query.all()
        return jsonify([genre.to_dict() for genre in genres])

    @app.route('/genres/<int:genre_id>', methods=['GET'])
    def get_genre(genre_id):
        genre = Genre.query.get_or_404(genre_id)
        return jsonify(genre.to_dict())

    @app.route('/collection_detail.html')
    def serve_collection_detail_page():
        return send_from_directory('.', 'collection_detail.html')

    @app.route('/collections/<int:collection_id>/detail')
    def collection_detail_page(collection_id): # Renamed to avoid conflict with `get_collection`
        return render_template('collection_detail.html', collection_id=collection_id)

    @app.route('/entry_detail.html')
    def serve_entry_detail_page():
        return send_from_directory('.', 'entry_detail.html')

    @app.route('/api/random_entry')
    def get_random_entry():
        user_id = 1  # placeholder will need to add a means to check userid
        random_entry = Entry.query.filter_by(user_id=user_id).order_by(func.random()).first()
        if random_entry:
            return jsonify({'entry_id': random_entry.id})
        else:
            return jsonify({'error': 'No entries found for this user'}), 404

    @app.route('/api/random_entry_from_collection', methods=['GET'])
    def get_random_entry_from_collection():
        collection_id = request.args.get('collection_id')  # Get collection_id from query parameters
        user_id = 1  # Placeholder for current user

        if not collection_id:
            return jsonify({"error": "Collection ID is required"}), 400

        try:
            collection_id = int(collection_id)
        except ValueError:
            return jsonify({"error": "Invalid Collection ID"}), 400

        # Query for a random entry specifically within that collection
        random_entry = Entry.query.filter_by(
            collection_id=collection_id,
            user_id=user_id  # Filter by user_id even if filtering by collection_id
        ).order_by(func.random()).first()

        if random_entry:
            return jsonify({"entry_id": random_entry.id}), 200
        else:
            return jsonify({"error": "No entries found in this collection"}), 404

    @app.route('/scanner.html')
    def scanner_page():
        return send_from_directory('.', 'scanner.html')

    @app.route('/scanner_results.html')
    def scanner_results_page():
        return send_from_directory('.', 'scanner_results.html')

    @app.route('/collections/<int:collection_id>/sort')
    def sort_collection(collection_id):
        from sqlalchemy.orm import joinedload

        sort_by = request.args.get('sort', 'alpha')

        collection = Collection.query.get_or_404(collection_id)
        entry_type = collection.collection_type  # e.g., 'media', 'videogames', etc.

        # Determine the appropriate model
        if entry_type == 'media':
            query = db.session.query(Media).options(joinedload(Media.genres)).filter_by(collection_id=collection.id)

            if sort_by == 'genre':
                genre_alias = aliased(Genre)
                query = query.outerjoin(Media.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Media.title.asc())
            else:
                query = query.order_by(Media.title.asc())

            entries = query.all()

        elif entry_type == 'videogames':
            entries = Videogame.query.options(joinedload(Videogame.genres)).filter_by(
                collection_id=collection.id).order_by(Videogame.title.asc()).all()

        elif entry_type == 'books':
            query = db.session.query(Book).options(joinedload(Book.genres)).filter_by(collection_id=collection.id)

            if sort_by == 'author':
                query = query.order_by(Book.author.asc(), Book.title.asc())
            elif sort_by == 'genre':
                genre_alias = aliased(Genre)
                query = query.outerjoin(Book.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Book.title.asc())
            else:
                query = query.order_by(Book.title.asc())

            entries = query.all()

        else:
            entries = Entry.query.options(joinedload(Entry.genres)).filter_by(collection_id=collection.id).order_by(
                Entry.title.asc()).all()

        # Annotate entries with type for frontend
        annotated_entries = [{**entry.to_dict(), 'type': entry_type} for entry in entries]

        return jsonify(annotated_entries)

    @app.route('/create_collection.html')
    def create_collection_page():
        return send_from_directory('.', 'create_collection.html')

    @app.route('/api/collections', methods=['POST'])
    def create_collection():
        # user_id = get_current_user_id() # Get the ID user currently lacking a get current user set up
        user_id = 1
        if not user_id:
            return jsonify({"msg": "User not authenticated"}), 401

        data = request.get_json()
        title = data.get('collection_title')
        collection_type = data.get('collection_type', 'general') # Get type, default to 'general' if not provided

        if not title:
            return jsonify({"msg": "Collection title is required"}), 400

        new_collection = Collection(
            collection_title=title,
            collection_type=collection_type,
            user_id=user_id
        )

        db.session.add(new_collection)
        db.session.commit()

        return jsonify({"msg": "Collection created successfully", "collection_id": new_collection.id}), 201

    @app.route('/collections/<int:collection_id>', methods=['DELETE'])
    def delete_collection(collection_id):

        collection = Collection.query.get_or_404(collection_id)

        # Before deleting the collection, delete all associated entries
        Entry.query.filter_by(collection_id=collection.id).delete()

        db.session.delete(collection)
        db.session.commit()
        return jsonify({"msg": "Collection and its entries deleted successfully"}), 204

    @app.route('/entries', methods=['POST'])
    def create_entry():
        data = request.get_json()
        collection_id = data.get('collection_id')
        user_id = 1  # Placeholder for current user

        if not collection_id:
            return jsonify({"msg": "Collection ID is required"}), 400

        collection = Collection.query.get_or_404(collection_id)
        entry_type = collection.collection_type

        # Parse genre names from comma-separated string
        genre_names = [g.strip() for g in data.get('genre', '').split(',') if g.strip()]
        genres = []

        for name in genre_names:
            genre = Genre.query.filter_by(name=name).first()
            if not genre:
                genre = Genre(name=name)
                db.session.add(genre)
            genres.append(genre)

        if entry_type == 'media':
            title = data.get('title')
            tv_film = data.get('tv_film')
            rating = data.get('rating')
            link = data.get('link')
            poster = data.get('poster')
            upc = data.get('upc')
            overview = data.get('overview')

            if not title:
                return jsonify({"msg": "Title is required for media entries"}), 400

            if upc == "":
                upc = None

            new_entry = Media(
                title=title,
                tv_film=tv_film,
                rating=rating,
                link=link,
                poster=poster,
                upc=upc,
                overview=overview,
                user_id=user_id,
                collection_id=collection_id,
            )

        elif entry_type == 'videogames':
            title = data.get('title')
            poster = data.get('poster')
            upc = data.get('upc')
            overview = data.get('overview')

            if not title:
                return jsonify({"msg": "Title is required for videogame entries"}), 400

            if upc == "":
                upc = None

            new_entry = Videogame(
                title=title,
                poster=poster,
                upc=upc,
                overview=overview,
                user_id=user_id,
                collection_id=collection_id,
            )

        elif entry_type == 'books':
            title = data.get('title')
            author = data.get('author')
            is_read = data.get('is_read', False)
            poster = data.get('poster')
            upc = data.get('upc')
            overview = data.get('overview')

            if not title:
                return jsonify({"msg": "Title is required for book entries"}), 400

            if not author:
                return jsonify({"msg": "Author is required for book entries"}), 400

            if upc == "":
                upc = None

            new_entry = Book(
                title=title,
                author=author,
                is_read=is_read,
                poster=poster,
                upc=upc,
                overview=overview,
                user_id=user_id,
                collection_id=collection_id,
            )

        elif entry_type == 'general':
            new_entry = Entry(
                title=data.get('title'),
                overview=data.get('overview'),
                upc=data.get('upc'),
                poster=data.get('poster'),
                user_id=user_id,
                collection_id=collection_id,
            )

        else:
            return jsonify({"msg": f"Invalid entry type: {entry_type}"}), 400

        # Attach genres
        new_entry.genres.extend(genres)

        db.session.add(new_entry)
        db.session.commit()
        return jsonify({"msg": "Entry created successfully", "entry_id": new_entry.id}), 201


    # API TMDB
    @app.route('/api/tmdb_import', methods=['POST'])
    def import_movie_from_tmdb():
        data = request.get_json()
        title = data.get('title')
        collection_id = data.get('collection_id')
        user_id = 1  # Update later to fetch dynamically based on authenticated user

        if not title or not collection_id:
            return jsonify({"msg": "Title and collection ID are required"}), 400

        tmdb_result = search_movie(title)
        if not tmdb_result:
            return jsonify({"msg": f"No movie found with title '{title}'"}), 404

        movie_id = tmdb_result['id']
        details = get_movie_details(movie_id)

        # Get or create genre entries
        genre_objs = []
        for genre in details.get('Genres', []):
            # Try to fetch the genre, if not found, create it
            genre_obj = Genre.query.filter_by(name=genre['name']).first()
            if not genre_obj:
                genre_obj = Genre(name=genre['name'])
                db.session.add(genre_obj)
            genre_objs.append(genre_obj)

        # Create the new media entry (movie)
        new_media = Media(
            title=details.get('title'),
            tv_film=True,  # it's a movie
            rating=details.get('vote_average'),
            link=f"https://www.imdb.com/title/{details.get('imdb_id')}" if details.get('imdb_id') else "",
            poster=f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}" if details.get('poster_path') else "",
            upc=None,
            overview=details.get('overview'),
            user_id=user_id,  # Replace later with the actual authenticated user's ID
            collection_id=collection_id,
        )

        # Associate genres with the new media entry
        for genre in genre_objs:
            new_media.genres.append(genre)

        db.session.add(new_media)
        db.session.commit()

        # Extract genre names to return in the response
        genre_names = [genre.name for genre in genre_objs]

        # Return success message along with the created entry's ID and genres
        return jsonify({
            "msg": "Movie imported successfully",
            "entry_id": new_media.id,
            "genres": genre_names
        }), 201

    @app.route('/api/tmdb_import_preview', methods=['POST'])
    def preview_tmdb_movie():
        data = request.get_json()
        title = data.get('title')

        if not title:
            return jsonify({"msg": "Title is required"}), 400

        tmdb_result = search_movie(title)
        if not tmdb_result:
            return jsonify({"msg": f"No movie found with title '{title}'"}), 404

        movie_id = tmdb_result['id']
        details = get_movie_details(movie_id)

        return jsonify({
            'title': details.get('title'),
            'rating': details.get('vote_average'),
            'link': f"https://www.imdb.com/title/{details.get('imdb_id')}" if details.get('imdb_id') else "",
            'poster': f"https://image.tmdb.org/t/p/w500{details.get('poster_path')}" if details.get(
                'poster_path') else "",
            'overview': details.get('overview')
        }), 200

    # API UPC
    @app.route('/api/upc_lookup', methods=['POST'])
    def lookup_upc():
        data = request.get_json()
        upc = data.get('upc')
        print(f"Received UPC: {upc}")

        if not upc:
            return jsonify({"msg": "UPC is required"}), 400

        try:
            response = requests.get(
                f"https://api.upcitemdb.com/prod/trial/lookup?upc={upc}",
                headers={"Accept-Encoding": "gzip"}
            )
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"UPC API request failed: {e}")
            return jsonify({"msg": "UPC lookup failed", "error": str(e)}), 500

        items = response.json().get('items', [])
        print(f"UPC items: {items}")
        if not items:
            return jsonify({"msg": "No item found for this UPC"}), 404

        item = items[0]
        title = item.get('title')
        description = item.get('description')
        images = item.get('images', [])
        category = item.get('category', '').lower()

        print(f"Category: {category}")

        # Determine if the item is a movie or TV show
        is_film = any(keyword in category for keyword in ['dvd', 'blu-ray', 'movie', 'television', 'tv'])

        # Check if it's a book
        is_book = any(keyword in category for keyword in ['book', 'books', 'novel', 'paperback', 'hardcover'])

        if is_film:
            try:
                movie = search_movie(title)  # Search for movie on TMDB
                print(f"TMDB result: {movie}")
            except requests.RequestException as e:
                return jsonify({"msg": "TMDB lookup failed", "error": str(e)}), 500

            if not movie:
                return jsonify({
                    "msg": "No matching movie found on TMDB",
                    "title": title
                }), 200

            try:
                details = get_movie_details(movie['id'])  # Get detailed movie info from TMDB
                print(f"TMDB movie details: {details}")

                genres = details.get('genres', [])
                if not genres:
                    print("No genres found for this movie")
                    genre_names = ['Unknown']  # Fallback if no genres are found
                else:
                    genre_names = [genre['name'] for genre in genres]

                print(f"Genres: {genre_names}")

            except requests.RequestException as e:
                return jsonify({"msg": "Failed to fetch movie details", "error": str(e)}), 500

            return jsonify({
                "title": movie.get("title"),
                "overview": movie.get("overview"),
                "rating": movie.get("vote_average"),
                "poster": f"https://image.tmdb.org/t/p/w500{movie.get('poster_path')}" if movie.get(
                    'poster_path') else None,
                "link": f"https://www.imdb.com/title/{details.get('imdb_id')}" if details.get('imdb_id') else "",
                "tv_film": 1,  # Movie
                "upc": upc,
                "genres": [{"name": genre_name} for genre_name in genre_names]
            }), 200

        elif is_book:
            # For books, we'll try to extract author from the title or description
            # This is a basic implementation - you might want to integrate with a book API
            author = "Unknown Author"  # Default fallback

            # Try to extract author from title (common format: "Title by Author")
            if " by " in title:
                parts = title.split(" by ")
                if len(parts) >= 2:
                    title = parts[0].strip()
                    author = parts[1].strip()

            return jsonify({
                "title": title,
                "author": author,
                "overview": description,
                "poster": images[0] if images else None,
                "upc": upc,
                "is_read": False,
                "type": "book"
            }), 200

        # Non-movie/non-book fallback (videogame or general item)
        return jsonify({
            "title": title,
            "overview": description,
            "poster": images[0] if images else None,
            "upc": upc
        }), 200

    @app.route('/api/get_movie_imdb_link', methods=['GET'])
    def get_imdb_link():
        title = request.args.get('title')
        if not title:
            return jsonify({"error": "Title is required"}), 400

        # First, search for the movie by title
        movie = search_movie(title)
        if not movie:
            return jsonify({"error": "Movie not found"}), 404

        # Get the IMDb link from the movie ID
        imdb_link = get_imdb_link_from_movie_id(movie['id'])
        if imdb_link:
            return jsonify({"imdb_link": imdb_link})

        return jsonify({"error": "IMDb link not found"}), 404

    @app.route('/collections/<int:collection_id>/entries')
    def get_collection_entries(collection_id):
        from sqlalchemy.orm import joinedload

        sort = request.args.get('sort', 'alpha')  # default to alphabetical

        collection = Collection.query.get_or_404(collection_id)
        entry_type = collection.collection_type  # Dynamically determine type from collection
        genre_alias = aliased(Genre)

        if entry_type == 'media':
            query = db.session.query(Media).options(joinedload(Media.genres)).filter_by(collection_id=collection.id)

            if sort == 'genre':
                query = query.outerjoin(Media.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Media.title.asc())
            else:
                query = query.order_by(Media.title.asc())

            entries = query.all()

        elif entry_type == 'books':  # Add books support
            query = db.session.query(Book).options(joinedload(Book.genres)).filter_by(collection_id=collection.id)

            if sort == 'author':
                query = query.order_by(Book.author.asc(), Book.title.asc())
            elif sort == 'genre':
                query = query.outerjoin(Book.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Book.title.asc())
            else:
                query = query.order_by(Book.title.asc())

            entries = query.all()

        elif entry_type == 'videogames':
            entries = Videogame.query.options(joinedload(Videogame.genres)).filter_by(
                collection_id=collection.id).order_by(
                Videogame.title.asc()).all()

        else:  # default to general entries
            entries = Entry.query.options(joinedload(Entry.genres)).filter_by(collection_id=collection.id).order_by(
                Entry.title.asc()).all()

        return jsonify([entry.to_dict() for entry in entries])

    @app.route('/collections/<int:collection_id>/view')
    def view_collection_detail(collection_id):
        sort = request.args.get('sort', 'alpha')  # default to alphabetical

        collection = Collection.query.get_or_404(collection_id)
        entry_type = collection.collection_type
        genre_alias = aliased(Genre)

        if entry_type == 'media':
            query = db.session.query(Media).filter_by(collection_id=collection.id)

            if sort == 'genre':
                query = query.outerjoin(Media.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Media.title.asc())
            else:
                query = query.order_by(Media.title.asc())

            entries = query.all()

        elif entry_type == 'books':
            query = db.session.query(Book).filter_by(collection_id=collection.id)

            if sort == 'author':
                query = query.order_by(Book.author.asc(), Book.title.asc())
            elif sort == 'genre':
                query = query.outerjoin(Book.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Book.title.asc())
            else:
                query = query.order_by(Book.title.asc())

            entries = query.all()

        elif entry_type == 'videogames':
            entries = Videogame.query.filter_by(collection_id=collection.id).order_by(
                Videogame.title.asc()).all()

        else:
            entries = Entry.query.filter_by(collection_id=collection.id).order_by(
                Entry.title.asc()).all()

        return render_template(
            'collection_detail.html',
            collection=collection,
            entries=entries,
            entryType=entry_type
        )

    @app.route('/collections/<int:collection_id>/sort', methods=['GET'])
    def sort_collection_entries(collection_id):
        from sqlalchemy.orm import joinedload

        sort_by = request.args.get('sort_by', 'alphabetical')
        collection = Collection.query.get_or_404(collection_id)
        entry_type = collection.collection_type.lower()

        entries = []

        if entry_type == 'media':
            if sort_by == 'genre':
                genre_alias = aliased(Genre)
                entries = (
                    db.session.query(Media)
                    .options(joinedload(Media.genres))
                    .filter(Media.collection_id == collection_id)
                    .outerjoin(Media.genres.of_type(genre_alias))
                    .order_by(func.coalesce(genre_alias.name, ""), Media.title.asc())
                    .all()
                )
            else:
                entries = Media.query.options(joinedload(Media.genres)).filter_by(collection_id=collection_id).order_by(
                    Media.title.asc()).all()

        elif entry_type == 'books':
            query = db.session.query(Book).options(joinedload(Book.genres)).filter_by(collection_id=collection_id)

            if sort_by == 'author':
                query = query.order_by(Book.author.asc(), Book.title.asc())
            elif sort_by == 'genre':
                genre_alias = aliased(Genre)
                query = query.outerjoin(Book.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Book.title.asc())
            else:  # alphabetical by title
                query = query.order_by(Book.title.asc())

            entries = query.all()

        elif entry_type == 'videogames':
            entries = Videogame.query.options(joinedload(Videogame.genres)).filter_by(
                collection_id=collection_id).order_by(Videogame.title.asc()).all()

        else:
            # fallback for generic Entry class if used
            entries = Entry.query.options(joinedload(Entry.genres)).filter_by(collection_id=collection_id).order_by(
                Entry.title.asc()).all()

        # Add debug print
        for entry in entries:
            print(f"{entry.title} - Genres: {[g.name for g in getattr(entry, 'genres', [])]}")

        annotated_entries = [{**entry.to_dict(), 'type': entry_type} for entry in entries]
        return jsonify(annotated_entries)


###___AI___###
def init_ai_routes(app):
    @app.route('/ai_recommendations.html')
    def ai_recommendations_page():
        return send_from_directory('.', 'ai_recommendations.html')

    @app.route('/api/ai_recommendations', methods=['POST'])
    def get_ai_recommendations():
        data = request.get_json()
        collection_id = data.get('collection_id')
        user_id = 1  # Replace with actual user authentication

        if not collection_id:
            return jsonify({"error": "Collection ID is required"}), 400

        # Get user's API token (you'll need to add this to your User model)
        user = User.query.get(user_id)
        if not user or not hasattr(user, 'ai_token') or not user.ai_token:
            return jsonify({"error": "AI token not configured. Please add your OpenRouter API token in settings."}), 400

        # Get collection and its entries
        collection = Collection.query.get_or_404(collection_id)

        # Get entries based on collection type
        if collection.collection_type == 'media':
            entries = Media.query.filter_by(collection_id=collection_id).all()
        elif collection.collection_type == 'books':
            entries = Book.query.filter_by(collection_id=collection_id).all()
        elif collection.collection_type == 'videogames':
            entries = Videogame.query.filter_by(collection_id=collection_id).all()
        else:
            entries = Entry.query.filter_by(collection_id=collection_id).all()

        if not entries:
            return jsonify({"error": "No entries found in this collection"}), 404

        # Prepare collection data for AI analysis
        collection_data = []
        for entry in entries:
            entry_info = {
                'title': entry.title,
                'overview': entry.overview,
                'genres': [genre.name for genre in entry.genres] if entry.genres else []
            }

            # Add type-specific information
            if hasattr(entry, 'author'):
                entry_info['author'] = entry.author
            if hasattr(entry, 'rating'):
                entry_info['rating'] = float(entry.rating) if entry.rating else None
            if hasattr(entry, 'tv_film'):
                entry_info['type'] = 'movie' if entry.tv_film else 'tv_show'

            collection_data.append(entry_info)

        # Generate AI recommendations
        try:
            recommendations = generate_ai_recommendations(user.ai_token, collection_data, collection.collection_type)
            return jsonify({"recommendations": recommendations}), 200
        except Exception as e:
            return jsonify({"error": f"AI recommendation failed: {str(e)}"}), 500

    @app.route('/api/user/ai_token', methods=['POST'])
    def save_ai_token():
        """Endpoint to save user's AI token"""
        data = request.get_json()
        user_id = 1  # Replace with actual user authentication
        ai_token = data.get('ai_token')

        if not ai_token:
            return jsonify({"error": "AI token is required"}), 400

        user = User.query.get_or_404(user_id)
        user.ai_token = ai_token
        db.session.commit()

        return jsonify({"message": "AI token saved successfully"}), 200

    @app.route('/api/user/ai_token', methods=['GET'])
    def get_ai_token_status():
        """Check if user has AI token configured"""
        user_id = 1  # Replace with actual user authentication
        user = User.query.get_or_404(user_id)

        has_token = hasattr(user, 'ai_token') and user.ai_token is not None
        return jsonify({"has_token": has_token}), 200


def generate_ai_recommendations(api_token, collection_data, collection_type):
    """Generate AI recommendations using OpenRouter API"""

    # Create prompt based on collection type
    if collection_type == 'media':
        prompt = f"""
        Based on the following movie/TV collection, recommend 10 similar titles that the user might enjoy.
        For each recommendation, provide:
        1. Title
        2. Brief description (2-3 sentences)
        3. Why it matches their collection
        4. A review link (use IMDb, Rotten Tomatoes, or Metacritic)

        Collection: {json.dumps(collection_data, indent=2)}

        Please format the response as a JSON array with objects containing: title, description, reason, review_link
        """
    elif collection_type == 'books':
        prompt = f"""
        Based on the following book collection, recommend 10 similar books that the user might enjoy.
        For each recommendation, provide:
        1. Title
        2. Author
        3. Brief description (2-3 sentences)
        4. Why it matches their collection
        5. A review link (use Goodreads, Amazon, or literary review sites)

        Collection: {json.dumps(collection_data, indent=2)}

        Please format the response as a JSON array with objects containing: title, author, description, reason, review_link
        """
    elif collection_type == 'videogames':
        prompt = f"""
        Based on the following video game collection, recommend 10 similar games that the user might enjoy.
        For each recommendation, provide:
        1. Title
        2. Brief description (2-3 sentences)
        3. Why it matches their collection
        4. A review link (use Metacritic, IGN, or GameSpot)

        Collection: {json.dumps(collection_data, indent=2)}

        Please format the response as a JSON array with objects containing: title, description, reason, review_link
        """
    else:
        prompt = f"""
        Based on the following general collection, recommend 10 similar items that the user might enjoy.
        For each recommendation, provide:
        1. Title
        2. Brief description (2-3 sentences)
        3. Why it matches their collection
        4. A relevant review or information link

        Collection: {json.dumps(collection_data, indent=2)}

        Please format the response as a JSON array with objects containing: title, description, reason, review_link
        """

    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    payload = {
        'model': "deepseek/deepseek-r1:free",  # You can change this to other models
        'messages': [
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': 2000,
        'temperature': 0.7
    }

    response = requests.post('https://openrouter.ai/api/v1/chat/completions',
                             headers=headers, json=payload)

    if response.status_code != 200:
        raise Exception(f"OpenRouter API error: {response.status_code} - {response.text}")

    result = response.json()
    content = result['choices'][0]['message']['content']

    try:
        # Try to parse the JSON response
        recommendations = json.loads(content)
        return recommendations
    except json.JSONDecodeError:
        # If JSON parsing fails, return a formatted error
        raise Exception("AI response was not in valid JSON format")