# src/app.py

from datetime import datetime
import os
import logging
from flask import Flask
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# تصحيح الاستيرادات لتتوافق مع وجود الملفات في نفس المجلد src
from .scanner import SQLiScanner
from .alert import send_email_alert
from . import nginx_conf
from . import RunNginx
from .extensions import db, login_manager

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Base(DeclarativeBase):
    pass

def create_app():
    # تحديد مسارات المجلدات الثابتة والقوالب لأنها أصبحت خارج src
    template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'web', 'templates'))
    static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'web', 'static'))
    
    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

    # مسار قاعدة البيانات في المجلد الرئيسي للمشروع
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'instance', 'sql_injection_detector.db'))
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", f"sqlite:///{db_path}"
    )
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }

    # تهيئة الامتدادات
    db.init_app(app)
    login_manager.init_app(app)

    with app.app_context():
        # استيراد النماذج محلياً لتجنب الاستيراد الدائري
        from .models import User, Log
        db.create_all()
        
        # إنشاء المستخدم الإداري الافتراضي
        if not User.query.filter_by(username="admin").first():
            from werkzeug.security import generate_password_hash
            admin = User(
                username="admin",
                email="admin@example.com",
                password_hash=generate_password_hash("password")
            )
            db.session.add(admin)
            db.session.commit()
            logger.info("Created default admin user")

    # تسجيل الـ blueprints مع تصحيح الاستيراد
    from .routes import bp as routes_bp
    from .api import bp as api_bp
    from .auth import bp as auth_bp

    app.register_blueprint(routes_bp)
    app.register_blueprint(api_bp)
    app.register_blueprint(auth_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)