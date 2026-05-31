import os
import re
import json
from collections import Counter

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

data_dir = r"f:\myprog\menasa\rowaq-app\src\data"
files = [f for f in os.listdir(data_dir) if (f.startswith("children") or f.startswith("seniors")) and f.endswith(".js")]

surah_set = set(surah_names)
invalid_names = []

for filename in files:
    filepath = os.path.join(data_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
        
    start = content.find("[")
    end = content.rfind("]")
    if start == -1 or end == -1:
        continue
        
    array_str = content[start:end+1]
    try:
        data = json.loads(array_str)
    except Exception as e:
        continue
        
    for item in data:
        for section in ["review", "memorization", "recentReview", "distantReview"]:
            sec_data = item.get(section, {})
            for key in ["fromSurah", "toSurah"]:
                val = sec_data.get(key)
                if val and val != "":
                    if val not in surah_set:
                        invalid_names.append(val)

counter = Counter(invalid_names)
print(f"Unique invalid Surah names count: {len(counter)}")
print("Top 100 invalid Surah names:")
for val, count in counter.most_common(100):
    print(f"  {repr(val)}: {count}")

# Write to file
with open("scratch/invalid_surahs_list.txt", "w", encoding="utf-8") as out:
    for val, count in counter.most_common():
        out.write(f"'{val}': {count}\n")
