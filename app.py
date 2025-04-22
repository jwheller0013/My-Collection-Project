from flask import render_template, session
from flask_login import LoginManager
from My_Collection.models import db, User
from My_Collection import create_app
app = create_app()

# u1 = User("eat@joes.com","eatjoes","eateat")
# db.session.add(u1)

app.config['SITE_NAME'] = 'My Collection'
app.config['SITE_DESCRIPTION'] = 'A database of your movies and shows!'
app.config['FLASK_DEBUG'] = 1

login_manager = LoginManager()
login_manager.init_app(app)
@login_manager.user_loader
def load_user(userid):
    return User.query.get(int(userid))

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template("Home.html")

# print (db)