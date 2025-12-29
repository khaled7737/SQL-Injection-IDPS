# src/routes.py

from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, current_user
import logging

logger = logging.getLogger(__name__)
bp = Blueprint('routes', __name__)

@bp.route('/')
@login_required
def index():
    """Main dashboard page with React components embedded"""
    return render_template('index.html')

@bp.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors"""
    return render_template('index.html'), 404

@bp.errorhandler(500)
def server_error(e):
    """Handle 500 errors"""
    logger.error(f"Server error: {e}")
    return render_template('index.html'), 500