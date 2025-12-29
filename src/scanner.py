# src/scanner.py

import logging
import os
from typing import Dict
import libinjection
import joblib

def should_process(cmd: str) -> bool:
    # شرط وجود الكلمات المحظورة
    forbidden = ['login', 'admin', 'password']
    if any(word in cmd.lower() for word in forbidden):
        if ("'" not in cmd) and ('"' not in cmd):
            return False
    # إذا اجتزنا الشروط السابقة نمرر المعالجة
    return True

class SQLiScanner:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        # تحديد المسار المطلق لمجلد النماذج (خارج src)
        self.base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        self.model_path = os.path.join(self.base_dir, 'model', 'svm_sql_injection_model.joblib')
        self.vectorizer_path = os.path.join(self.base_dir, 'model', 'vectorizer_sql_injection.joblib')

    def scan(self, input_str: str) -> Dict:
        try:
            result = libinjection.is_sql_injection(input_str)
        except Exception as e:
            self.logger.error("Error in libinjection detection: %s", str(e))
            return {"is_sqli": False, "blocked": False, "score": 0, "fingerprint": ""}

        if result.get("is_sqli"):
            return {
                "is_sqli": True,
                "blocked": True,
                "score": 100,
                "fingerprint": result.get("fingerprint", "")
            }
        else:
            return {
                "is_sqli": False,
                "blocked": False,
                "score": 0,
                "fingerprint": ""
            }

    def scan2(self, input_str: str) -> Dict:
        if should_process(input_str):
            try:
                # تحميل النموذج والمحول باستخدام المسارات المطلقة المصححة
                clf = joblib.load(self.model_path)
                vectorizer = joblib.load(self.vectorizer_path)
                
                test_query = [input_str]
                test_features = vectorizer.transform(test_query)
                prediction = clf.predict(test_features)
                
                if prediction[0] == 1:
                    return {"is_sqli": True, "blocked": True, "score": 10, "fingerprint": ""}
                else:
                    return {"is_sqli": False, "blocked": False, "score": 0, "fingerprint": ""}
            except Exception as e:
                self.logger.error("Error in ML model detection: %s", str(e))
                return {"is_sqli": False, "blocked": False, "score": 0, "fingerprint": ""}
        else:
            return {"is_sqli": False, "blocked": False, "score": 0, "fingerprint": ""}