import json

with open('src/pages/landing/SEODatabase.ts') as f:
    seo_content = f.read()

with open('src/pages/landing/AEOData.ts') as f:
    aeo_content = f.read()

# Let's see the keys from en.json or how SEODatabase defines them
print("SEODatabase keys structure:")
import re
# Find wifi-qr-generator block in SEODatabase
wifi_seo_start = seo_content.find("'wifi-qr-generator':")
wifi_seo_end = seo_content.find("'email-qr-generator':", wifi_seo_start)
print(seo_content[wifi_seo_start:wifi_seo_start+500])

wifi_aeo_start = aeo_content.find("'wifi-qr-generator':")
wifi_aeo_end = aeo_content.find("'email-qr-generator':", wifi_aeo_start)
print(aeo_content[wifi_aeo_start:wifi_aeo_start+500])
