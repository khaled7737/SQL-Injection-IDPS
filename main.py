# main.py (في المجلد الرئيسي للمشروع)

import sys
import os

# إضافة مجلد src إلى مسار البحث عن الوحدات (Python Path)
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.app import create_app

app = create_app()

if __name__ == "__main__":
    # تشغيل التطبيق
    app.run(host="0.0.0.0", port=5000, debug=True)