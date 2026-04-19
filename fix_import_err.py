import re

with open("src/components/guest/SplitBillScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# remove duplicate import
text = text.replace(r'import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";\nimport { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";', r'import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";')

with open("src/components/guest/SplitBillScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
