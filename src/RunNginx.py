# src/RunNginx.py

import os
import subprocess
import sys

def get_nginx_paths():
    # تحديد المسارات المطلقة بناءً على موقع الملف داخل src
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, '..'))
    nginx_dir = os.path.join(project_root, 'nginx')
    # في أنظمة ويندوز يكون الامتداد .exe، في لينكس يكون nginx فقط
    exe_name = "nginx.exe" if sys.platform == "win32" else "nginx"
    exe_path = os.path.join(nginx_dir, exe_name)
    return nginx_dir, exe_path

def start_nginx():
    nginx_dir, exe = get_nginx_paths()
    # استخدام مسار ملف الإعداد النسبي من مجلد nginx
    cmd = [exe, "-c", os.path.join("conf", "nginx.conf")]
    
    print(f"Starting Nginx from: {nginx_dir}")
    try:
        subprocess.Popen(cmd, cwd=nginx_dir)
        print("Nginx started successfully.")
    except Exception as e:
        print(f"Error starting Nginx: {e}")

def stop_nginx():
    nginx_dir, exe = get_nginx_paths()
    cmd = [exe, "-s", "stop"]
    
    try:
        subprocess.Popen(cmd, cwd=nginx_dir)
        print("Nginx stopped successfully.")
    except Exception as e:
        print(f"Error stopping Nginx: {e}")