# src/models.py

from datetime import datetime
from flask_login import UserMixin
from .extensions import db, login_manager

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))

class Log(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    detection_method = db.Column(db.String(50), nullable=False)
    request_data = db.Column(db.Text, nullable=False)
    score = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

class Configuration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    server_ip = db.Column(db.String(50), nullable=False, default="127.0.0.1")
    server_port = db.Column(db.Integer, nullable=False, default=80)
    service_active = db.Column(db.Boolean, default=False)
    email_alerts = db.Column(db.Boolean, default=True)
    sms_alerts = db.Column(db.Boolean, default=False)
    email_recipient = db.Column(db.String(120), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)