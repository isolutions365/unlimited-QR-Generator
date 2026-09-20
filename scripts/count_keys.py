import json

# Let's flatten the SEODatabase and AEOData wifi-qr-generator entries
# Let's parse them or extract from ts

with open('src/pages/landing/SEODatabase.ts', 'r') as f:
    seo_code = f.read()

with open('src/pages/landing/AEOData.ts', 'r') as f:
    aeo_code = f.read()

# Let's extract the exact keys that SEOPage.tsx uses for a landing page:
# 1. seo.landing.wifi-qr-generator.seoTitle
# 2. seo.landing.wifi-qr-generator.metaDescription
# 3. seo.landing.wifi-qr-generator.keyword
# 4. seo.landing.wifi-qr-generator.h1
# 5. seo.landing.wifi-qr-generator.intro.title
# 6. seo.landing.wifi-qr-generator.intro.text1
# 7. seo.landing.wifi-qr-generator.intro.text2
# 8. seo.landing.wifi-qr-generator.intro.highlight
# 9. seo.landing.wifi-qr-generator.benefits.title
# 10. seo.landing.wifi-qr-generator.benefits.desc
# 11-15. seo.landing.wifi-qr-generator.benefits.items.0.title, desc ... 4.title, desc (5 items = 10 keys)
# 16. seo.landing.wifi-qr-generator.features.title
# 17. seo.landing.wifi-qr-generator.features.desc
# 18-22. seo.landing.wifi-qr-generator.features.items.0.title, desc ... 4.title, desc (5 items = 10 keys)
# 23-30. seo.landing.wifi-qr-generator.faqs.0.q, a ... 7.q, a (8 faqs = 16 keys)
# 31. seo.landing.wifi-qr-generator.cta.title
# 32. seo.landing.wifi-qr-generator.cta.subtitle
# 33. seo.landing.wifi-qr-generator.cta.buttonText

# And for AEO:
# 34. aeo.landing.wifi-qr-generator.quickDefinition
# 35. aeo.landing.wifi-qr-generator.aiSummary50
# 36. aeo.landing.wifi-qr-generator.whatIsIt
# 37. aeo.landing.wifi-qr-generator.whenToUse
# 38-41. aeo.landing.wifi-qr-generator.benefits.0, 1, 2, 3 (4 keys)
# 42-45. aeo.landing.wifi-qr-generator.commonMistakes.0, 1, 2, 3 (4 keys)
# 46-48. aeo.landing.wifi-qr-generator.bestPractices.0, 1, 2 (3 keys)
# 49-51. aeo.landing.wifi-qr-generator.keyTakeaways.0, 1, 2 (3 keys)
# 52-54. aeo.landing.wifi-qr-generator.faqs.0.q, a, 1.q, a, 2.q, a (3 faqs = 6 keys)
# 55. aeo.landing.wifi-qr-generator.aiSummaryBox.entityType
# 56. aeo.landing.wifi-qr-generator.aiSummaryBox.protocolStandard
# 57. aeo.landing.wifi-qr-generator.aiSummaryBox.clientCompatibility
# 58. aeo.landing.wifi-qr-generator.aiSummaryBox.primaryUseCase
# 59. aeo.landing.wifi-qr-generator.aiSummaryBox.offlineCapability

# Let's count them:
print("Counting total keys:")
seo_keys = [
    "seo.landing.wifi-qr-generator.seoTitle",
    "seo.landing.wifi-qr-generator.metaDescription",
    "seo.landing.wifi-qr-generator.keyword",
    "seo.landing.wifi-qr-generator.h1",
    "seo.landing.wifi-qr-generator.intro.title",
    "seo.landing.wifi-qr-generator.intro.text1",
    "seo.landing.wifi-qr-generator.intro.text2",
    "seo.landing.wifi-qr-generator.intro.highlight",
    "seo.landing.wifi-qr-generator.benefits.title",
    "seo.landing.wifi-qr-generator.benefits.desc",
]
for i in range(5):
    seo_keys.append(f"seo.landing.wifi-qr-generator.benefits.items.{i}.title")
    seo_keys.append(f"seo.landing.wifi-qr-generator.benefits.items.{i}.desc")

seo_keys.extend([
    "seo.landing.wifi-qr-generator.features.title",
    "seo.landing.wifi-qr-generator.features.desc",
])
for i in range(5):
    seo_keys.append(f"seo.landing.wifi-qr-generator.features.items.{i}.title")
    seo_keys.append(f"seo.landing.wifi-qr-generator.features.items.{i}.desc")

for i in range(8):
    seo_keys.append(f"seo.landing.wifi-qr-generator.faqs.{i}.q")
    seo_keys.append(f"seo.landing.wifi-qr-generator.faqs.{i}.a")

seo_keys.extend([
    "seo.landing.wifi-qr-generator.cta.title",
    "seo.landing.wifi-qr-generator.cta.subtitle",
    "seo.landing.wifi-qr-generator.cta.buttonText",
])

aeo_keys = [
    "aeo.landing.wifi-qr-generator.quickDefinition",
    "aeo.landing.wifi-qr-generator.aiSummary50",
    "aeo.landing.wifi-qr-generator.whatIsIt",
    "aeo.landing.wifi-qr-generator.whenToUse",
]
for i in range(4):
    aeo_keys.append(f"aeo.landing.wifi-qr-generator.benefits.{i}")
for i in range(4):
    aeo_keys.append(f"aeo.landing.wifi-qr-generator.commonMistakes.{i}")
for i in range(3):
    aeo_keys.append(f"aeo.landing.wifi-qr-generator.bestPractices.{i}")
for i in range(3):
    aeo_keys.append(f"aeo.landing.wifi-qr-generator.keyTakeaways.{i}")
for i in range(3):
    aeo_keys.append(f"aeo.landing.wifi-qr-generator.faqs.{i}.q")
    aeo_keys.append(f"aeo.landing.wifi-qr-generator.faqs.{i}.a")

aeo_keys.extend([
    "aeo.landing.wifi-qr-generator.aiSummaryBox.entityType",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.protocolStandard",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.clientCompatibility",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.primaryUseCase",
    "aeo.landing.wifi-qr-generator.aiSummaryBox.offlineCapability",
])

all_wifi_keys = seo_keys + aeo_keys
print(f"Total SEO keys: {len(seo_keys)}")
print(f"Total AEO keys: {len(aeo_keys)}")
print(f"Total WiFi keys: {len(all_wifi_keys)}")
