# src/api.py

import base64
import urllib.parse
import logging
import json
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user

# تصحيح الاستيرادات لتكون نسبية داخل مجلد src
from .extensions import db
from .models import Log, Configuration
from .scanner import SQLiScanner
from .alert import send_email_alert, send_sms_alert 
from . import nginx_conf
from . import RunNginx

logger = logging.getLogger(__name__)
bp = Blueprint('api', __name__)

@bp.route('/api/logs', methods=['GET'])
@login_required
def get_logs():
    """API to get all logs for SQL injection detection"""
    try:
        logs = Log.query.order_by(Log.timestamp.desc()).all()
        return jsonify([{
            'id': log.id,
            'detection_method': log.detection_method,
            'request_data': log.request_data,
            'score': log.score,
            'timestamp': log.timestamp.isoformat()
        } for log in logs])
    except Exception as e:
        logger.error(f"Error fetching logs: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route('/api/config', methods=['GET', 'POST'])
@login_required
def handle_config():
    """API to get or update configuration"""
    config = Configuration.query.first()
    if not config:
        config = Configuration()
        db.session.add(config)
        db.session.commit()
    
    if request.method == 'GET':
        return jsonify({
            'server_ip': config.server_ip,
            'server_port': config.server_port,
            'service_active': config.service_active,
            'email_alerts': config.email_alerts,
            'sms_alerts': config.sms_alerts,
            'email_recipient': config.email_recipient,
            'phone_number': config.phone_number
        })
    
    if request.method == 'POST':
        data = request.json
        if 'server_ip' in data: config.server_ip = data['server_ip']
        if 'server_port' in data: config.server_port = data['server_port']
        if 'service_active' in data: config.service_active = data['service_active']
        if 'email_alerts' in data: config.email_alerts = data['email_alerts']
        if 'sms_alerts' in data: config.sms_alerts = data['sms_alerts']
        if 'email_recipient' in data: config.email_recipient = data['email_recipient']
        if 'phone_number' in data: config.phone_number = data['phone_number']
        
        db.session.commit()
        return jsonify({'message': 'Configuration updated successfully'})

@bp.route('/api/service', methods=['POST'])
@login_required
def toggle_service():
    """API to toggle the nginx service"""
    try:
        data = request.json
        is_active = data.get('active', False)
       
        config = Configuration.query.first()
        if not config:
            config = Configuration()
            db.session.add(config)
        
        config.service_active = is_active
        db.session.commit()
        
        if is_active:
            logger.info("Service activation requested")
            nginx_conf.overwrite_conf(f"{config.server_ip}:{config.server_port}")
            RunNginx.start_nginx()
        else:
            logger.info("Service deactivation requested")
            RunNginx.stop_nginx()
            
        return jsonify({'success': True, 'active': is_active})
    except Exception as e:
        logger.error(f"Error toggling service: {str(e)}")
        return jsonify({'error': str(e)}), 500

@bp.route("/scan", methods=["GET"])
def scan_endpoint():
    scanner = SQLiScanner()
    config = Configuration.query.first() or Configuration()
    
    try:
        IP = request.headers.get("IP", "unknown")
        x_body = request.headers.get("X-Request-Body", "")
        if x_body == "":
            x_body = request.headers.get("X-Request-URL", "")
            if x_body == "":
                return " ", 200
        
        body = base64.b64decode(x_body).decode("utf-8")
        bodyw = urllib.parse.parse_qs(body)
        bodyz = {k: v[0] if len(v) == 1 else v for k, v in bodyw.items()}
        
        if bodyz: 
            is_attack = False
            detection_method = ""
            # 1. Signature-based scan
            for field, value in bodyz.items():
                result = scanner.scan(str(value))
                if result["blocked"]:
                    is_attack = True
                    detection_method = "signature-based"
                    break
            
            # 2. ML-based scan if signature didn't catch it
            if not is_attack:
                for field, value in bodyz.items():
                    result = scanner.scan2(str(value))
                    if result["blocked"]:
                        is_attack = True
                        detection_method = "Model"
                        break
            
            if is_attack:
                request_data_str = json.dumps(bodyz, ensure_ascii=False)
                new_log = Log(
                    request_data=request_data_str,
                    detection_method=detection_method,
                    score=IP
                )
                db.session.add(new_log)
                db.session.commit()

                if config.email_alerts:
                    send_email_alert(ip=IP, request_data=request_data_str, detection_method=detection_method)
                if config.sms_alerts:
                    send_sms_alert(ip=IP)
                
                return jsonify({"status": "blocked"}), 403
            
            return jsonify({"status": "allowed"}), 200 
            
    except Exception as ex:
        logger.error(f"Scan error: {str(ex)}")
        return jsonify({"error": "Internal server error"}), 500

@bp.route('/api/password', methods=['POST'])
@login_required
def change_password():
    """API to change user password"""
    from werkzeug.security import generate_password_hash, check_password_hash
    try:
        data = request.json
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        user = current_user
        if not check_password_hash(user.password_hash, current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Password updated successfully'})
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        return jsonify({'error': str(e)}), 500