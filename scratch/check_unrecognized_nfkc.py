import pdfplumber
import os
import re
import unicodedata

surah_names = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", 
  "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", 
  "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", 
  "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", 
  "الحجرات", "ق", "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", 
  "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج", 
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", 
  "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", 
  "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", 
  "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
]

surah_mapping = {
    # spelling / OCR errors (not ligature issues)
    "ةمايملا": "القيامة",
    "ةلاحلا": "الحاقة",
    "ململا": "القلم",
    "نلملا": "الملك",
    "ةعراملا": "المعارج",
    "ةعرااملا": "القارعة",
    "رثاكتلا": "التكاثر", # wait, let's see if this gets resolved or kept
    "تاعزانلا": "النازعات",
    "أبنلا": "النبأ"
}

levels_dir = r"f:\myprog\menasa\rowaq-app\levels"
seniors_dir = os.path.join(levels_dir, "Seniors")

pdf_files = []
for f in range(2, 11):
    pdf_files.append(os.path.join(levels_dir, f"children {f}.pdf"))
for f in os.listdir(seniors_dir):
    if f.endswith(".pdf"):
        pdf_files.append(os.path.join(seniors_dir, f))

unrecognized = set()

for path in pdf_files:
    if not os.path.exists(path):
        continue
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not row or len(row) < 22:
                        continue
                    
                    for idx in [4, 6, 8, 10, 12, 14, 16, 18]:
                        val = row[idx]
                        if val:
                            val = str(val).strip()
                            if val in ["*", "**", "", None]:
                                continue
                            
                            # Normalize NFKC
                            val_norm = unicodedata.normalize('NFKC', val)
                            
                            if val_norm in surah_mapping:
                                continue
                            rev = val_norm[::-1]
                            if rev in surah_names:
                                continue
                            # check standard mapping again
                            if val in surah_mapping:
                                continue
                            
                            unrecognized.add((val, val_norm, rev, os.path.basename(path)))

print("Unrecognized Surah names after NFKC:")
for val, val_norm, rev, filename in sorted(unrecognized):
    print(f"  Raw: {repr(val)} | Norm: {repr(val_norm)} | Rev: {repr(rev)} | File: {filename}")
