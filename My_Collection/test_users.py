from app import create_app
from models import User, db

app = create_app()

def add_users():
    users_to_add = [
        {"id": 1, "username": "tester", "password": "test", "email": "test@test.com"}
    ]

    
    for user_data in users_to_add:
        existing_user = User.query.get(user_data["id"])  # Use get() by ID
        if not existing_user:
            new_user = User(id=user_data["id"], username=user_data["username"], password=user_data["password"], email=user_data["email"])  # Set the ID
            db.session.add(new_user)
    db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        add_users()