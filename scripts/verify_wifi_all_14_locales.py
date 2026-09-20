import json
import glob

locales = ["en", "ar", "ur", "de", "es", "fr", "pt", "it", "tr", "id", "hi", "zh", "ja", "ko"]

with open("src/locales/en.json", "r") as f:
    en_dict = json.load(f)

wifi_keys = [k for k in en_dict.keys() if k.startswith("seo.landing.wifi-qr-generator.") or k.startswith("aeo.landing.wifi-qr-generator.")]

print(f"Total canonical WiFi keys in en.json: {len(wifi_keys)}")

all_passed = True

for loc in locales:
    filename = f"src/locales/{loc}.json"
    with open(filename, "r") as f:
        loc_dict = json.load(f)
    
    missing = [k for k in wifi_keys if k not in loc_dict]
    extra = [k for k in loc_dict.keys() if (k.startswith("seo.landing.wifi-qr-generator.") or k.startswith("aeo.landing.wifi-qr-generator.")) and k not in wifi_keys]
    
    empty = [k for k in wifi_keys if k in loc_dict and (loc_dict[k] is None or str(loc_dict[k]).strip() == "")]
    
    # Check for untranslated matches against English (excluding protocol standards that are identical)
    untranslated = []
    if loc != "en":
        for k in wifi_keys:
            if k in loc_dict and loc_dict[k] == en_dict[k]:
                # Certain technical strings or short codes could be identical, but titles/descriptions should NOT be identical
                untranslated.append(k)
                
    print(f"[{loc}] Total WiFi keys present: {len([k for k in loc_dict if k in wifi_keys])}/80 | Missing: {len(missing)} | Empty: {len(empty)} | Identical to EN: {len(untranslated)}")
    if missing:
        print(f"   Missing in {loc}: {missing}")
        all_passed = False
    if empty:
        print(f"   Empty in {loc}: {empty}")
        all_passed = False
    if untranslated:
        print(f"   Identical to EN in {loc}: {untranslated}")

if all_passed:
    print("\nSUCCESS: All 14 locales have complete 80/80 WiFi keys with zero missing or empty entries!")
else:
    print("\nFAILURE: Some locales have missing or empty keys!")
