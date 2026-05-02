# Bouquet Design System

## Identidad Visual

Bouquet es un Hospitality OS con identidad floral, orgánica y elegante. La paleta rosa-vino con acentos salvia transmite calidez y sofisticación. El diseño alterna secciones claras (rosa-cream, blush) con secciones oscuras (burgundy, ink) para crear ritmo visual. Cada sección sigue un patrón consistente: **overline → headline serif → descripción → contenido**.

El sistema visual unifica tres contextos: la landing pública (light, editorial), el dashboard operativo (dark, funcional) y el menú QR del comensal (light/dark, inmersivo).

---

## Arquitectura de la Landing

La landing fluye en este orden exacto. Cada sección es un archivo en `src/components/landing/`:

| # | Componente | Fondo | Rol narrativo |
|---|-----------|-------|--------------|
| 1 | `TopBar` | Transparente → glass al scroll | Navegación fija con dos estados |
| 2 | `Hero` | Rose-cream + blobs difuminados | Propuesta de valor con mockups de producto |
| 3 | `Ticker` | Burgundy | Marquee horizontal con términos operativos |
| 4 | `Features` | Radial rosa pálido | "Cómo funciona" — 3 pilares con pétalos flotantes |
| 5 | `ProductSection` | `#1A0C11` (dark burgundy) | Dashboard oscuro + bento grid de facts |
| 6 | `ForWhoSection` | Radial blush → cream | 3 cartas asimétricas por segmento (restaurante, taquería, bar) |
| 7 | `SocialProof` | Burgundy | Carrusel de testimonios con animación direccional |
| 8 | `FaqSection` | Radial cream | FAQ accordion CSS + schema JSON-LD |
| 9 | `CtaBand` | `#FCF5F7` | Formulario glassmórfico con flores animadas |
| 10 | `Footer` | `#0A0406` (casi negro) | Footer premium con watermark masivo |

---

## Paleta de Colores

### Rampa Rosa (primaria)
| Token | Hex | Uso |
|-------|-----|-----|
| Rose-cream | `#FDF2F5` | Fondo principal, secciones claras |
| Rose-blush | `#F5D5DC` | Fondos secundarios, gradientes, tarjetas claras |
| Rose-pale | `#E8A5B0` | Destacados suaves, dark mode accent (`--glow`) |
| Rose-light | `#D68C9F` | Hover states |
| Rose | `#C75B7A` | CTAs, acentos, focus rings, brand pink |
| Rose-700 | `#C06A78` | Texto acentuado dentro de headlines serif |

### Rampa Vino (profundidad)
| Token | Hex | Uso |
|-------|-----|-----|
| Burgundy-light | `#6B2D42` | Hover states oscuros |
| Burgundy | `#4A1A2C` | Texto principal, fondos oscuros, botones |
| Burgundy-dark | `#2D0F1A` | Fondos muy oscuros |
| Ink | `#1A0F14` | Dashboard bg, footer, dark sections |
| Canvas | `#24151C` | Cards dark, superficies elevadas |
| Panel | `#2E1B24` | Paneles, sidebars |
| Wire | `#3D2430` | Bordes dark, divisores |

### Rampa Verde (salvia)
| Token | Hex | Uso |
|-------|-----|-----|
| Sage-muted | `#C5CCC2` | Bordes suaves, deshabilitado |
| Sage | `#A8B0A0` | Acentos alternativos, estados success |
| Sage-deep | `#8A9A84` | Variantes oscuras, indicadores de completado |

### Neutros cálidos
| Token | Hex | Uso |
|-------|-----|-----|
| Cream | `#FAF6F3` | Superficies elevadas, gradientes claros |
| Warm | `#E8DDD0` | Elementos neutros |
| Wheat | `#F0E6D6` | Fondos alternativos |

### Texto en Dark Mode
| Token | Hex | Uso |
|-------|-----|-----|
| Light | `#F5E6EB` | Texto principal sobre dark |
| Dim | `#A88B96` | Texto secundario sobre dark |

### Legacy Aliases (compatibilidad con código legacy)
```
charcoal → burgundy    |  gold → rose          |  ember → rose
ivory → rose-cream     |  champagne → warm     |  coffee → burgundy
```

### Dashboard UI Colors (segundo bloque `@theme`)
Colores específicos para la UI del dashboard operativo: `bg-solid`, `bg-card`, `bg-hover`, `bg-bar`, `border-main/mid/bright`, `text-primary/secondary/muted/dim/faint/void`, `dash-green/red/blue` con sus variantes `-bg`.

---

## Tipografía

### Familias
| Variable | Fuente | Rol |
|----------|--------|-----|
| `--font-sans` | DM Sans | Body, navegación, formularios, UI |
| `--font-serif` | Playfair Display / Cormorant Garamond | Headlines, títulos, citas, acentos en itálica |
| `--font-mono` | Space Mono | Números, precios, códigos, badges técnicos |

### Escala de la Landing (tamaños reales usados)
| Nivel | Tamaño | Uso |
|-------|--------|-----|
| Hero | `clamp(2.75rem, 5.5vw, 4.75rem)` a `lg:text-7xl` | Título principal del hero |
| Section | `clamp(2rem, 4vw, 3.5rem)` a `clamp(3.5rem, 6vw, 5rem)` | Headlines de sección |
| Card | `text-2xl` a `text-4xl` en `font-serif italic` | Nombres de features, nombres de segmentos |
| Body | `0.95rem` - `1.15rem` con `leading-[1.6]` - `leading-[1.8]` | Párrafos descriptivos |
| Nav | `text-[0.84rem]` a `text-[0.9375rem]` | Links de navegación, CTAs secundarios |
| Label | `text-[0.62rem]` - `text-[0.65rem]` | Overlines, badges, eyebrow tags |
| Micro | `text-[0.58rem]` - `text-[0.6rem]` | Meta-info en mockups |

### Convenciones Tipográficas
- **Overline**: `text-[0.62rem]` a `text-xs`, `font-bold`, `uppercase`, `tracking-[0.15em]` a `tracking-[0.35em]`. Inicia **toda** sección.
- **Headline serif**: `font-serif`, `font-medium` o `font-semibold`, frecuentemente `italic`. Color burgundy en light, white en dark.
- **Acento itálico dentro del headline**: sub-frase en `italic` con color contrastante (rose `#C06A78` en light, `#F472B6` en dark).
- **Mono para datos**: `font-mono tabular-nums` en precios, totales, números de mesa, KPIs.
- **Text-balance**: Usar `text-balance` en descripciones y `text-pretty` en párrafos largos.

---

## Secciones: Ritmo y Fondo

### Secciones Claras (light)
Fondo base: `bg-[radial-gradient(circle_at_top,#FDF2F5_0%,#F5D5DC_35%,#FAF6F3_100%)]` (definido en `page.tsx` como wrapper global)

Cada sección clara puede overridear el fondo con gradientes radiales específicos:
- **Features**: `radial-gradient(ellipse at center, #FDF0F4 0%, #F5E8ED 60%, #EDE0E6 100%)`
- **ForWho**: `radial-gradient(ellipse 120% 80% at 50% -20%, #FDF2F5 0%, #F5D5DC 40%, #FAF6F3 100%)`
- **FAQ**: `radial-gradient(ellipse 120% 80% at 50% -20%, #FDF2F5 0%, #FAF6F3 100%)`
- **CtaBand**: `bg-[#FCF5F7]`

### Secciones Oscuras (dark)
- **Ticker**: `bg-burgundy`, texto `white/80`, bordes `white/5`
- **ProductSection**: `bg-[#1A0C11]`, títulos `text-white`, descripciones `text-white/50`
- **SocialProof**: `bg-burgundy` con radial `rgba(201,80,100,0.08)` glow
- **PricingSection**: `bg-burgundy` con film grain overlay
- **Footer**: `bg-[#0A0406]` con radial `ellipse_at_bottom,#3A1624_0%,transparent_60%`

### Espaciado Vertical
- Secciones claras: `py-24 lg:py-32` a `py-28 lg:py-40`
- Secciones oscuras: `py-24 lg:py-32` a `py-28 lg:py-40`
- Hero: `pt-32 pb-20 lg:pt-44 lg:pb-28`
- Padding horizontal: `px-6 lg:px-10` o `px-6 lg:px-12`
- Container max-width: `max-w-7xl` (estándar), `max-w-[85rem]` (ancho), `max-w-5xl` (reducido)

---

## Sistema Floral Decorativo

Los assets florales son el sello visual de Bouquet. Se usan consistentemente como capas decorativas absolutas.

### Assets
```
src/assets/floral-assets/
├── branches/
│   ├── complete_2.png   → rama izquierda (Hero, CtaBand)
│   ├── complete_3.png   → rama derecha (Hero, CtaBand)
│   └── ...              → conectores (Features), fondos (SocialProof, Footer)
└── petals/
    └── petal-*.png      → pétalos flotantes (Features)
```

### Patrones de Posicionamiento
- **Absolute + negative offset**: `absolute -left-[5%] sm:-left-[10%] md:-left-[30%] lg:-left-[55%]` con rotación.
- **Tamaños responsivos masivos**: `w-[280px] sm:w-[350px] md:w-[500px] lg:w-[1600px]` — crecen con el viewport.
- **z-index**: Siempre `z-[2]` entre el fondo y el contenido interactivo.
- **Pointer-events-none**: Para no bloquear interacciones.

### Blend Modes
- `mix-blend-screen` — flores sobre fondos oscuros (Footer)
- `mix-blend-multiply` — grain/textura sobre fondos claros
- `mix-blend-overlay` — flores sutiles de fondo (SocialProof)
- `opacity-[0.04]` a `opacity-[0.2]` — flores decorativas de fondo
- `grayscale` + `sepia-[.2]` + `hue-rotate-[-20deg]` — filtros para integrar flores en dark mode

### Animación Floral
- **Hero**: GSAP fade + scale (0.9→1) al entrar
- **Features**: GSAP `random()` para pétalos con `sine.inOut` yoyo infinito
- **CtaBand**: GSAP `y:-15, rotation:2` con `sine.inOut` yoyo infinito
- **Footer**: Estático, `mix-blend-screen`

---

## Sistema Glassmórfico

Patrón recurrente para superficies premium:

```
bg-white/[opacity] backdrop-blur-xl ring-1 ring-[color]/[opacity]
```

### Niveles de Opacidad
| Nivel | Clase | Uso |
|-------|-------|-----|
| Sutil | `bg-white/30` | Fields de formulario (CtaBand) |
| Medio | `bg-white/40` | Contenedor del form (CtaBand) |
| Alto | `bg-white/60` | Botones secundarios, FAQ |
| Sólido-sutil | `bg-white/70` | Cards de features, Hero action cards |
|---|
| Dark sutil | `bg-white/[0.03]` | Cards dark, botones dark hover |
| Dark medio | `bg-white/[0.04]` | Pricing cards no destacadas |

### Ring / Borde
- Light: `ring-1 ring-burgundy/[0.06]`, `ring-rose-blush/30`, `ring-white/10`
- Dark: `ring-1 ring-white/5`, `ring-white/10`, `ring-1 ring-white/20`

### Sombras
- Light cards: `shadow-[0_1px_3px_rgba(74,26,44,0.05)]`, `shadow-md`
- Dark cards: `shadow-[0_32px_64px_-24px_rgba(0,0,0,0.8)]`
- Hero CTA: `shadow-[0_20px_40px_-20px_rgba(74,26,44,0.5)]`

---

## Componentes de la Landing

### TopBar — Navegación de dos estados
Dos modos según scroll:
1. **Top** (`scrollY < 40`): full-width, `bg-transparent`, padding amplio.
2. **Scrolled** (`scrollY > 40`): `rounded-full`, `bg-rose-cream/85`, `backdrop-blur-xl`, `max-w-[52rem]`, floating pill.

Transición CSS: `transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`.
Logo: `<BouquetLogo>` con `variant="dark"`. CTA: `bg-burgundy text-white rounded-full`.

### Hero — Mockups + Animación
Mockups en columna derecha con capas en z-index:
1. `hero-pink-circle` (fondo rosa circular `#F9D9E3`)
2. `hero-floral-left` / `hero-floral-right` (flores PNG)
3. `hero-mockup-phone` (guest app en iPhone frame)
4. `hero-mockup-ticket` (recibo con textura paper)
5. `hero-toast` (notificaciones flotantes)

**iPhone Frame**: Shell 3D con botones laterales, Dynamic Island, gradiente `from-[#f5e0e8] via-[#e8c8d4] to-[#dcb8c6]`, home indicator.
**Ticket Mockup**: Paper grain SVG (`feTurbulence`), `font-mono tabular-nums`, divisores dashed, split por comensal con avatares de colores, perforated edge dots.
**Escalado responsivo**: `scale-[0.65] sm:scale-[0.7] md:scale-[0.7] lg:scale-100` en container de mockups.

### Ticker — Marquee con velocidad reactiva
Dos filas opuestas, `bg-burgundy`, texto `text-[0.75rem] font-bold uppercase tracking-[0.35em]`. Items triplicados para loop seamless. GSAP `xPercent` con `ScrollTrigger` que ajusta `timeScale` según velocidad de scroll. Máscara de bordes: `mask-image: linear-gradient(to right, transparent 0, black 15%, black 85%, transparent 100%)`.

Separador visual: `///` en `text-rose`.

### Features — 3 pilares con decoración botánica
3 cartas (Mesas, Órdenes, Pagos) con:
- `font-serif italic` para nombres, `text-2xl..4xl`
- Iconos Lucide en mobile, línea decorativa `h-px w-8 bg-rose-800/15` → `w-12` en hover
- Pétalos flotantes: 5 PNG con GSAP `random()` values, `sine.inOut` yoyo
- Ramas esquineras: 3 PNG corner branches
- Conector floral: PNG horizontal entre header y cards

### ProductSection — Dashboard oscuro + bento grid
DashboardPreview con SVG line chart (`strokeDasharray="1"`, animado con GSAP ScrollTrigger) y donut chart (4 arcos con `strokeDasharray` porcentual). Colores: pink `#F472B6`, green `#A7F3D0`, pink-light `#FDA4AF`.

Bento grid md:12-column:
- Card grande "1 día": `col-span-7` con SVG clock decoration
- Card "+": `col-span-5` con texto de API abierta
- Card "Acompañamiento": `col-span-8` con descripción de soporte

Cards dark: `bg-white/0`, hover `bg-white/[0.03]`, `ring-1 ring-white/10`, `rounded-3xl`.

### ForWhoSection — Cartas asimétricas por segmento
Grid `lg:grid-cols-[1.1fr_1.6fr_0.8fr]` (la del centro es la más ancha). Cada carta tiene:
- Gradiente único: restaurante `#FFF0F4→#FCE3EA`, taquería `#FDF9F1→#F5EBE0`, bar `#F3F0FA→#E6E0F5`
- Ilustración PNG que desborda el contenedor (`max-w-none`, offsets negativos)
- GSAP hover: levanta/rota la ilustración (`y:-12`, `scale+rotate`)
- `rounded-[2rem]`, `shadow-sm → shadow-xl` al hacer hover del grupo
- `border border-white/60`

### SocialProof — Carrusel direccional
Testimonios con transición animada: quote out (`opacity:0, x:-30`), quote in (`x:30→0`). Navigation dots: `h-1.5`, activo `w-6 bg-rose`, inactivo `w-1.5 bg-white/20`. Decorative quote mark: `text-[6rem]..[8rem] text-rose/20` posición absoluta detrás del texto. `isAnimating` ref previene doble-clic.

Rama floral de fondo: `opacity-[0.04] mix-blend-overlay grayscale`.

### FaqSection — Accordion CSS + SEO
Grid `lg:grid-cols-[0.4fr_0.6fr]`. Header sticky: `lg:sticky lg:top-32 lg:self-start`. Accordion con `grid grid-rows-[0fr/1fr]` + `overflow-hidden` (sin JS para expand/colapsar). Botón `+` rota 45° al abrir. JSON-LD `FAQPage` schema inline.

### CtaBand — Formulario glassmórfico
- **Card**: `bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/50`
- **Sombra 3D**: card duplicada atrás con `translate-y-4 translate-x-4` + blur
- **Floating labels**: labels que transicionan de dentro del input a encima con `peer-focus:-translate-y-9 peer-focus:scale-85 peer-focus:text-rose`
- **Flores animadas**: dos PNG branches con GSAP yoyo `y:-15, rotate:2`
- **Submit states**: spinner SVG durante envío, checkmark `bg-rose/10 text-rose` en success

### Footer — Premium oscuro
- **Watermark**: `text-[25vw] font-serif font-bold text-white opacity-[0.03]` — "BOUQUET" gigante de fondo
- **Floral**: `mix-blend-screen sepia-[.2] hue-rotate-[-20deg]`
- **Status dot**: `bg-[#F472B6]` con ping animado (indicador "México · año")
- **Links**: underline reveal `h-[1px] w-0 bg-[#F472B6]` → `w-full` on hover
- **CTA card**: `rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-md`

---

## Sistema de Texturas / Ruido

### Film Grain (global)
Aplicado en `page.tsx` sobre toda la landing:
```html
<div class="pointer-events-none fixed inset-0 z-[1] opacity-[0.02] mix-blend-multiply"
     style="background-image: url('data:image/svg+xml,...feTurbulence...')" />
```

### Paper Grain (ticket)
En Hero `TicketMockup`: SVG `feTurbulence` con `opacity-[0.03]` sobre fondo blanco.

### Film Grain (pricing)
En `PricingSection`: SVG `feTurbulence` con `opacity-[0.03] mix-blend-screen background-attachment: fixed`.

---

## Sistema de Animación

### GSAP + ScrollTrigger (entradas de sección)
Cada sección usa `useGSAP` con `fromTo` y `ScrollTrigger`:
```js
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReducedMotion) {
  // set all elements to opacity:1, y:0, etc.
  return;
}
// timeline normal con ScrollTrigger
```

**Timing estándar**: trigger en `"top 85%"` o `"top 80%"`, stagger `0.06`-`0.15`, duración `0.6`-`0.8`s.

### GSAP vs Framer Motion
- **GSAP**: scroll-driven reveals, timelines complejos, marquee velocity, animaciones ambientales (pétalos, flores)
- **Framer Motion**: hover states, entrance variants, SVG path draws (`BouquetLogo`, `ProductMockup`)
- **Coexistencia**: GSAP para scroll, Framer Motion para interacción. No mezclar en el mismo elemento.

### Easing Curves
| Nombre | Curva | Uso |
|--------|-------|-----|
| power3.out | GSAP default | Reveals, fades |
| power2.in/out | GSAP | Transiciones de slide (SocialProof) |
| back.out(1.8) | GSAP | Pop-in de elementos (FloorPlan) |
| sine.inOut | GSAP | Ambient loops (pétalos, flores) |
| cubic-bezier(0.22, 1, 0.36, 1) | CSS/GSAP | Suave, elegante (default) |
| cubic-bezier(0.32, 0.72, 0, 1) | CSS/GSAP | Spring, con masa (TopBar, hover) |
| cubic-bezier(0.32, 0.72, 0.28, 1) | CSS/GSAP | Reveal dramático (view transitions) |

### CSS Keyframes (definidos en globals.css)
`fade-in`, `reveal-up`, `reveal-left`, `scale-in`, `marquee`, `marquee-reverse`, `float-gentle`, `petal-float-1/2`, `floatPetal`, `pulse-slow`, `tick-in`, `slide-from-bottom`, `slide-from-top`, `reveal-scale`, `draw-line`, `ticker`, `dash-row-enter`, `dash-stat-enter`.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
Toda animación JS verifica el media query antes de ejecutarse.

---

## Interacciones Hover

### Botones CTA
- `hover:bg-rose-light` — cambio de color
- `group-hover:translate-x-0.5` / `group-hover:translate-x-1` — flecha se desplaza
- `group-hover:scale-105` — ligero crecimiento
- `active:scale-95` — feedback táctil
- Gradiente sheen en hover: `bg-gradient-to-r from-transparent via-white/10 to-transparent` con `translateX`

### Links de navegación / texto
- Underline reveal: `h-[1px] w-0 bg-current` → `group-hover:w-full` con `transition-all duration-300`
- Color shift: `text-burgundy/65` → `text-burgundy`

### Tarjetas
- `hover:bg-white/[0.03]` en dark cards
- `group-hover:shadow-xl` en light cards (ForWho)
- Línea decorativa: `w-8` → `w-12` en hover (Features)
- Ilustraciones: `y:-12`, `scale: 1.02`, `rotate` (ForWho GSAP)

---

## Mockups y Previsualizaciones

### iPhone Frame (Hero)
Shell físico realista: botones laterales `bg-[#d4a5b5]`, marco gradiente rosa, Dynamic Island `bg-burgundy`, home indicator `bg-burgundy/20`.

### Receipt / Ticket (Hero)
Papel con textura noise, `font-mono tabular-nums`, divisores `border-dashed`, split de cuenta con avatares circulares de colores (rose, sky, amber, emerald), borde perforado con dots.

### Dashboard (ProductSection, DashboardSection, ProductMockup)
Gráficos SVG: line chart con `strokeDasharray`, donut chart con segmentos `circle`, KPIs en grid. Animación con ScrollTrigger `onEnter`.

### Floor Plan (FloorPlan)
SVG de salón con mesas que cambian de estado automáticamente (`setInterval`). Estados: open, active, steady, closing. Dots pulsantes con `<animate>` SVG. GSAP `back.out(1.8)` stagger.

---

## Formulario: Floating Labels

Patrón usado en `CtaBand`:
- Input con `peer` + label absoluto centrado
- `peer-focus:-translate-y-9 peer-focus:scale-85 peer-focus:text-rose` + `peer-valid` (mismo comportamiento cuando tiene contenido)
- `peer-focus:border-rose/40` en el input
- Transición: `transition-all duration-200`

---

## Grids y Layouts

### Grids usados en la landing
- **Hero**: `lg:grid-cols-[1fr_0.9fr]` (texto + mockups)
- **Features**: `grid lg:grid-cols-3` (3 cartas)
- **ForWho**: `lg:grid-cols-[1.1fr_1.6fr_0.8fr]` (asimétrico, la central más ancha)
- **FAQ**: `lg:grid-cols-[0.4fr_0.6fr]` (sticky header + contenido)
- **CtaBand**: `max-w-2xl lg:grid-cols-2` para form
- **Footer**: `grid-cols-1 lg:grid-cols-[1.5fr_1fr_1.2fr]` (3 columnas desiguales)
- **Pricing**: `lg:grid-cols-3` (3 tiers)
- **Bento (ProductSection)**: `md:grid-cols-12` con `col-span-7`, `col-span-5`, `col-span-8`

### Patrones de layout
- Centrado con `mx-auto` y `max-w-*` en todos los containers
- Secciones con `min-h-[80dvh]` a `min-h-[100dvh]` para presencia visual
- `flex-col justify-center` en cada sección para centrado vertical
- Padding horizontal responsivo: `px-6` mobile, `lg:px-10` o `lg:px-12` desktop

---

## Íconos y SVGs

### Fuentes de íconos
- **Lucide React** (`lucide-react`): íconos funcionales en Features, ForWho, FAQ, etc.
- **PNGs custom** (`@/assets/`): `mesa.png`, `campana.png`, `tarjeta.png`, `recibo.png`, `cuchillo_tenedor.png` — usados en Hero, pilares, toasts.
- **SVGs inline**: checkmarks, flechas, charts, clock faces, decorative lines.

### SVGs Decorativos
- **Flechas CTA**: `<svg>` inline con `strokeLinecap="round"` `strokeLinejoin="round"`, animadas con `group-hover:translate-x-0.5` y `transition-transform`.
- **Checkmarks**: `<path d="M4 10l4 4 8-8">` con `stroke="currentColor"`.
- **Divisores**: `EditorialDivider` con diamante + círculo central y líneas gradiente a los lados.

---

## BouquetLogo

Componente con dos variantes (`variant="dark"|"light"`) y 4 tamaños (`size="sm"|"md"|"lg"|"xl"`). El SVG combina:
- Trazo de "b" minúscula estilizada
- Flor rosa: 4 círculos concéntricos a diferentes opacidades
- Dos hojas/tallos
- Animación Framer Motion: draw del path (`pathLength: 0→1`), fade-in de hojas (`scale: 0→1`), spring en la flor

---

## Accesibilidad

- **Skip-to-content**: Link oculto (`sr-only`) que aparece en foco, primer elemento del DOM.
- **Focus rings**: `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose`.
- **Reduced motion**: Respetado en TODAS las animaciones (GSAP + Framer Motion + CSS keyframes). Ver sistema de animación.
- **Alt text**: `alt=""` para imágenes decorativas, descriptivo para contenido.
- **Contraste**: Burgundy `#4A1A2C` sobre Rose-cream `#FDF2F5` cumple WCAG AA (ratio ~10:1).
- **Semántica HTML**: `<header>`, `<main>`, `<section>`, `<footer>`, headings en orden jerárquico.

---

## Tokens Tailwind v4

```css
@theme {
  --color-burgundy: #4A1A2C;
  --color-burgundy-light: #6B2D42;
  --color-rose: #C75B7A;
  --color-rose-light: #D68C9F;
  --color-rose-pale: #E8A5B0;
  --color-rose-blush: #F5D5DC;
  --color-rose-cream: #FDF2F5;
  --color-sage: #A8B0A0;
  --color-sage-deep: #8A9A84;
  --color-sage-muted: #C5CCC2;
  --color-cream: #FAF6F3;
  --color-warm: #E8DDD0;
  --color-wheat: #F0E6D6;
  /* + dark mode tokens en segundo bloque @theme */
}
```

---

## Archivos Clave

| Archivo | Rol |
|---------|-----|
| `src/app/globals.css` | Tokens de color, keyframes, temas light/dark/guest |
| `src/app/layout.tsx` | Fuentes (DM Sans, Space Mono, Playfair Display), metadata |
| `src/app/page.tsx` | Composición de secciones de la landing, grain overlay |
| `src/components/landing/` | 18 componentes de la landing (ver tabla de arquitectura) |
| `src/assets/floral-assets/` | PNGs de ramas y pétalos |
| `components.json` | Configuración de shadcn/ui |

---

*Última actualización: Mayo 2026*
*Refleja la landing completa con 18 componentes y sistema de diseño unificado*
