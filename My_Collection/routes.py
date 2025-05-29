import random

import requests
from flask import request, jsonify, send_from_directory, render_template
from models import db, User, Collection, Entry, Media, Genre, Videogame
from tmdb_api import search_movie, get_movie_details, get_imdb_link_from_movie_id
from sqlalchemy.orm import aliased
from sqlalchemy.sql import func


def init_routes(app):
    @app.route('/hi', methods=['GET'])
    def hi():
        return "Hello, World!"

    # @app.route('/api/home')
    # def get_home_data():
    #     is_authenticated = False  # Replace with auth check eventually
    #     return jsonify({'isAuthenticated': is_authenticated})



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
        general_entries = Entry.query.all()

        # Combine all entries into one list
        all_entries = media_entries + videogame_entries + general_entries

        # Return them as JSON
        return jsonify([entry.to_dict() for entry in all_entries])

    @app.route('/entries/<int:entry_id>', methods=['GET'])
    def get_entry(entry_id):
        # Try Media first
        entry = Media.query.get(entry_id)
        if entry:
            return jsonify(entry.to_dict())

        # Then try Videogame
        entry = Videogame.query.get(entry_id)
        if entry:
            return jsonify(entry.to_dict())

        # Then try generic Entry
        entry = Entry.query.get(entry_id)
        if entry:
            return jsonify(entry.to_dict())

        return jsonify({"msg": "Entry not found"}), 404

    # @app.route('/entries', methods=['GET'])
    # def get_entries():
    #     entries = Media.query.all()
    #     return jsonify([entry.to_dict() for entry in entries])
    #
    # @app.route('/entries/<int:entry_id>', methods=['GET'])
    # def get_entry(entry_id):
    #     entry = Media.query.get_or_404(entry_id)
    #     return jsonify(entry.to_dict())

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
    def collection_detail(collection_id):
        return render_template('collection_detail.html', collection_id=collection_id)

    @app.route('/entry_detail.html')
    def serve_entry_detail_page():
        return send_from_directory('.', 'entry_detail.html')

    @app.route('/api/random_entry')
    def get_random_entry():
        user_id = 1 #placeholder will need to add a means to check userid
        user_entries = Media.query.filter_by(user_id=user_id).all()
        if user_entries:
            random_entry = random.choice(user_entries)
            return jsonify({'entry_id': random_entry.id})
        else:
            return jsonify({'error': 'No entries found for this user'}), 404

    @app.route('/scanner.html')
    def scanner_page():
        return send_from_directory('.', 'scanner.html')

    @app.route('/scanner_results.html')
    def scanner_results_page():
        return send_from_directory('.', 'scanner_results.html')

    from flask import jsonify

    @app.route('/collections/<int:collection_id>/sort')
    def sort_collection(collection_id):
        sort_by = request.args.get('sort', 'alpha')

        collection = Collection.query.get_or_404(collection_id)
        entry_type = collection.collection_type  # e.g., 'media', 'videogames', etc.

        # Determine the appropriate model
        if entry_type == 'media':
            query = db.session.query(Media).filter_by(collection_id=collection.id)

            if sort_by == 'genre':
                genre_alias = aliased(Genre)
                query = query.outerjoin(Media.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Media.title.asc())
            else:
                query = query.order_by(Media.title.asc())

            entries = query.all()

        elif entry_type == 'videogames':
            entries = Videogame.query.filter_by(collection_id=collection.id).order_by(Videogame.title.asc()).all()

        else:
            entries = Entry.query.filter_by(collection_id=collection.id).order_by(Entry.title.asc()).all()

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
        for genre in details.get('genres', []):
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
            collection_id=collection_id
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
                "genres": genre_names
            }), 200

        # Non-movie fallback (non-film item)
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
        sort = request.args.get('sort', 'alpha')  # default to alphabetical

        collection = Collection.query.get_or_404(collection_id)
        entry_type = collection.collection_type  # Dynamically determine type from collection
        genre_alias = aliased(Genre)

        if entry_type == 'media':
            query = db.session.query(Media).filter_by(collection_id=collection.id)

            if sort == 'genre':
                query = query.outerjoin(Media.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Media.title.asc())
            else:
                query = query.order_by(Media.title.asc())

            entries = query.all()

        elif entry_type == 'videogames':
            entries = Videogame.query.filter_by(collection_id=collection.id).order_by(
                Videogame.title.asc()).all()

        else:  # default to general entries
            entries = Entry.query.filter_by(collection_id=collection.id).order_by(
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
        sort_by = request.args.get('sort_by', 'alphabetical')
        collection = Collection.query.get_or_404(collection_id)

        entry_type = collection.collection_type

        if entry_type == 'media':
            query = db.session.query(Media).filter_by(collection_id=collection.id)
            genre_alias = aliased(Genre)

            if sort_by == 'genre':
                query = query.outerjoin(Media.genres.of_type(genre_alias))
                query = query.order_by(func.coalesce(genre_alias.name, ""), Media.title.asc())
            else:
                query = query.order_by(Media.title.asc())

            entries = query.all()

        elif entry_type == 'videogames':
            entries = Videogame.query.filter_by(collection_id=collection.id).order_by(Videogame.title.asc()).all()

        else:
            entries = Entry.query.filter_by(collection_id=collection.id).order_by(Entry.title.asc()).all()

        # Annotate entries with type for the frontend
        annotated_entries = [{**entry.to_dict(), 'type': entry_type} for entry in entries]

        return jsonify(annotated_entries)