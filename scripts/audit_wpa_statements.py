import json
import os

print("=== SEARCHING ALL OCCURRENCES OF WPA3 and T:WPA IN REPO ===")

hits = []
for root, dirs, files in os.walk("."):
    if any(x in root for x in ["node_modules", ".git", "dist", "scripts"]):
        continue
    for file in files:
        if file.endswith((".ts", ".tsx", ".json", ".js", ".jsx", ".html")):
            p = os.path.join(root, file)
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    if "wpa3" in line.lower() or "t:wpa" in line or "wpa/wpa2/wpa3" in line.lower():
                        hits.append((p, i + 1, line.strip()))

for p, line_no, content in hits:
    print(f"{p}:{line_no}: {content}")

print(f"\nTotal occurrences found: {len(hits)}")
