import re

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

for slug in target_slugs:
    idx = text.find(f"'{slug}':")
    if idx == -1:
        print(f"=== {slug} === NOT FOUND")
        continue
    sub = text[idx:idx+1500]
    title_m = re.search(r"seoTitle\s*:\s*['\"]([^'\"]+)['\"]", sub)
    desc_m = re.search(r"metaDescription\s*:\s*['\"]([^'\"]+)['\"]", sub)
    h1_m = re.search(r"h1\s*:\s*['\"]([^'\"]+)['\"]", sub)
    print(f"=== {slug} ===")
    print("seoTitle:", title_m.group(1) if title_m else "NONE")
    print("metaDescription:", desc_m.group(1) if desc_m else "NONE")
    print("h1:", h1_m.group(1) if h1_m else "NONE")
