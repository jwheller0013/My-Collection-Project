import random
from flask import request, jsonify, send_from_directory, render_template
from models import db, User, Collection, Entry, Media, Genre

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

    # @app.route('/entries', methods=['GET'])
    # def get_entries():
    #     entries = Entry.query.all()
    #     return jsonify([entry.to_dict() for entry in entries])
    #
    # @app.route('/entries/<int:entry_id>', methods=['GET'])
    # def get_entry(entry_id):
    #     entry = Entry.query.get_or_404(entry_id)
    #     return jsonify(entry.to_dict())

    # Above is commented out as designed for growth to entries beyond Media but currently want to see Media

    @app.route('/entries', methods=['GET'])
    def get_entries():
        entries = Media.query.all()
        return jsonify([entry.to_dict() for entry in entries])

    @app.route('/entries/<int:entry_id>', methods=['GET'])
    def get_entry(entry_id):
        entry = Media.query.get_or_404(entry_id)
        return jsonify(entry.to_dict())

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

    @app.route('/sort.html')
    def sort_page():
        return send_from_directory('.', 'sort.html')

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

            # Convert empty string UPC to None
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
        elif entry_type == 'general':
            new_entry = Entry(
                user_id=user_id,
                collection_id=collection_id,
            )
        else:
            return jsonify({"msg": f"Invalid entry type: {entry_type}"}), 400

        db.session.add(new_entry)
        db.session.commit()
        return jsonify({"msg": "Entry created successfully", "entry_id": new_entry.id}), 201