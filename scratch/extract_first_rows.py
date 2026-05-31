import pdfplumber
import json
import os

path = r"f:\myprog\menasa\rowaq-app\levels\Seniors\نظام السنة الواحدة.pdf"
try:
    with pdfplumber.open(path) as pdf:
        table = pdf.pages[0].extract_table()
        # Save first 8 rows to see structure and first few data rows
        with open(r"f:\myprog\menasa\rowaq-app\scratch\senior_table_sample.json", "w", encoding="utf-8") as f:
            json.dump(table[:8], f, ensure_ascii=False, indent=2)
        print("Success dumping senior sample")
except Exception as e:
    print("Error:", e)
