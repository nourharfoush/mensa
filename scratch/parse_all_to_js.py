import json
import re
import os
import unicodedata
import pandas as pd
import pdfplumber

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
    # Existing mappings
    "ةمايملا": "القيامة",
    "ةلاحلا": "الحاقة",
    "ململا": "القلم",
    "نلملا": "الملك",
    "ةعراملا": "المعارج",
    "ةعraاملا": "القارعة",
    "ةعرااملا": "القارعة",
    "رثاكتلا": "التكاثر",
    "ةيلعلا": "العلق",
    "تاعزانلا": "النازعات",
    "أبنلا": "النبأ",
    "سانلا": "الناس",
    "رصعلا": "العصر",
    "قraاطلا": "الطارق",
    "قراطلا": "الطارق",
    "تلاسرملا": "المرسلات",
    "ةلزلزلا": "الزلزلة",
    "نيتلا": "التين",
    "ةنيبلا": "البينة",
    "قامشنلاا": "الانشقاق",
    "ليللا": "الليل",
    "حرشلا": "الشرح",
    "نيففطملا": "المطففين",
    "دلبلا": "البلد",
    "سمشلا": "الشمس",
    "raاطفنلاا": "الانفطار",
    "raاطفنلاا": "الانفطار",
    "رجفلا": "الفجر",
    "ريوكتلا": "التكوير",
    "ناسنلإا": "الإنسان",
    "ىلعلأا": "الأعلى",
    "ةيشaاغلا": "الغاشية",
    "ةيشاغلا": "الغاشية",
    "سبع": "عبس",
    "رثدملا": "المدثر",
    "لمزملا": "المزمل",
    "نجلا": "الجن",
    "حون": "نوح",
    "جraعملا": "المعارج",
    "جراعملا": "المعارج",
    "ىحضلا": "الضحى",
    "تايداعلا": "العاديات",
    
    # New Mappings (for child level 10 and other levels)
    "البمرة": "البقرة",
    "ةرمبلا": "البقرة",
    
    "األعراف": "الأعراف",
    "فارعلأا": "الأعراف",
    
    "األنعام": "الأنعام",
    "ماعنلأا": "الأنعام",
    
    "اإlsراء": "الإسراء",
    "اإلسراء": "الإسراء",
    "ءارسلإا": "الإسراء",
    
    "األحزاب": "الأحزاب",
    "بازحلأا": "الأحزاب",
    
    "األنبياء": "الأنبياء",
    "ءaيبنلأا": "الأنبياء",
    "ءايبنلأا": "الأنبياء",
    
    "األنفال": "الأنفال",
    "لافنلأا": "الأنفال",
    
    "المصص": "القصص",
    "صصملا": "القصص",
    
    "الفرلان": "الفرقان",
    "نالرفلا": "الفرقان",
    
    "الطالق": "الطلاق",
    "قالطلا": "الطلاق",
    
    "لممان": "لقمان",
    "ناممل": "لقمان",
    
    "األحماف": "الأحقاف",
    "فامحلأا": "الأحقاف",
    
    "الوالعة": "الواقعة",
    "ةعlaولا": "الواقعة",
    "ةعلاولا": "الواقعة",
    
    "الممر": "القمر",
    "رمملا": "القمر",
    
    "األحقاف": "الأحقاف",
    "فاقحلأا": "الأحقاف",
    
    "المنافمون": "المنافقون",
    "نومفانملا": "المنافقون",
    
    "االنشقاق": "الانشقاق",
    "قافقشنلاا": "الانشقاق",
    
    "االنفطار": "الانفطار",
    "راطنفلآا": "الانفطار",
    "راطنفلأا": "الانفطار",
    
    "آل عمرا ن": "آل عمران",
    "ن ارمع لآ": "آل عمران",
    
    "المطفف ين": "المطففين",
    "المطفف ي ن": "المطففين",
    "المطففين": "المطففين",
    "ني ففطملا": "المطففين",
    
    "الميامه": "القيامة",
    "همايملا": "القيامة",
    
    "المدر": "المدثر",
    "ردملا": "المدثر",
    
    "ال ربوج": "البروج",
    "الربوج": "البروج",
    "جوب ر لا": "البروج",
    
    "العلك": "العلق",
    "كلعلا": "العلق",
    
    "لريش": "قريش",
    "شيرل": "قريش",
    
    "الضىح": "الضحى",
    "حىضلا": "الضحى",
    
    "اإلخالص": "الإخلاص",
    "صلاخلإا": "الإخلاص",
    
    "الجمعه": "الجمعة",
    "هعمجلا": "الجمعة",
    
    "آخر العنكبوت": "العنكبوت",
    "القيامه": "القيامة",
    "التوبه": "التوبة",
    "االنعام": "الأنعام",
}

indic_to_eng = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
}

def to_eng_digits(text):
    if not isinstance(text, str):
        text = str(text)
    for k, v in indic_to_eng.items():
        text = text.replace(k, v)
    return text.strip()

def get_surah_name(s):
    if not s:
        return ""
        
    # Remove internal newlines and clean up multiple spaces
    s = s.replace('\n', '').replace('\r', '')
    s = re.sub(r'\s+', ' ', s).strip()
    
    if s in ["*", "**", "", None]:
        return ""
        
    # NFKC Normalize first to solve ligatures
    s = unicodedata.normalize('NFKC', s)
    
    if s in surah_names:
        return s
    if s in surah_mapping:
        return surah_mapping[s]
        
    # Check reverse
    rev = s[::-1]
    if rev in surah_names:
        return rev
    if rev in surah_mapping:
        return surah_mapping[rev]
    return rev

def get_ayah_num(val):
    if not val:
        return ""
    val_str = to_eng_digits(val)
    if val_str in ["*", "**", "", None]:
        return ""
    nums = re.findall(r'\d+', val_str)
    if nums:
        return int(nums[0])
    return ""

def parse_pdf(path):
    curriculum = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if not row or len(row) < 22:
                        continue
                        
                    # Check if cell values contain exam text
                    row_str = " ".join([str(x) for x in row if x])
                    if "رابتخا" in row_str or "امتحا" in row_str:
                        continue
                        
                    # Clean elements
                    row_cleaned = [str(x).strip() if x is not None else "" for x in row]
                    
                    # Session number
                    sess_raw = row_cleaned[21]
                    sess_num_str = to_eng_digits(sess_raw)
                    if not sess_num_str:
                        continue
                        
                    try:
                        session_num = int(float(sess_num_str))
                    except ValueError:
                        continue
                        
                    # Parse fields by indices
                    distant_to_ayah = get_ayah_num(row_cleaned[3])
                    distant_to_surah = get_surah_name(row_cleaned[4])
                    distant_from_ayah = get_ayah_num(row_cleaned[5])
                    distant_from_surah = get_surah_name(row_cleaned[6])
                    
                    recent_to_ayah = get_ayah_num(row_cleaned[7])
                    recent_to_surah = get_surah_name(row_cleaned[8])
                    recent_from_ayah = get_ayah_num(row_cleaned[9])
                    recent_from_surah = get_surah_name(row_cleaned[10])
                    
                    memo_to_ayah = get_ayah_num(row_cleaned[11])
                    memo_to_surah = get_surah_name(row_cleaned[12])
                    memo_from_ayah = get_ayah_num(row_cleaned[13])
                    memo_from_surah = get_surah_name(row_cleaned[14])
                    
                    review_to_ayah = get_ayah_num(row_cleaned[15])
                    review_to_surah = get_surah_name(row_cleaned[16])
                    review_from_ayah = get_ayah_num(row_cleaned[17])
                    review_from_surah = get_surah_name(row_cleaned[18])
                    
                    curriculum.append({
                        "session": session_num,
                        "review": {
                            "fromSurah": review_from_surah,
                            "fromAyah": review_from_ayah,
                            "toSurah": review_to_surah,
                            "toAyah": review_to_ayah
                        },
                        "memorization": {
                            "fromSurah": memo_from_surah,
                            "fromAyah": memo_from_ayah,
                            "toSurah": memo_to_surah,
                            "toAyah": memo_to_ayah
                        },
                        "recentReview": {
                            "fromSurah": recent_from_surah,
                            "fromAyah": recent_from_ayah,
                            "toSurah": recent_to_surah,
                            "toAyah": recent_to_ayah
                        },
                        "distantReview": {
                            "fromSurah": distant_from_surah,
                            "fromAyah": distant_from_ayah,
                            "toSurah": distant_to_surah,
                            "toAyah": distant_to_ayah
                        }
                    })
    # Sort
    curriculum.sort(key=lambda x: x["session"])
    return curriculum

def parse_children1():
    excel_path = r"f:\myprog\menasa\rowaq-app\levels\children 1.xlsx"
    df = pd.read_excel(excel_path)
    
    surah_names_sorted = sorted(surah_names, key=len, reverse=True)
    
    def parse_ayah_field(surah, ayah_field):
        surah = (surah or "").strip()
        ayah_field = (ayah_field or "").strip()
        
        if not surah or surah == "**" or surah == "":
            return {"fromSurah": "", "fromAyah": "", "toSurah": "", "toAyah": ""}
            
        from_surah = surah
        to_surah = surah
        from_ayah = ""
        to_ayah = ""
        
        cross_surah = None
        for s_name in surah_names_sorted:
            if s_name in ayah_field:
                cross_surah = s_name
                break
                
        if cross_surah:
            to_surah = cross_surah
            parts = ayah_field.split(cross_surah)
            left = to_eng_digits(parts[0])
            right = to_eng_digits(parts[1]) if len(parts) > 1 else ""
            
            left_nums = re.findall(r'\d+', left)
            if left_nums:
                from_ayah = int(left_nums[0])
            right_nums = re.findall(r'\d+', right)
            if right_nums:
                to_ayah = int(right_nums[0])
        else:
            norm_field = to_eng_digits(ayah_field)
            nums = re.findall(r'\d+', norm_field)
            if len(nums) >= 2:
                from_ayah = int(nums[0])
                to_ayah = int(nums[1])
            elif len(nums) == 1:
                from_ayah = int(nums[0])
                to_ayah = int(nums[0])
                
        return {
            "fromSurah": from_surah,
            "fromAyah": from_ayah,
            "toSurah": to_surah,
            "toAyah": to_ayah
        }

    curriculum = []
    
    # Fillna and parse
    for idx, row in df.iterrows():
        session_col = df.columns[0]
        session_val = row[session_col]
        
        try:
            session_num = int(float(str(session_val)))
        except ValueError:
            continue
            
        review_surah = str(row.iloc[1]) if pd.notna(row.iloc[1]) else ""
        review_ayah = str(row.iloc[2]) if pd.notna(row.iloc[2]) else ""
        memo_surah = str(row.iloc[3]) if pd.notna(row.iloc[3]) else ""
        memo_ayah = str(row.iloc[4]) if pd.notna(row.iloc[4]) else ""
        recent_surah = str(row.iloc[5]) if pd.notna(row.iloc[5]) else ""
        recent_ayah = str(row.iloc[6]) if pd.notna(row.iloc[6]) else ""
        
        review_parsed = parse_ayah_field(review_surah, review_ayah)
        memo_parsed = parse_ayah_field(memo_surah, memo_ayah)
        recent_parsed = parse_ayah_field(recent_surah, recent_ayah)
        
        curriculum.append({
            "session": session_num,
            "review": review_parsed,
            "memorization": memo_parsed,
            "recentReview": recent_parsed,
            "distantReview": {
                "fromSurah": "",
                "fromAyah": "",
                "toSurah": "",
                "toAyah": ""
            }
        })
        
    curriculum.sort(key=lambda x: x["session"])
    return curriculum

levels_dir = r"f:\myprog\menasa\rowaq-app\levels"
seniors_dir = os.path.join(levels_dir, "Seniors")

file_mappings = {
    "children 1.xlsx": ("children1.js", "children1Curriculum"),
    "children 2.pdf": ("children2.js", "children2Curriculum"),
    "children 3.pdf": ("children3.js", "children3Curriculum"),
    "children 4.pdf": ("children4.js", "children4Curriculum"),
    "children 5.pdf": ("children5.js", "children5Curriculum"),
    "children 6.pdf": ("children6.js", "children6Curriculum"),
    "children 7.pdf": ("children7.js", "children7Curriculum"),
    "children 8.pdf": ("children8.js", "children8Curriculum"),
    "children 9.pdf": ("children9.js", "children9Curriculum"),
    "children 10.pdf": ("children10.js", "children10Curriculum"),
    
    "نظام السنة الواحدة.pdf": ("seniors_one_year.js", "seniorsOneYearCurriculum"),
    "نظام السنتين.pdf": ("seniors_two_years.js", "seniorsTwoYearsCurriculum"),
    "نظام الثلاث سنوات.pdf": ("seniors_three_years.js", "seniorsThreeYearsCurriculum"),
    "نظام الأربع سنوات (الفاتحة).pdf": ("seniors_four_years_fatihah.js", "seniorsFourYearsFatihahCurriculum"),
    "نظام الأربع سنوات (الناس).pdf": ("seniors_four_years_nas.js", "seniorsFourYearsNasCurriculum"),
    "نظام الخمس سنوات (الفاتحة).pdf": ("seniors_five_years_fatihah.js", "seniorsFiveYearsFatihahCurriculum"),
    "نظام الخمس سنوات (الناس).pdf": ("seniors_five_years_nas.js", "seniorsFiveYearsNasCurriculum"),
}

output_dir = r"f:\myprog\menasa\rowaq-app\src\data"

for filename, (js_name, var_name) in file_mappings.items():
    if filename.endswith(".xlsx"):
        print(f"Processing Excel: {filename} -> {js_name}")
        curriculum = parse_children1()
    else:
        # Check in levels_dir or seniors_dir
        path = os.path.join(levels_dir, filename)
        if not os.path.exists(path):
            path = os.path.join(seniors_dir, filename)
            
        if os.path.exists(path):
            print(f"Processing PDF: {filename} -> {js_name}")
            curriculum = parse_pdf(path)
        else:
            print(f"Warning: File {filename} not found!")
            continue
            
    # Write JavaScript
    out_path = os.path.join(output_dir, js_name)
    js_content = f"// This file is auto-generated from levels/{filename}\nexport const {var_name} = {json.dumps(curriculum, ensure_ascii=False, indent=2)};\n"
    with open(out_path, "w", encoding="utf-8") as out:
        out.write(js_content)
        
    print(f"  Successfully wrote {len(curriculum)} sessions to {js_name}")

print("\nAll files processed successfully!")
