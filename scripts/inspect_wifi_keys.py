import json

with open('src/locales/en.json', 'r') as f:
    en = json.load(f)

for k in sorted(en.keys()):
    if 'wifi' in k:
        val = str(en[k])
        if any(term in val for term in ['WPA', 'WPA3', 'T:WPA', 'encryption', 'security', 'protocol']):
            print(f"KEY: {k}\nVAL: {val}\n")
