# Guía de Componentes shadcn/ui para Bouquet

## 🎨 Identidad Visual Mantenida

Los componentes de shadcn/ui han sido integrados manteniendo la paleta de colores y estilo visual de Bouquet:

- **Colores primarios**: Azules (#0ea5e9, #0284c7, etc.)
- **Colores secundarios**: Grises (#64748b, #475569, etc.)
- **Colores de estado**: Verde para éxito, amarillo para advertencias, rojo para errores
- **Bordes redondeados**: 12px por defecto (--radius)
- **Sombras suaves**: Manteniendo el estilo visual existente

## 📦 Componentes Disponibles

### Button

```tsx
import { Button } from '@/components/ui/button'

// Variantes disponibles
<Button>Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="success">Éxito</Button>
<Button variant="warning">Advertencia</Button>
<Button variant="error">Error</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="default">Default</Button>
<Button size="lg">Grande</Button>
<Button size="icon"><Icon /></Button>
```

### Card

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido principal
  </CardContent>
  <CardFooter>
    Pie de tarjeta
  </CardFooter>
</Card>
```

### Input

```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Ingresa texto aquí" />
<Input type="email" placeholder="correo@ejemplo.com" />
<Input type="password" placeholder="Contraseña" />
```

### Badge

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secundario</Badge>
<Badge variant="success">Disponible</Badge>
<Badge variant="warning">En espera</Badge>
<Badge variant="error">Agotado</Badge>
<Badge variant="outline">Outline</Badge>
```

### Alert

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle } from 'lucide-react'

<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>¡Éxito!</AlertTitle>
  <AlertDescription>
    La operación se completó correctamente.
  </AlertDescription>
</Alert>
```

### Dialog

```tsx
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título del Modal</DialogTitle>
      <DialogDescription>
        Descripción del contenido del modal.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toaster (Notificaciones)

```tsx
import { toast } from 'sonner'

// En tu App.tsx ya está incluido el <Toaster />
// Solo necesitas usar toast en tus componentes:

toast.success('¡Operación exitosa!')
toast.error('Error al procesar')
toast.warning('Advertencia importante')
toast.info('Información relevante')
```

## 🎯 Variables CSS Personalizadas

Las siguientes variables CSS están configuradas para mantener la identidad de Bouquet:

```css
:root {
  --background: 249 250 251; /* gray-50 */
  --foreground: 17 24 39; /* gray-900 */
  --primary: 2 132 199; /* primary-600 */
  --secondary: 241 245 249; /* secondary-100 */
  --radius: 0.75rem; /* 12px */
  /* ... más variables */
}
```

## 🔧 Instalación y Configuración

Ya está todo configurado en tu proyecto, pero si necesitas agregar más componentes:

1. Instalar dependencias adicionales:

```bash
npm install @radix-ui/react-[componente-necesario]
```

2. Crear el componente en `src/components/ui/`
3. Exportarlo desde `src/components/ui/index.ts`
4. Usarlo con el alias `@/components/ui`

## 🎨 Personalización Adicional

Si necesitas personalizar más componentes:

1. **Colores**: Modifica las variables CSS en `src/index.css`
2. **Tailwind**: Actualiza `tailwind.config.js`
3. **Componentes**: Ajusta las clases en cada componente individual

## 📱 Compatibilidad PWA

Todos los componentes son compatibles con PWA y mantienen:

- Tap targets de 44px mínimo
- Safe areas para dispositivos móviles
- Animaciones optimizadas
- Accesibilidad completa

## 🚀 Próximos Pasos

Para expandir la biblioteca de componentes, puedes agregar:

- Form (formularios con validación)
- Table (tablas de datos)
- Dropdown Menu
- Select
- Tabs
- Accordion
- Sheet (drawer lateral)
- Popover
- Tooltip

¡La base ya está lista para mantener la consistencia visual de Bouquet en todos los nuevos componentes!
