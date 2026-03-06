from flask import Flask
from config import Config
from extensions import mysql
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from routes.dashboard import dashboard_bp


app = Flask(__name__)

# Load config FIRST
app.config.from_object(Config)

# VERY IMPORTANT ↓
app.config["JWT_IDENTITY_CLAIM"] = "sub"

mysql.init_app(app)
jwt = JWTManager(app)
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")

if __name__ == "__main__":
    app.run(debug=True)