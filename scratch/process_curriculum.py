import json
import re

# Surah names from quranSurahs
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

# Sort by length descending to match longest names first (e.g. "الإخلاص" before "ص", "قريش" before "ق")
surah_names_sorted = sorted(surah_names, key=len, reverse=True)

indic_to_eng = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
}

def to_eng_digits(text):
    if not isinstance(text, str):
        text = str(text)
    for k, v in indic_to_eng.items():
        text = text.replace(k, v)
    return text

def parse_ayah_field(surah, ayah_field):
    surah = (surah or "").strip()
    ayah_field = (ayah_field or "").strip()
    
    if not surah or surah == "**" or surah == "":
        return {"fromSurah": "", "fromAyah": "", "toSurah": "", "toAyah": ""}
        
    from_surah = surah
    to_surah = surah
    from_ayah = ""
    to_ayah = ""
    
    # Check if ayah_field contains another Surah name (e.g. "١ - الإخلاص ٤")
    cross_surah = None
    for s_name in surah_names_sorted:
        if s_name in ayah_field:
            cross_surah = s_name
            break
            
    if cross_surah:
        to_surah = cross_surah
        # Extract numbers before and after cross_surah
        # Split by cross_surah
        parts = ayah_field.split(cross_surah)
        left = to_eng_digits(parts[0])
        right = to_eng_digits(parts[1]) if len(parts) > 1 else ""
        
        # Get first number in left
        left_nums = re.findall(r'\d+', left)
        if left_nums:
            from_ayah = int(left_nums[0])
            
        # Get first number in right
        right_nums = re.findall(r'\d+', right)
        if right_nums:
            to_ayah = int(right_nums[0])
    else:
        # Standard range like "١ - ٥" or "١ - **" or "١"
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

try:
    with open(r"f:\myprog\menasa\rowaq-app\scratch\excel_content.json", "r", encoding="utf-8") as f:
        data = json.load(f)
        
    all_rows = data.get("all_rows", [])
    curriculum = []
    
    # The first 3 rows are headers
    for row in all_rows:
        session_col = "توزيع منهج حفظ القرآن الكريم برنامج ( الأطفال / المستوى الأول ) (جزء عم)"
        session_val = row.get(session_col)
        
        # Check if it's a session row (integer value)
        try:
            session_num = int(float(str(session_val)))
        except ValueError:
            continue
            
        # Extract fields
        review_surah = row.get("Unnamed: 1", "")
        review_ayah = row.get("Unnamed: 2", "")
        memo_surah = row.get("Unnamed: 3", "")
        memo_ayah = row.get("Unnamed: 4", "")
        recent_surah = row.get("Unnamed: 5", "")
        recent_ayah = row.get("Unnamed: 6", "")
        
        # Parse fields
        review_parsed = parse_ayah_field(review_surah, review_ayah)
        memo_parsed = parse_ayah_field(memo_surah, memo_ayah)
        recent_parsed = parse_ayah_field(recent_surah, recent_ayah)
        
        curriculum.append({
            "session": session_num,
            "review": review_parsed,
            "memorization": memo_parsed,
            "recentReview": recent_parsed
        })
        
    # Write to JS file
    js_content = f"// This file is auto-generated from levels/children 1.xlsx\nexport const children1Curriculum = {json.dumps(curriculum, ensure_ascii=False, indent=2)};\n"
    with open(r"f:\myprog\menasa\rowaq-app\src\data\children1.js", "w", encoding="utf-8") as out:
        out.write(js_content)
        
    print(f"Successfully processed {len(curriculum)} sessions with length-sorted surah matching.")
except Exception as e:
    import traceback
    print("Error:", e)
    traceback.print_exc()
