from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import mysql
from flask import Blueprint, jsonify, request

dashboard_bp = Blueprint('dashboard', __name__)

# -------------------
# Get user profile
# -------------------
@dashboard_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = get_jwt_identity()

    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT user_id, name, email, role, created_at
        FROM users
        WHERE user_id = %s
    """, (user_id,))
    
    user = cursor.fetchone()
    cursor.close()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "id": user[0],
        "name": user[1],
        "email": user[2],
        "role": user[3],
        "created_at": str(user[4])
    })


# -------------------
# Get farms for logged-in user
# -------------------
@dashboard_bp.route('/farms', methods=['GET'])
@jwt_required()
def get_farms():
    user_id = get_jwt_identity()

    cursor = mysql.connection.cursor()
    cursor.execute("""
        SELECT id, name, location, fields
        FROM farms
        WHERE user_id = %s
    """, (user_id,))
    
    farms = cursor.fetchall()
    cursor.close()

    farm_list = []
    for f in farms:
        farm_list.append({
            "id": f[0],
            "name": f[1],
            "location": f[2],
            "area": f[3]
        })

    return jsonify({"farms": farm_list})


# -------------------
# Get crops of a farm
# -------------------
@dashboard_bp.route('/crops/<int:farm_id>', methods=['GET'])
@jwt_required()
def get_crops(farm_id):

    user_id = get_jwt_identity()
    cursor = mysql.connection.cursor()

    # Check farm ownership
    cursor.execute(
        "SELECT id FROM farms WHERE id=%s AND user_id=%s",
        (farm_id, user_id)
    )
    farm = cursor.fetchone()

    if not farm:
        cursor.close()
        return jsonify({"message": "Access denied"}), 403

    # Correct query based on your table
    cursor.execute("""
        SELECT id, name, planting_date, harvest_date, status
        FROM crops
        WHERE farm_id=%s
    """, (farm_id,))

    crops = cursor.fetchall()
    cursor.close()

    crop_list = []

    for c in crops:
        crop_list.append({
            "id": c[0],
            "name": c[1],
            "planting_date": str(c[2]) if c[2] else None,
            "harvest_date": str(c[3]) if c[3] else None,
            "status": c[4]
        })

    return jsonify({"crops": crop_list})

# -------------------
# Get recent farm activities
# -------------------
@dashboard_bp.route('/activities/<int:farm_id>', methods=['GET'])
@jwt_required()
def get_activities(farm_id):

    user_id = get_jwt_identity()
    cursor = mysql.connection.cursor()

    # Check farm ownership
    cursor.execute("""
        SELECT id FROM farms
        WHERE id = %s AND user_id = %s
    """, (farm_id, user_id))

    farm = cursor.fetchone()

    if not farm:
        cursor.close()
        return jsonify({"message": "Access denied"}), 403

    cursor.execute("""
        SELECT id, activity_type, description, activity_date
        FROM farm_activities
        WHERE farm_id = %s
        ORDER BY activity_date DESC
        LIMIT 10
    """, (farm_id,))

    activities = cursor.fetchall()
    cursor.close()

    activity_list = []

    for a in activities:
        activity_list.append({
            "id": a[0],
            "type": a[1],
            "description": a[2],
            "date": str(a[3])
        })

    return jsonify({"activities": activity_list})


# -------------------
# Get latest market prices
# -------------------
@dashboard_bp.route('/market-prices', methods=['GET'])
@jwt_required()
def market_prices():

    cursor = mysql.connection.cursor()

    cursor.execute("""
        SELECT crop_name, price_per_unit, date
        FROM market_prices
        ORDER BY date DESC
        LIMIT 10
    """)

    prices = cursor.fetchall()
    cursor.close()

    price_list = []

    for p in prices:
        price_list.append({
            "crop": p[0],
            "price": float(p[1]),
            "date": str(p[2])
        })

    return jsonify({"market_prices": price_list})

@dashboard_bp.route('/add-crop', methods=['POST'])
@jwt_required()
def add_crop():

    user_id = get_jwt_identity()
    data = request.json

    farm_id = data.get("farm_id")
    name = data.get("name")
    planting_date = data.get("planting_date")

    cursor = mysql.connection.cursor()

    # Check farm ownership
    cursor.execute(
        "SELECT id FROM farms WHERE id=%s AND user_id=%s",
        (farm_id, user_id)
    )

    farm = cursor.fetchone()

    if not farm:
        cursor.close()
        return jsonify({"message": "Access denied"}), 403

    cursor.execute("""
        INSERT INTO crops (farm_id, name, planting_date, status)
        VALUES (%s, %s, %s, 'growing')
    """, (farm_id, name, planting_date))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Crop added successfully"})

@dashboard_bp.route('/add-activity', methods=['POST'])
@jwt_required()
def add_activity():

    user_id = get_jwt_identity()
    data = request.json

    farm_id = data.get("farm_id")
    activity_type = data.get("activity_type")
    description = data.get("description")
    activity_date = data.get("activity_date")

    cursor = mysql.connection.cursor()

    # Check farm ownership
    cursor.execute(
        "SELECT id FROM farms WHERE id=%s AND user_id=%s",
        (farm_id, user_id)
    )

    farm = cursor.fetchone()

    if not farm:
        cursor.close()
        return jsonify({"message": "Access denied"}), 403

    cursor.execute("""
        INSERT INTO farm_activities 
        (farm_id, activity_type, description, activity_date)
        VALUES (%s, %s, %s, %s)
    """, (farm_id, activity_type, description, activity_date))

    mysql.connection.commit()
    cursor.close()

    return jsonify({"message": "Activity added successfully"})