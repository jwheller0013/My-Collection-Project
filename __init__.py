from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_login import LoginManager

db = SQLAlchemy()
socketio = SocketIO()
login_manager = LoginManager()

def create_app():
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object('config.Config')

    db.init_app(app)
    socketio.init_app(app)
    login_manager.init_app(app)

    from .routes import rt
    app.register_blueprint(rt)

    from .My_Collection.models import User

    with app.app_context():
        db.create_all()

    return app

login_manager.user_loader
def load_user(userid):
    from .My_Collection.models import User
    return User.query.get(int(userid))

if __name__ == '__main__':
    app = create_app()
    socketio.run(app, port=5555, debug=True)