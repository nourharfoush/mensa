import pdfplumber
import os

path = r"f:\myprog\menasa\rowaq-app\levels\children 3.pdf"
with pdfplumber.open(path) as pdf:
    table = pdf.pages[0].extract_table()
    for row in table:
        for val in row:
            if val and "دلبلا" in str(val):
                raw_val = str(val).strip()
                rev_val = raw_val[::-1]
                print("Raw val:", repr(raw_val), [hex(ord(c)) for c in raw_val])
                print("Reversed:", repr(rev_val), [hex(ord(c)) for c in rev_val])
                
# Compare to standard "البلد"
std = "البلد"
print("Standard:", repr(std), [hex(ord(c)) for c in std])
