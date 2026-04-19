import re

with open("src/components/guest/SplitBillScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# Make sure we don't have bg-ink everywhere
# Also text-glow -> text-text-primary or text-[var(--guest-accent,#997a3d)]
replacements = [
    # Bgs
    (r'bg-ink', 'bg-bg-solid'),
    (r'bg-panel', 'bg-bg-panel'),
    (r'bg-panel/40', 'bg-bg-panel'),
    (r'bg-panel/50', 'bg-bg-panel'),
    (r'bg-panel/60', 'bg-bg-panel'),
    (r'bg-panel/80', 'bg-bg-panel'),
    (r'bg-panel/90', 'bg-[var(--guest-bg-page,#faf8f5)]'),
    
    # Texts
    (r'text-light/10', 'text-text-primary/10'),
    (r'text-light/20', 'text-text-primary/20'),
    (r'text-light/40', 'text-text-muted'),
    (r'text-light/50', 'text-text-muted'),
    (r'text-light/60', 'text-text-muted'),
    (r'text-light/70', 'text-text-primary/70'),
    (r'text-light/80', 'text-text-primary/80'),
    (r'text-light/90', 'text-text-primary/90'),
    (r'text-light', 'text-text-primary'),
    
    (r'text-dim/40', 'text-text-muted/40'),
    (r'text-dim/50', 'text-text-muted/50'),
    (r'text-dim/60', 'text-text-muted/60'),
    (r'text-dim', 'text-text-muted'),
    
    (r'text-glow/40', 'text-[var(--guest-accent,#997a3d)]/40'),
    (r'text-glow/50', 'text-[var(--guest-accent,#997a3d)]/50'),
    (r'text-glow/60', 'text-[var(--guest-accent,#997a3d)]/60'),
    (r'text-glow/70', 'text-[var(--guest-accent,#997a3d)]/70'),
    (r'text-glow/80', 'text-[var(--guest-accent,#997a3d)]/80'),
    (r'text-glow', 'text-[var(--guest-accent,#997a3d)]'),

    # Borders
    (r'border-wire/20', 'border-border-main/50'),
    (r'border-wire/25', 'border-border-main/50'),
    (r'border-wire/40', 'border-border-main/80'),
    (r'border-wire/50', 'border-border-main'),
    (r'border-wire/60', 'border-border-main'),
    (r'border-wire', 'border-border-main'),

    (r'border-glow/20', 'border-[var(--guest-accent,#997a3d)]/40'),
    (r'border-glow/30', 'border-[var(--guest-accent,#997a3d)]/60'),
    (r'border-glow/50', 'border-[var(--guest-accent,#997a3d)]/80'),
    (r'border-glow', 'border-[var(--guest-accent,#997a3d)]'),

    # Dividers
    (r'divide-wire/30', 'divide-border-main/80'),
    (r'divide-wire/40', 'divide-border-main'),
    (r'divide-wire/50', 'divide-border-main'),
    (r'divide-wire', 'divide-border-main'),

    # Gradients and Glows -> Flats
    (r'bg-gradient-to-[a-z]+', ''), 
    (r'from-[a-zA-Z0-9/\-]+', ''), 
    (r'to-[a-zA-Z0-9/\-]+', ''),
    (r'shadow-\[0_0_12px_rgba\(22,163,74,0\.1\)\]', ''),
    (r'shadow-\[0_0_16px_rgba\(22,163,74,0\.15\)\]', 'shadow'),
    (r'shadow-glow/10', ''),
    (r'shadow-glow/20', ''),

    # Emerald replacement (if any remnants)
    (r'emerald-50', 'gold/5'),
    (r'emerald-100', 'gold/10'),
    (r'emerald-200', 'gold/20'),
    (r'emerald-300', 'gold/30'),
    (r'emerald-400', 'gold/60'),
    (r'emerald-500', 'gold'),
    (r'emerald-600', 'gold'),
    (r'emerald-700', 'gold'),
    (r'emerald-800', 'gold/80'),
    (r'emerald-900', 'gold/90'),
    (r'emerald-950', 'gold/95'),
]

for old, new in replacements:
    text = re.sub(old, new, text)

# Fix weird double spaces
text = re.sub(r'  +', ' ', text)

with open("src/components/guest/SplitBillScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)

