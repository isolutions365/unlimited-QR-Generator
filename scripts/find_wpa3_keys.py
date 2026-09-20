import json
import os

locales = ["en", "ar", "ur", "de", "es", "fr", "pt", "it", "tr", "id", "hi", "zh", "ja", "ko"]

print("=== Checking 14 locale json files for WPA3 / T:WPA ===")
for loc in locales:
    p = f"src/locales/{loc}.json"
    with open(p, "r", encoding="utf-8") as f:
        data = json.load(f)
    print(f"\n--- Locale: {loc} ---")
    for k, v in data.items():
        if "wifi" in k.lower():
            if any(term in str(v) for term in ["WPA3", "WPA/WPA2/WPA3", "T:WPA", "WPA"]):
                print(f"[{k}]: {v}")
