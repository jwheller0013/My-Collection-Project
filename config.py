from os import environ, path

basedir = path.abspath(path.dirname(__file__))

class Config:
    SECRET_KEY = 'james'
    FLASK_APP = 'My_Collection'

    SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://root:PASSWORD@localhost:3306/collection'

    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False