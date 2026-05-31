import pdfplumber

try:
    with pdfplumber.open(r"f:\myprog\menasa\rowaq-app\levels\2.pdf") as pdf:
        text_content = []
        for i, page in enumerate(pdf.pages):
            text_content.append(f"--- PAGE {i+1} ---")
            text_content.append(page.extract_text() or "")
            
        full_text = "\n".join(text_content)
        with open(r"f:\myprog\menasa\rowaq-app\scratch\pdf_text.txt", "w", encoding="utf-8") as f:
            f.write(full_text)
            
        print("Successfully extracted PDF text. Pages count:", len(pdf.pages))
except Exception as e:
    print("Error:", e)
