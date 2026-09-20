import re
import json

with open('src/pages/landing/SEOPage.tsx', 'r') as f:
    seo_page = f.read()

# Look for t() and getLocalized()
get_localized_patterns = re.findall(r'getLocalized\(`([^`]+)`', seo_page)
t_patterns = re.findall(r't\([\'"`]([^\'"`]+)[\'"`]', seo_page)

print("getLocalized patterns in SEOPage.tsx:")
for p in sorted(set(get_localized_patterns)):
    print(" ", p)

print("\nt patterns in SEOPage.tsx:")
for p in sorted(set(t_patterns)):
    print(" ", p)
