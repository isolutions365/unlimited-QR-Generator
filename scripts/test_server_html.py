import urllib.request
import json

locales = ["en", "ar", "ur", "de", "es", "fr", "pt", "it", "tr", "id", "hi", "zh", "ja", "ko"]
routes = ["", "wifi-qr-generator", "blog/static-vs-dynamic-qr-codes-guide"]

print("Server HTML Verification across 14 locales:")
for loc in locales:
    prefix = "" if loc == "en" else f"/{loc}"
    for r in routes:
        path = f"{prefix}/{r}".rstrip("/")
        if not path:
            path = "/"
        url = f"http://localhost:3000{path}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as res:
                code = res.getcode()
                html = res.read().decode('utf-8')
                
                # Check for lang and dir
                has_lang = f'lang="{loc}"' in html
                expected_dir = 'dir="rtl"' if loc in ['ar', 'ur'] else 'dir="ltr"'
                has_dir = expected_dir in html
                
                # Check title
                title_start = html.find('<title>')
                title_end = html.find('</title>')
                title = html[title_start+7:title_end] if title_start != -1 else "NO_TITLE"
                
                # Check for stale phrases
                has_stale = "without passwords" in html.lower() or "connect instantly" in html.lower()
                
                print(f"[{code}] {path:45} | lang: {has_lang} | dir: {has_dir} | Stale: {has_stale} | Title: {title[:45]}...")
        except Exception as e:
            print(f"[ERR] {path:45} | Error: {e}")
