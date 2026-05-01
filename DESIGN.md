sigu# Bouquet Design System

## Identidad Visual

Bouquet es una plataforma de hospitalidad (Hospitality OS) con una identidad visual floral, orgánica y elegante. El diseño transmite calidez, feminidad y sofisticación a través de una paleta rosa-vino con acentos salvia.

---

## Paleta de Colores

### Primarios
| Token | Hex | Uso |
|-------|-----|-----|
| Burgundy | `#4A1A2C` | Texto principal, fondos oscuros, elementos de marca |
| Rose | `#C75B7A` | Acento principal, CTAs, estados activos, indicadores |
| Rose Light | `#D68C9F` | Hover states, gradientes |
| Rose Pale | `#E8A5B0` | Destacados suaves, dark mode primary |
| Rose Blush | `#F5D5DC` | Fondos secundarios, tarjetas, separadores |
| Rose Cream | `#FDF2F5` | Fondo principal (light mode) |

### Secundarios
| Token | Hex | Uso |
|-------|-----|-----|
| Sage | `#A8B0A0` | Acentos alternativos, estados success, naturaleza |
| Sage Deep | `#8A9A84` | Variantes oscuras de sage |
| Sage Muted | `#C5CCC2` | Bordes suaves, deshabilitado |
| Cream | `#FAF6F3` | Superficies elevadas |
| Warm | `#E8DDD0` | Elementos neutros cálidos |
| Wheat | `#F0E6D6` | Gradientes, fondos alternativos |

### Dark Mode
| Token | Hex | Uso |
|-------|-----|-----|
| Ink | `#1A0F14` | Fondo principal oscuro |
| Canvas | `#24151C` | Tarjetas, superficies elevadas |
| Panel | `#2E1B24` | Paneles, sidebars |
| Wire | `#3D2430` | Bordes, divisores |
| Light | `#F5E6EB` | Texto principal oscuro |
| Dim | `#A88B96` | Texto secundario oscuro |
| Glow | `#E8A5B0` | Acentos en dark mode |

### Legacy Aliases (para compatibilidad)
- `--color-charcoal` → `--color-burgundy`
- `--color-gold` → `--color-rose`
- `--color-ember` → `--color-rose`
- `--color-ivory` → `--color-rose-cream`
- `--color-champagne` → `--color-warm`
- `--color-coffee` → `--color-burgundy`

---

## Tipografía

### Familias
| Rol | Fuente | Variable | Uso |
|-----|--------|----------|-----|
| Principal / UI | DM Sans | `--font-sans` | Body text, navegación, formularios, dashboards |
| Logo / Mono | Space Mono | `--font-mono` | Badges, código, números de mesa, etiquetas técnicas |
| Acento / Display | Playfair Display | `--font-serif` | Headlines, títulos de sección, citas, énfasis en itálica |

### Escala Sugerida
| Token | Tamaño | Uso |
|-------|--------|-----|
| Display | `clamp(2.75rem, 5.5vw, 4.75rem)` | Hero headlines |
| H1 | `clamp(1.85rem, 3vw, 2.65rem)` | Section titles |
| H2 | `1.65rem` | Card titles |
| H3 | `text-base` | Subsection headings |
| Body | `1.02rem - 1.08rem` | Párrafos, descripciones |
| Small | `0.78rem - 0.96rem` | Labels, captions, metadata |
| Micro | `0.58rem - 0.62rem` | Badges, eyebrow tags, overlines |

### Estilos Tipográficos
- **Eyebrow tags**: `uppercase`, `tracking-[0.3em]`, `font-bold`, `text-[0.62rem]`, `text-burgundy/38`
- **Serif headlines**: `font-serif`, `font-semibold`, `italic` para acentos
- **Mono numbers**: `font-mono`, `tabular-nums` para mesas, totales, códigos

---

## Espaciado y Radios

| Token | Valor | Uso |
|-------|-------|-----|
| radius | `0.75rem` | Base radius (12px) |
| radius-sm | `calc(var(--radius) * 0.6)` | ~7px |
| radius-md | `calc(var(--radius) * 0.8)` | ~9.5px |
| radius-lg | `var(--radius)` | 12px |
| radius-xl | `calc(var(--radius) * 1.4)` | ~16.8px |
| radius-2xl | `calc(var(--radius) * 1.8)` | ~21.6px |
| radius-3xl | `calc(var(--radius) * 2.2)` | ~26.4px |
| radius-4xl | `calc(var(--radius) * 2.6)` | ~31.2px |

### Espaciado de Secciones
- Mobile: `py-16` - `py-24`
- Desktop: `py-28` - `py-40`
- Grid gaps: `gap-6` - `gap-12`

---

## Componentes Clave

### Botones
- Primary: `bg-rose text-white rounded-lg`
- Secondary: `bg-rose-blush text-burgundy rounded-lg`
- Ghost: `hover:bg-rose-blush/50`
- Destructive: `bg-destructive/10 text-destructive`

### Tarjetas
- Light: `bg-white border border-burgundy/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]`
- Dark: `bg-canvas border border-white/5`
- Radius preferido: `rounded-xl` a `rounded-[1.75rem]`

### Badges / Eyebrow Tags
- Pill shape: `rounded-full px-3 py-1`
- Uppercase, wide tracking
- Background: `bg-rose-blush` o `bg-burgundy/5`

---

## Modos de Tema

### Light Mode
- Fondo: `--color-rose-cream` (#FDF2F5)
- Superficie: `--color-card` (#FFFFFF)
- Texto: `--color-burgundy` (#4A1A2C)
- Acento: `--color-rose` (#C75B7A)

### Dark Mode
- Fondo: `--color-ink` (#1A0F14)
- Superficie: `--color-canvas` (#24151C)
- Texto: `--color-light` (#F5E6EB)
- Acento: `--color-glow` (#E8A5B0)

### Guest Theme (Menú QR)
- Light: Fondo rosa muy pálido, acento rosa
- Dark: Fondo burgundy oscuro, acento rosa claro

---

## Ilustraciones y Gráficos

- Estilo: Acuarela, orgánico, floral
- Motivos: Flores silvestres, hojas, elementos botánicos
- Paleta de ilustración: Tonos rosas, verdes salvia, beige
- Aplicaciones: Logo, badges, fondos decorativos, iconografía custom

---

## Animaciones y Movimiento

### Curvas de Easing
- Principal: `cubic-bezier(0.22, 1, 0.36, 1)` — suave, elegante
- Spring: `cubic-bezier(0.32, 0.72, 0, 1)` — con masa
- Reveal: `cubic-bezier(0.32, 0.72, 0.28, 1)` — entrada dramática

### Patrones
- **Fade-up reveal**: `translateY(16-28px)` → `0`, `opacity 0` → `1`
- **Scale-in**: `scale(0.96)` → `1`
- **Stagger**: delays de `100ms` entre elementos hermanos
- **Marquee**: `translateX(0)` → `translateX(-50%)`
- **Float**: `translateY(-10px)` oscilación suave

### Duraciones
- Micro-interacciones: `200-300ms`
- Transiciones de estado: `300-500ms`
- Revelaciones de sección: `600-800ms`
- Ambientales: `2.4s - 3s` (loops)

---

## Accesibilidad

- Focus rings: `outline: 2px solid var(--color-rose)`
- Focus offset: `3px`
- Reduced motion: `@media (prefers-reduced-motion: reduce)` respetaada en todas las animaciones
- Contraste: Texto burgundy sobre rosa-cream cumple WCAG AA

---

## Uso de Tailwind v4

El proyecto usa Tailwind CSS v4 con `@theme` para tokens custom:

```css
@theme {
  --color-burgundy: #4A1A2C;
  --color-rose: #C75B7A;
  --color-rose-light: #D68C9F;
  --color-rose-pale: #E8A5B0;
  --color-rose-blush: #F5D5DC;
  --color-rose-cream: #FDF2F5;
  --color-sage: #A8B0A0;
  --color-sage-deep: #8A9A84;
  --color-cream: #FAF6F3;
  --color-warm: #E8DDD0;
  --color-wheat: #F0E6D6;
}
```

Las variables shadcn están mapeadas a esta paleta para consistencia en todo el ecosistema de componentes.

---

## Archivos Clave

- `src/app/globals.css` — Tokens de diseño, colores, animaciones
- `src/app/layout.tsx` — Configuración de fuentes (DM Sans, Space Mono, Playfair Display)
- `components.json` — Configuración de shadcn/ui

---

*Última actualización: Mayo 2026*
*Base de diseño: Bouquet DB-2026-04-29*
