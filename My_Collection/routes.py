from flask import request, jsonify
from models import db, User, Collection, Entry, Media, Genre

def init_routes(app):
    @app.route('/hi', methods=['GET'])
    def hi():
        return "Hello, World!"

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
        return jsonify(collection.to_dict())

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