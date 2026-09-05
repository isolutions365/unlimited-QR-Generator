import json, re

target_slugs = [
    'restaurant-menu-qr-generator',
    'digital-card-qr-generator',
    'pdf-sharing-qr-generator',
    'animated-qr-generator',
    'payment-qr-generator',
    'crypto-qr-generator'
]

with open('src/pages/landing/SEODatabase.ts') as f:
    text = f.read()

faqs_map = {}

for slug in target_slugs:
    idx = text.find(f"'{slug}':")
    if idx != -1:
        sub = text[idx:idx+4500]
        f_idx = sub.find("faqs: [")
        if f_idx != -1:
            f_end = sub.find("    ],", f_idx)
            if f_end == -1:
                f_end = sub.find("],", f_idx)
            faqs_str = sub[f_idx+6:f_end+1]
            qs = re.findall(r"q:\s*['\"]([^'\"]+)['\"]", faqs_str)
            ans = re.findall(r"a:\s*['\"]([^'\"]+)['\"]", faqs_str)
            faqs_map[slug] = [{"q": q, "a": a} for q, a in zip(qs, ans)]

print(json.dumps(faqs_map, indent=2))
