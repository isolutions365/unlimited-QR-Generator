import json

locales = ["en", "ar", "ur", "de", "es", "fr", "pt", "it", "tr", "id", "hi", "zh", "ja", "ko"]

keys_to_check = [
    "seo.landing.wifi-qr-generator.benefits.items.1.desc",
    "seo.landing.wifi-qr-generator.features.items.1.desc",
    "seo.landing.wifi-qr-generator.steps.items.1.desc",
    "seo.landing.wifi-qr-generator.faqs.4.a"
]

for loc in locales:
    p = f"src/locales/{loc}.json"
    with open(p, "r", encoding="utf-8") as f:
        d = json.load(f)
    print(f"\n================ Locale: {loc} ================")
    for k in keys_to_check:
        print(f"[{k}]:\n  {d.get(k, 'MISSING')}")
