import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

replacements = {
    # Typography
    r'text-light': r'text-text-primary',
    r'text-dim': r'text-text-muted',
    r'text-glow': r'text-gold',
    r'text-sage-deep': r'text-dash-green',
    
    r'border-wire': r'border-border-main',
    r'border-glow': r'border-gold',
    r'border-sage-deep': r'border-dash-green',
    r'border-light': r'border-border-bright',
    
    r'bg-ink': r'bg-bg-solid',
    r'bg-panel': r'bg-bg-card',
    r'bg-wire': r'bg-border-main',
    r'bg-glow': r'bg-gold',
    r'bg-sage-deep': r'bg-dash-green',
    
    r'hover:text-glow': r'hover:text-gold',
    r'hover:text-light': r'hover:text-text-primary',
    r'hover:border-glow': r'hover:border-gold',
    r'hover:border-light': r'hover:border-border-bright',
    
    r'outline-glow': r'outline-gold',
    
    # Shadows
    r'shadow-lg': r'shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
    
    r'text-ink': r'text-bg-solid',
}

for old, new in replacements.items():
    text = re.sub(r'\b' + old + r'(?=-|/|\\b|)', new, text)    
    # Wait, simple replace won't work well due to suffixes like `/40`. Actually, simple replace is fine since text-dim/40 just becomes text-text-muted/40 
    
def repl_simple(t):
    for o, n in replacements.items():
        t = t.replace(o, n)
    return t
    

text = repl_simple(text)

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
