import pdfplumber

try:
    with pdfplumber.open(r"f:\myprog\menasa\rowaq-app\levels\children 2.pdf") as pdf:
        for i, page in enumerate(pdf.pages):
            tables = page.extract_tables()
            print(f"Page {i+1}: found {len(tables)} tables")
            if tables:
                for j, table in enumerate(tables):
                    print(f"  Table {j+1} dimensions: {len(table)} rows x {len(table[0]) if table else 0} cols")
                    # print first 5 rows
                    for row in table[:5]:
                        print("    ", row)
except Exception as e:
    print("Error:", e)
