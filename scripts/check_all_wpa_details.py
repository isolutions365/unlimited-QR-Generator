import json
import glob
import os

print("=== 1. Checking en.json for all wifi keys ===")
with open("src/locales/en.json", "r") as f:
    en = json.load(f)

for k, v in en.items():
    if "wifi" in k.lower() and ("wpa" in str(v).lower() or "encryption" in str(v).lower() or "security" in str(v).lower()):
        print(f"[{k}]:\n  {v}\n")

print("\n=== 2. Checking SEODatabase.ts / AEOData.ts / server/seo.ts / faq json ===")

files_to_check = [
    "src/components/landing/SEODatabase.ts",
    "src/pages/landing/SEODatabase.ts",
    "src/components/landing/AEOData.ts",
    "src/pages/landing/AEOData.ts",
    "server/seo.ts",
    "src/locales/faq/en.json",
    "src/data/templatePagesData.ts"
]

for fpath in files_to_check:
    if os.path.exists(fpath):
        with open(fpath, "r") as f:
            lines = f.readlines()
            for idx, line in enumerate(lines):
                if any(x in line for x in ["WPA3", "WPA/WPA2/WPA3", "T:WPA"]):
                    print(f"{fpath}:{idx+1}: {line.strip()}")
