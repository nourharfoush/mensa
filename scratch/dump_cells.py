import pdfplumber

path = r"f:\myprog\menasa\rowaq-app\levels\children 3.pdf"
with pdfplumber.open(path) as pdf:
    # Let's inspect first few rows of table on page 1
    table = pdf.pages[0].extract_table()
    for i, row in enumerate(table[:10]):
        print(f"Row {i}:")
        for j, cell in enumerate(row):
            if cell:
                cell_str = str(cell).strip()
                if any(c in cell_str for c in ["د", "ل", "ب", "ا"]):
                    print(f"  Col {j}: repr={repr(cell_str)} code={[hex(ord(c)) for c in cell_str]}")
