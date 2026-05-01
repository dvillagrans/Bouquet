# Assets

Este directorio contiene los recursos visuales del proyecto que son procesados por el bundler (Next.js).

## Estructura de Floral Assets
Los elementos base para la generación visual se encuentran en `src/assets/floral-assets/`:

- `/flowers/`: Flores abiertas y completas.
- `/buds/`: Capullos y flores cerradas.
- `/petals/`: Pétalos individuales.
- `/leaves/`: Hojas individuales.
- `/branches/`: Ramas y conjuntos de hojas.
- `/compositions/`: Composiciones florales complejas.

## Industrias y Casos de Uso
Los recursos específicos para diferentes tipos de negocios se encuentran en `src/assets/industries/`:

- `card_bar_...`: Imágenes para bares y coctelería.
- `card_taqueria_...`: Imágenes para taquerías y comida rápida.
- `card_cafe_...`: Imágenes para cafeterías (futuro).

## Cómo usar las imágenes

1. Importa la imagen usando el alias `@/assets`:

```tsx
import rosaPrincipal from '@/assets/floral-assets/flowers/flower_rose_full_01.png'
import petalo from '@/assets/floral-assets/petals/petal_single_01.png'

// ...

<Image 
  src={rosaPrincipal} 
  alt="Rosa abierta" 
  placeholder="blur" 
/>
```

## Beneficios
- **Cache Busting**: Los nombres de archivo incluyen un hash único al compilar.
- **Optimización**: Compatibilidad total con `next/image` para redimensionado y formatos modernos.
- **Organización**: Estructura modular para facilitar la creación de composiciones visuales.
