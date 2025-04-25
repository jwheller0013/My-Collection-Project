from flask import Flask
# from flask_login import LoginManager
from models import db, User
from os import path
from routes import init_routes
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # app.config['SITE_NAME'] = 'My Collection'
    # app.config['SITE_DESCRIPTION'] = 'A database of your movies and shows!'
    # app.config['FLASK_DEBUG'] = 1
    # app.config['SECRET_KEY'] = 'james'
    # login_manager = LoginManager()
    # login_manager.init_app(app)

    # @login_manager.user_loader
    # def load_user(userid):
    #     return User.query.get(int(userid))

    # Initialize the extension with the app
    db.init_app(app)

    # Register all routes
    init_routes(app)

    # CORS(app, resources={r"/*": {"origins": "*"}})
    # Or, for more specific origins during development (e.g., your frontend on port 9000):
    CORS(app, resources={r"/*": {"origins": "http://localhost:9000"}})

    # Create database if it doesn't exist
    if not path.exists('database.db'):
        with app.app_context():
            db.create_all()

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(port= 8080, debug=True)




