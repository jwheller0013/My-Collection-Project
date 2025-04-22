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
        login_user(user)
        return redirect("/")

    @app.route('/loginform')
    def loginform():
        return render_template("login.html")

