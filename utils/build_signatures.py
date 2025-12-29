# build_signatures.py

import os
import re
import json
import hashlib
from pathlib import Path
from xml.etree import ElementTree as ET

class SignatureBuilder:
    def __init__(self):
        self.crs_file = Path("data/sources/coreruleset-4.0/rules/REQUEST-942-APPLICATION-ATTACK-SQLI.conf")
        self.sqlmap_payloads_dir = Path("data/sources/sqlmap-master/data/xml/payloads/")
        self.pat_sql_dir = Path("data/sources/PayloadsAllTheThings-master/SQL Injection/")
        self.output_path = Path("data/signatures.json")
        self.signatures = []

    def _generate_id(self, pattern: str, source: str) -> str:
        base = (pattern + source).encode("utf-8", errors="ignore")
        return "SQLi-" + hashlib.sha256(base).hexdigest()[:8].upper()

    def parse_owasp_crs(self):
        if not self.crs_file.exists():
            print(f"[WARN] CRS file not found: {self.crs_file}")
            return
        content = self.crs_file.read_text(encoding="utf-8", errors="ignore")
        blocks = re.findall(r'(?s)(SecRule\s+.*?)(?=SecRule|$)', content)

        for block in blocks:
            rx_match = re.search(r'@rx\s+(?P<pattern>[^"]+)', block)
            if rx_match:
                raw_pattern = rx_match.group("pattern").strip()
                # تخلص من أي باك سلاش في النهاية
                raw_pattern = raw_pattern.rstrip("\\")
                sig_id = self._generate_id(raw_pattern, "OWASP-CRS")
                # نفترض Severity=9
                self.signatures.append({
                    "id": sig_id,
                    "pattern": raw_pattern,
                    "severity": 9,
                    "source": "OWASP-CRS"
                })
            else:
                # ابحث عن @detectSQLi
                if "@detectSQLi" in block:
                    pattern_str = r"(?i)LIBINJECTION_DETECT"
                    sig_id = self._generate_id(pattern_str, "OWASP-CRS-detectSQLi")
                    self.signatures.append({
                        "id": sig_id,
                        "pattern": pattern_str,
                        "severity": 10,
                        "source": "OWASP-CRS-detectSQLi"
                    })

    def parse_sqlmap(self):
        if not self.sqlmap_payloads_dir.is_dir():
            print(f"[WARN] SQLMap path not found: {self.sqlmap_payloads_dir}")
            return
        for xml_file in self.sqlmap_payloads_dir.glob("*.xml"):
            try:
                tree = ET.parse(xml_file)
                root = tree.getroot()
                for test in root.findall(".//test"):
                    payload_elem = test.find("payload")
                    if payload_elem is not None and payload_elem.text:
                        line = payload_elem.text.strip()
                        if line:
                            # تخلص من \ نهاية السطر
                            line = line.rstrip("\\")
                            sig_id = self._generate_id(line, f"SQLMap:{xml_file.name}")
                            # نعطيها 7 مثلاً
                            self.signatures.append({
                                "id": sig_id,
                                "pattern": line,
                                "severity": 7,
                                "source": f"SQLMap:{xml_file.name}"
                            })
            except ET.ParseError as e:
                print(f"[ERROR] parse error {xml_file}: {e}")

    def parse_pat(self):
        if not self.pat_sql_dir.is_dir():
            print(f"[WARN] PAT path not found: {self.pat_sql_dir}")
            return
        for txt_file in self.pat_sql_dir.rglob("*.txt"):
            try:
                with open(txt_file, "r", encoding="utf-8", errors="ignore") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#"):
                            line = line.rstrip("\\")
                            sig_id = self._generate_id(line, f"PAT:{txt_file.name}")
                            # نعطيها 5
                            self.signatures.append({
                                "id": sig_id,
                                "pattern": line,
                                "severity": 5,
                                "source": f"PAT:{txt_file.name}"
                            })
            except Exception as e:
                print(f"[ERROR] {txt_file}: {e}")

    def parse_custom(self):
        # تخفيض Severity للعبارات الأساسية
        custom_list = [
            # جملة SELECT بسيطة
            {"pattern": r"(?i)\bSELECT\b", "severity": 2, "source": "Custom"},
            # جملة FROM
            {"pattern": r"(?i)\bFROM\b", "severity": 2, "source": "Custom"},
            # UNION SELECT
            {"pattern": r"(?i)\bUNION\s+SELECT\b", "severity": 8, "source": "Custom"},
            # time-based
            {"pattern": r"(?i)\bSLEEP\(\d+\)", "severity": 9, "source": "Custom"},
            {"pattern": r"(?i)\bBENCHMARK\(\d+,\s*md5\(", "severity": 9, "source": "Custom"}
        ]
        for c in custom_list:
            sig_id = self._generate_id(c["pattern"], c["source"])
            self.signatures.append({
                "id": sig_id,
                "pattern": c["pattern"],
                "severity": c["severity"],
                "source": c["source"]
            })

    def remove_duplicates(self):
        seen = {}
        unique = []
        for sig in self.signatures:
            key = f"{sig['pattern']}|{sig['severity']}|{sig['source']}"
            if key not in seen:
                seen[key] = True
                unique.append(sig)
        self.signatures = unique

    def validate_signatures(self):
        """
        محاولة compile لكل Regex. إذا فشل => تجاهل.
        مع re.escape قبل ذلك لتجنب bad escape.
        """
        validated = []
        for sig in self.signatures:
            pattern_str = sig["pattern"]
            # إذا كان بالفعل يحتوي (?i) أو غيره => لا نضيفه بنفسنا
            # فلنقم بمحاولة الهروب (escape) جزئي:
            try:
                # 1) تخلص من أي باك سلاش آخر السطر
                pattern_str = pattern_str.rstrip("\\")
                # 2) إن لم تكن صيغة Regex تحتوي (?i)... إلخ
                #    سنطبق escape:
                # لكن لو كانت تحتوي () أو .* بشكل مقصود => re.escape
                # قد يفسد المعنى. لذلك يمكننا الاكتفاء بمحاولة compile:
                re.compile(pattern_str)
            except re.error:
                # جرّب حل وسط:
                try:
                    pattern_escaped = re.escape(pattern_str)
                    re.compile(pattern_escaped)
                    # نجح بعد escape => نعتمده
                    sig["pattern"] = pattern_escaped
                    validated.append(sig)
                except re.error:
                    # نتجاهل
                    continue
            else:
                # نجح بدون تعديل
                sig["pattern"] = pattern_str
                validated.append(sig)
        self.signatures = validated

    def build(self):
        self.parse_owasp_crs()
        self.parse_sqlmap()
        self.parse_pat()
        self.parse_custom()
        self.remove_duplicates()
        self.validate_signatures()

        output = {
            "version": "4.0.1",
            "signatures": self.signatures
        }
        self.output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(self.output_path, "w", encoding="utf-8") as f:
            json.dump(output, f, indent=2, ensure_ascii=False)

        print(f"✅ تم إنشاء {self.output_path} بعدد {len(self.signatures)} توقيع.")

if __name__ == "__main__":
    builder = SignatureBuilder()
    builder.build()
