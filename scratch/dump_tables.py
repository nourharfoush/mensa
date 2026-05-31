import pdfplumber
import json

try:
    all_pages_tables = []
    with pdfplumber.open(r"f:\myprog\menasa\rowaq-app\levels\children 2.pdf") as pdf:
        for i, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            page_tables = []
            for j, table in enumerate(tables):
                page_tables.append(table)
            all_pages_tables.append({
                "page": i + 1,
                "tables": page_tables
            })
            
    with open(r"f:\myprog\menasa\rowaq-app\scratch\pdf_tables.json", "w", encoding="utf-8") as f:
        json.dump(all_pages_tables, f, ensure_ascii=False, indent=2)
    print("Successfully wrote tables to JSON")
except Exception as e:
    print("Error:", e)
