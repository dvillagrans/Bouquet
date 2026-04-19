import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Replace emerald color classes with gold or dark theme equivalents
replacements = [
    (r'emerald-50', r'gold/5'),
    (r'emerald-100', r'gold/10'),
    (r'emerald-200', r'gold/20'),
    (r'emerald-300', r'gold/30'),
    (r'emerald-400', r'gold/60'),
    (r'emerald-500', r'gold'),
    (r'emerald-600', r'gold'),
    (r'emerald-700', r'gold'),
    (r'emerald-800', r'gold/80'),
    (r'emerald-900', r'gold/90'),
    (r'emerald-950', r'gold/95'),
]

for old, new in replacements:
    text = re.sub(old, new, text)

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
