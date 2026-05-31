import pandas as pd
import json

try:
    df = pd.read_excel(r"f:\myprog\menasa\rowaq-app\levels\children 1.xlsx")
    columns = df.columns.tolist()
    first_rows = df.head(10).fillna("").to_dict(orient='records')
    
    # Let's save all rows to see everything
    all_rows = df.fillna("").to_dict(orient='records')
    
    output = {
        "columns": columns,
        "first_rows": first_rows,
        "all_rows": all_rows
    }
    
    with open(r"f:\myprog\menasa\rowaq-app\scratch\excel_content.json", "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("Success writing json")
except Exception as e:
    import traceback
    with open(r"f:\myprog\menasa\rowaq-app\scratch\excel_content.json", "w", encoding="utf-8") as f:
        json.dump({"error": str(e), "traceback": traceback.format_exc()}, f)
    print("Error:", e)
