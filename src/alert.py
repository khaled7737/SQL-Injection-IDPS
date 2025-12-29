# src/alert.py

from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests

# استيراد نسبي داخل مجلد src
from .models import Configuration

def send_email_alert(ip, request_data, detection_method, details=""):
    now = datetime.now()
    time_str = now.strftime("<%b %d, %Y  %I:%M %p>").replace("AM", "am").replace("PM", "pm")
    
    # الحصول على الإعدادات من قاعدة البيانات
    config = Configuration.query.first() or Configuration()
    
    sender_email = '"SQL Security" <alaqlqlan47@gmail.com>'
    receiver_email = config.email_recipient or "admin@example.com"
    username = "alaqlqlan47@gmail.com"
    password = "fzgcjtdpppfvspsh"    
    
    message = MIMEMultipart("alternative")
    message["Subject"] = "تنبيه أمني - محاولة حقن SQL"
    message["From"] = sender_email
    message["To"] = receiver_email

    html = f"""
    <!DOCTYPE html>
    <html lang="ar">
      <head>
        <meta charset="UTF-8" />
        <title>تنبيه أمني</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">
        <div style="width:100%; max-width:600px; margin:20px auto; background-color:#ffffff; border:1px solid #dddddd; border-radius:8px; overflow:hidden;" dir="rtl">
          <div style="background-color:#d9534f; padding:20px; text-align:center; color:#ffffff;">
            <h1 style="margin:0; font-size:24px;">تنبيه أمني خطير</h1>
          </div>
          <div style="padding:20px; color:#333333; line-height:1.6; text-align:right;">
            <p>تم اكتشاف محاولة اختراق من عنوان IP: <span style="color:#d9534f; font-weight:bold;">{ip}</span></p>
            <p>الوقت: {time_str}</p>
            <p>طريقة الكشف: {detection_method}</p>
            <p>البيانات المشبوهة:</p>
            <pre style="background:#f8f8f8; padding:10px; border-radius:4px;">{request_data}</pre>
            <p>{details}</p>
          </div>
          <div style="background-color:#f4f4f4; padding:10px; text-align:center; color:#888888; font-size:12px;">
            <p>&copy; 2025 نظام حماية SQLi-IDPS</p>
          </div>
        </div>
      </body>
    </html>
    """

    part = MIMEText(html, "html")
    message.attach(part)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(username, password)
            server.sendmail(sender_email, receiver_email, message.as_string())
        print("تم إرسال البريد الإلكتروني بنجاح!")
    except Exception as e:
        print(f"حدث خطأ أثناء إرسال البريد الإلكتروني: {e}")

def send_sms_alert(ip):
    url = "http://192.168.46.109:8082"
    token = "dbb185f5-8773-42e2-90bc-eb1a6e141dc6"
    headers = {
        "Authorization": token,
        "Content-Type": "application/json"
    }
    
    config = Configuration.query.first() or Configuration()
    payload = {
        "to": config.phone_number,
        "message": f"تنبيه أمني: تم اكتشاف محاولة حقن SQL من IP: {ip}"
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        if response.ok:
            print("تم إرسال رسالة SMS بنجاح")
        else:
            print(f"فشل إرسال SMS: {response.status_code}")
    except Exception as e:
        print(f"خطأ في إرسال SMS: {e}")