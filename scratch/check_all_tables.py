import pdfplumber
import os

levels_dir = r"f:\myprog\menasa\rowaq-app\levels"
seniors_dir = os.path.join(levels_dir, "Seniors")

child_files = [f"children {i}.pdf" for i in range(2, 11)]
senior_files = os.listdir(seniors_dir)

print("Child Files:")
for f_name in child_files:
    path = os.path.join(levels_dir, f_name)
    if os.path.exists(path):
        with pdfplumber.open(path) as pdf:
            tables = pdf.pages[0].extract_tables()
            dims = [f"{len(t)}x{len(t[0])}" for t in tables]
            print(f"  {f_name}: pages={len(pdf.pages)} tables={dims}")
    else:
        print(f"  {f_name}: DOES NOT EXIST")

print("\nSenior Files:")
for f_name in senior_files:
    path = os.path.join(seniors_dir, f_name)
    with pdfplumber.open(path) as pdf:
        tables = pdf.pages[0].extract_tables()
        dims = [f"{len(t)}x{len(t[0])}" for t in tables]
        print(f"  {f_name}: pages={len(pdf.pages)} tables={dims}")
