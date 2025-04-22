# from flask import Flask
# from My_Collection.routes import rt
#
#
# def create_app():
#     app = Flask(__name__, instance_relative_config=False)
#     # app.config.from_object('config.Config')
#     app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:1nBrightestDay@localhost:3306/collection'
#     app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
#     app.register_blueprint(rt)
#     from My_Collection.models import db
#     db.init_app(app)
#
#
#     with app.app_context():
#         db.create_all()
#         return app