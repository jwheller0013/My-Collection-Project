from flask import request, jsonify, render_template, redirect
from models import db, User, Collection, Entry, Media
from flask_login import current_user, login_user, logout_user, login_required
from werkzeug.security import check_password_hash
from user import username_taken, email_taken, valid_username, valid_password

def init_routes(app):
    @app.route('/hi', methods=['GET'])
    def hi():
        return "Hello, World!"

    @app.route('/')
    def index():
        return render_template("Home.html")

    @app.route('/action_login', methods=['POST'])
    def action_login():
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter(User.username == username).first()
        if user and user.check_password(password):
            login_user(user)
        else:
            errors = []
            errors.append("Username or password is incorrect!")
            return render_template("login.html", errors=errors)
        return redirect("/")

    @app.route('/action_logout')
    def action_logout():
        logout_user()
        return redirect("/")

    @app.route('/action_createaccount', methods=['POST'])
    def action_createaccount():
        username = request.form['username']
        password = request.form['password']
        email = request.form['email']
        errors = []
        retry = False
        if username_taken(username):
            errors.append("Username is already taken!")
            retry=True
        if email_taken(email):
            errors.append("An account already exists with this email!")
            retry = True
        if not valid_username(username):
            errors.append("Username is not valid!")
            retry = True
        if not valid_password(password):
            errors.append("Password is not valid!")
            retry = True
        if retry:
            return render_template("login.html", errors=errors)
        user = User(email, username, password)
        if user.username == "admin":
            user.admin = True
        db.session.add(user)
        db.session.commit()

        default_collection = Collection(title="My Collection")
        default_collection.user_id = user.id
        db.session.add(default_collection)
        db.session.commit()

        login_user(user)
        return redirect("/")

    @app.route('/loginform')
    def loginform():
        return render_template("login.html")

    @app.route('/Scanner')
    @login_required
    def scanner():
        return render_template("/Scanner.html")

    @app.route('/Scan_Results')
    @login_required
    def scan_results():
        return render_template("/Scan_Results.html")

    @app.route('/Collection')
    @login_required
    def collection():
        collections = Collection.query.filter_by(user_id=current_user.id).all()
        return render_template("/Collection.html", collections=collections)

    @app.route('/Entry')
    @login_required
    def entry():
        return render_template("/Entry.html")

    @app.route('/add_media_by_upc', methods=['POST'])
    @login_required
    def add_media_by_upc():
        upc = request.form['upc']

        new_media = Media(
            title=f"Item with UPC: {upc}",  # Placeholder title
            tv_film=None,
            genre=None,
            rating=None,
            link=None,
            upc=upc
        )
        db.session.add(new_media)
        db.session.commit()
        return redirect('/Scan_Results')

    @app.route('/create_collection', methods=['GET', 'POST'])
    @login_required
    def create_collection():
        if request.method == 'POST':
            title = request.form['collection_title']
            new_collection = Collection(title=title, user_id=current_user.id)
            db.session.add(new_collection)
            db.session.commit()
            return redirect('/Collection')
        return render_template('create_collection.html')