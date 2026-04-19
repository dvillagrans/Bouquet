import re

with open("src/components/guest/MenuScreen.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. Remove Top Bar
top_bar_regex = r'\{\/\* ── TOP BAR ──(?:.|\n)*?<\/header>'
text = re.sub(top_bar_regex, '', text)

# 2. Modify QtyControl
qty_control_old = r'''function QtyControl\(\{
  qty,
  onAdd,
  onInc,
  onDec,
  name,
\}\: \{
  qty\: number;
  onAdd\: \(\) \=\> void;
  onInc\: \(\) \=\> void;
  onDec\: \(\) \=\> void;
  name\: string;
\}\) \{
  if \(qty \=\=\= 0\) \{
    return \(
      \<button
        onClick=\{onAdd\}
        aria\-label=\{\`Agregar \$\{name\}\`\}
        className\=\"flex h\-11 w\-11 items\-center justify\-center border border\-border\-main text\-text\-muted transition\-colors duration\-150 hover\:border\-gold\/60 hover\:text\-gold focus\-visible\:outline focus\-visible\:outline\-2 focus\-visible\:outline\-offset\-2 focus\-visible\:outline\-gold\"
      \>
        \<svg viewBox\=\"0 0 16 16\" fill\=\"none\" className\=\"h\-3 w\-3\" aria\-hidden\=\"true\"\>
          \<path d\=\"M8 3v10M3 8h10\" stroke\=\"currentColor\" strokeWidth\=\"1\.6\" strokeLinecap\=\"round\" \/\>
        \<\/svg\>
      \<\/button\>
    \);
  \}
  return \(
    \<div className\=\"flex items\-center\"\>
      \<button
        onClick=\{onDec\}
        aria\-label=\{\`Quitar uno de \$\{name\}\`\}
        className\=\"flex h\-11 w\-11 items\-center justify\-center border border\-gold\/40 text\-gold transition\-colors hover\:border\-gold focus\-visible\:outline focus\-visible\:outline\-2 focus\-visible\:outline\-offset\-2 focus\-visible\:outline\-gold\"
      \>
        \<svg viewBox\=\"0 0 16 16\" fill\=\"none\" className\=\"h\-3 w\-3\" aria\-hidden\=\"true\"\>
          \<path d\=\"M3 8h10\" stroke\=\"currentColor\" strokeWidth\=\"1\.6\" strokeLinecap\=\"round\" \/\>
        \<\/svg\>
      \<\/button\>
      \<span className\=\"w\-8 text\-center text\-\[0\.82rem\] font\-bold tabular\-nums text\-gold\"\>
        \{qty\}
      \<\/span\>
      \<button
        onClick=\{onInc\}
        aria\-label=\{\`Agregar otro de \$\{name\}\`\}
        className\=\"flex h\-11 w\-11 items\-center justify\-center border border\-gold\/40 text\-gold transition\-colors hover\:border\-gold focus\-visible\:outline focus\-visible\:outline\-2 focus\-visible\:outline\-offset\-2 focus\-visible\:outline\-gold\"
      \>
        \<svg viewBox\=\"0 0 16 16\" fill\=\"none\" className\=\"h\-3 w\-3\" aria\-hidden\=\"true\"\>
          \<path d\=\"M8 3v10M3 8h10\" stroke\=\"currentColor\" strokeWidth\=\"1\.6\" strokeLinecap\=\"round\" \/\>
        \<\/svg\>
      \<\/button\>
    \<\/div\>
  \);
\}'''

qty_control_new = r'''function QtyControl({
  qty,
  onAdd,
  onInc,
  onDec,
  name,
}: {
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  name: string;
}) {
  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        aria-label={`Agregar ${name}`}
        className="flex h-8 px-4 items-center justify-center border border-border-main text-text-muted transition-colors duration-150 hover:border-gold hover:text-gold text-[0.65rem] font-bold uppercase tracking-widest rounded-full"
      >
        Agregar
      </button>
    );
  }
  return (
    <div className="flex items-center border border-border-main rounded-full h-8 overflow-hidden">
      <button
        onClick={onDec}
        aria-label={`Quitar uno de ${name}`}
        className="flex h-full w-8 items-center justify-center text-text-muted transition-colors hover:text-gold hover:bg-gold/5"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-8 text-center text-[0.7rem] font-bold tabular-nums text-text-primary">
        {qty}
      </span>
      <button
        onClick={onInc}
        aria-label={`Agregar otro de ${name}`}
        className="flex h-full w-8 items-center justify-center text-text-muted transition-colors hover:text-gold hover:bg-gold/5"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}'''

text = re.sub(qty_control_old, qty_control_new, text)

# Lower all excessive uppercase tracking
replacements = {
    r'text-\[0.6rem\] font-bold uppercase tracking-\[0.3em\]': r'text-[0.7rem] text-text-muted',
    r'text-\[0.54rem\] font-bold uppercase tracking-\[0.44em\]': r'text-[0.7rem] text-text-muted',
    r'font-bold uppercase tracking-\[0.28em\]': r'font-medium text-text-muted',
    r'font-bold uppercase tracking-\[0.22em\]': r'font-medium tracking-wide',
    r'font-bold uppercase tracking-\[0.1em\]': r'font-medium',
    r'font-bold uppercase tracking-\[0.14em\]': r'font-medium text-[0.6rem]',
    r'tracking-\[0.16em\]': r'tracking-wider',
    r'tracking-\[0.12em\]': r'tracking-widest',
    r'border border-wire bg-panel/40 p-6 backdrop-blur-sm': r'bg-bg-solid border border-border-main p-6 shadow-sm',
    r'active\.length \=\=\= 0 \? "bg-gold text-bg-solid" \: "border border-border-main text-text-muted hover:border-border-bright/20 hover:text-text-primary"': r'active.length === 0 ? "bg-text-primary text-bg-solid hover:bg-white" : "border border-border-main text-text-muted hover:text-text-primary"',
    r'bg-gold py-4 text-center text-\[0.72rem\] font-bold uppercase tracking-\[0.22em\] text-bg-solid': r'bg-text-primary border border-text-primary py-4 text-center text-[0.75rem] font-bold text-bg-solid',
    # Less shadow
    r'shadow-\[0_4px_24px_rgba\(0,0,0,0\.4\)\]': r'shadow-md',
    r'bg-bg-card\/30': r'bg-bg-solid/50',
    # Top info simplification
    r'Sesión activa': r'',
    r'Anfitrión': r'Anfitrión',
    r'Mesa \{tableCode\}': r'Mesa {tableCode}',
    r'border border-wire px-3 py-1': r'border border-border-main px-3 py-1 rounded',
}

for old, new in replacements.items():
    text = text.replace(old, new)


# Simplify the heading typography and spacing padding
text = text.replace('font-serif text-[clamp(2rem,5vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-text-primary', 'font-serif text-[clamp(2.5rem,6vw,4rem)] font-normal leading-none text-text-primary')
text = text.replace('pb-8 pt-10', 'pb-4 pt-12 border-b-0')

with open("src/components/guest/MenuScreen.tsx", "w", encoding="utf-8") as f:
    f.write(text)
