from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import mysql
from flask_jwt_extended import jwt_required, get_jwt_identity

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    cursor = mysql.connection.cursor()

    # Check if user already exists
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        return jsonify({"message": "User already exists"}), 400

    # Hash password
    hashed_password = generate_password_hash(password)

    # Insert new user
    cursor.execute(
        "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
        (name, email, hashed_password)
    )
    mysql.connection.commit()

    cursor.close()

    return jsonify({"message": "User registered successfully"}), 201
from werkzeug.security import check_password_hash
from flask import jsonify, request

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    cursor = mysql.connection.cursor()

    # Find user by email
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()

    cursor.close()

    if not user:
        return jsonify({"message": "User not found"}), 404

    # user tuple index:
    # 0=user_id, 1=name, 2=email, 3=password, 4=role, 5=created_at
    stored_password = user[3]

    # Check password
    if not check_password_hash(stored_password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user[0]))

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user[0],
            "name": user[1],
            "email": user[2],
            "role": user[4]
            }
        }), 200
