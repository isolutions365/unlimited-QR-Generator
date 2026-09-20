import json

with open("src/locales/hi.json", "r") as f:
    d = json.load(f)

d["seo.landing.wifi-qr-generator.features.items.2.desc"] = "गैर-प्रसारित नेटवर्क के लिए पेलोड में H:true जोड़ा जाता है ताकि संगत स्कैनर इसे खोज सकें।"

with open("src/locales/hi.json", "w") as f:
    json.dump(d, f, indent=2, ensure_ascii=False)

print("Polished hi.json string!")
