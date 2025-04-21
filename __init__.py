from flask import Flask
from routes import rt


def create_app():
    app = Flask(__name__, instance_relative_config=False)
    app.config.from_object('config.Config')
    app.register_blueprint(rt)
    from My_Collection.models import db
    db.init_app(app)


    with app.app_context():
        db.create_all()
        return app

