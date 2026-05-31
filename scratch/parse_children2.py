import json
import re

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
    "سانلا": "الناس",
    "رصعلا": "العصر",
    "قراطلا": "الطارق",
    "تلاسرملا": "المرسلات",
    "ةلزلزلا": "الزلزلة",
    "رثاكتلا": "التكاثر",
    "نيتلا": "التين",
    "ةنيبلا": "البينة",
    "قامشنلاا": "الانشقاق",
    "ليللا": "الليل",
    "حرشلا": "الشرح",
    "نيففطملا": "المطففين",
    "دلبلا": "البلد",
    "سمشلا": "الشمس",
    "راطفنلاا": "الانفطار",
    "رجفلا": "الفجر",
    "ريوكتلا": "التكوير",
    "ناسنلإا": "الإنسان",
    "ىلعلأا": "الأعلى",
    "ةيشاغلا": "الغاشية",
    "سبع": "عبس",
    "تاعزانلا": "النازعات",
    "أبنلا": "النبأ",
    "ةمايملا": "القيامة",
    "رثدملا": "المدثر",
    "لمزملا": "المزمل",
    "نجلا": "الجن",
    "حون": "نوح",
    "جراعملا": "المعارج",
    "ةلاحلا": "الحاقة",
    "ململا": "القلم",
    "نلملا": "الملك",
    "ةعراملا": "المعارج",
    "ىحضلا": "الضحى",
    "تايداعلا": "العاديات",
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
    s = s.strip()
    if s in ["*", "**", "", None]:
        return ""
    if s in surah_mapping:
        return surah_mapping[s]
    # Check reverse
    rev = s[::-1]
    if rev in surah_names:
        return rev
    return s

def get_ayah_num(val):
    if not val:
        return ""
    val_str = to_eng_digits(val)
    if val_str in ["*", "**", "", None]:
        return ""
    # Extract first integer
    nums = re.findall(r'\d+', val_str)
    if nums:
        return int(nums[0])
    return ""

try:
    with open(r"f:\myprog\menasa\rowaq-app\scratch\pdf_tables.json", "r", encoding="utf-8") as f:
        pages_data = json.load(f)
        
    curriculum = []
    
    for page in pages_data:
        tables = page.get("tables", [])
        for table in tables:
            for row in table:
                if not row or len(row) < 22:
                    continue
                    
                # Clean elements
                row_cleaned = [str(x).strip() if x is not None else "" for x in row]
                
                # Check if it is a session row by looking at the last column (session number)
                sess_raw = row_cleaned[21]
                sess_num_str = to_eng_digits(sess_raw)
                
                if not sess_num_str:
                    continue
                    
                try:
                    session_num = int(float(sess_num_str))
                except ValueError:
                    continue
                    
                # Map fields by indices
                # Distant Review (col 3-6)
                distant_to_ayah = get_ayah_num(row_cleaned[3])
                distant_to_surah = get_surah_name(row_cleaned[4])
                distant_from_ayah = get_ayah_num(row_cleaned[5])
                distant_from_surah = get_surah_name(row_cleaned[6])
                
                # Recent Review (col 7-10)
                recent_to_ayah = get_ayah_num(row_cleaned[7])
                recent_to_surah = get_surah_name(row_cleaned[8])
                recent_from_ayah = get_ayah_num(row_cleaned[9])
                recent_from_surah = get_surah_name(row_cleaned[10])
                
                # Memorization (col 11-14)
                memo_to_ayah = get_ayah_num(row_cleaned[11])
                memo_to_surah = get_surah_name(row_cleaned[12])
                memo_from_ayah = get_ayah_num(row_cleaned[13])
                memo_from_surah = get_surah_name(row_cleaned[14])
                
                # Recitation (col 15-18)
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
                
    # Sort curriculum by session number
    curriculum.sort(key=lambda x: x["session"])
    
    # Write to JS file
    js_content = f"// This file is auto-generated from levels/children 2.pdf\nexport const children2Curriculum = {json.dumps(curriculum, ensure_ascii=False, indent=2)};\n"
    with open(r"f:\myprog\menasa\rowaq-app\src\data\children2.js", "w", encoding="utf-8") as out:
        out.write(js_content)
        
    print(f"Successfully processed {len(curriculum)} sessions for Level 2 Children.")
except Exception as e:
    import traceback
    print("Error:", e)
    traceback.print_exc()
