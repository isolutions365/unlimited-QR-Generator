import os
import glob

search_terms = [
    "Connect Instantly without Passwords",
    "connect instantly without passwords",
    "without passwords"
]

results = []
for root, dirs, files in os.walk("."):
    if "node_modules" in root or ".git" in root or "dist" in root or "scripts" in root:
        continue
    for file in files:
        if file.endswith((".ts", ".tsx", ".json", ".js", ".jsx", ".html")):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                for term in search_terms:
                    if term in content:
                        results.append((path, term))

print("Search results:")
for r in results:
    print(r)
if not results:
    print("Zero occurrences of banned/stale phrases found!")
