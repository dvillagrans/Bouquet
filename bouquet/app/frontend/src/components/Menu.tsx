import { Home, User, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type Category = 'drinks' | 'breakfast' | 'appetizers' | 'dishes' | 'desserts'

export interface MenuItem {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  category: Category
}

interface MenuProps {
  category: Category
  onBack: () => void
  onAddToBasket: (item: MenuItem) => void
  onViewBasket: () => void
  basketCount: number
}

export function Menu({ category, onBack, onAddToBasket, onViewBasket, basketCount }: MenuProps) {
  const menuItems: Record<Category, MenuItem[]> = {
    drinks: [
      { id: '1', name: 'Mojito Clásico', price: 12.50, category: 'drinks', description: 'Ron blanco, menta fresca, lima' },
      { id: '2', name: 'Cosmopolitan', price: 14.00, category: 'drinks', description: 'Vodka, triple sec, jugo de arándano' },
      { id: '3', name: 'Old Fashioned', price: 15.50, category: 'drinks', description: 'Whiskey, azúcar, angostura' },
      { id: '4', name: 'Margarita', price: 13.00, category: 'drinks', description: 'Tequila, cointreau, lima' },
      { id: '5', name: 'Negroni', price: 14.50, category: 'drinks', description: 'Gin, campari, vermouth rojo' },
      { id: '6', name: 'Pisco Sour', price: 13.50, category: 'drinks', description: 'Pisco, lima, clara de huevo' }
    ],
    breakfast: [
      { id: '7', name: 'Pancakes Especiales', price: 18.00, category: 'breakfast', description: 'Con frutas y miel' },
      { id: '8', name: 'Avocado Toast', price: 16.50, category: 'breakfast', description: 'Pan artesanal, palta, tomate' },
      { id: '9', name: 'Huevos Benedict', price: 22.00, category: 'breakfast', description: 'Muffin inglés, jamón, huevo pochado' }
    ],
    appetizers: [
      { id: '10', name: 'Bruschetta', price: 14.00, category: 'appetizers', description: 'Pan tostado, tomate, albahaca' },
      { id: '11', name: 'Ceviche', price: 18.50, category: 'appetizers', description: 'Pescado fresco, limón, ají' },
      { id: '12', name: 'Tabla de Quesos', price: 24.00, category: 'appetizers', description: 'Selección de quesos artesanales' }
    ],
    dishes: [
      { id: '13', name: 'Salmón Grillado', price: 32.00, category: 'dishes', description: 'Con vegetales asados' },
      { id: '14', name: 'Risotto de Hongos', price: 28.00, category: 'dishes', description: 'Arroz cremoso, hongos porcini' },
      { id: '15', name: 'Lomo Saltado', price: 35.00, category: 'dishes', description: 'Res, papas, cebolla, tomate' }
    ],
    desserts: [
      { id: '16', name: 'Tiramisú', price: 12.00, category: 'desserts', description: 'Clásico postre italiano' },
      { id: '17', name: 'Cheesecake', price: 14.00, category: 'desserts', description: 'Con salsa de frutos rojos' },
      { id: '18', name: 'Brownie', price: 10.50, category: 'desserts', description: 'Con helado de vainilla' }
    ]
  }

  const categoryNames = {
    drinks: 'Bebidas',
    breakfast: 'Desayunos',
    appetizers: 'Aperitivos',
    dishes: 'Platos Principales',
    desserts: 'Postres'
  }

  const items = menuItems[category] || []

  return (
    <div className="min-h-screen p-8 relative bg-[#f5f3f0] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px]">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600 mt-1">BIENVENIDO</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="w-8 h-8 bg-[#8B4B6B]/20 hover:bg-[#8B4B6B]/30 text-[#8B4B6B]"
          >
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 bg-[#8B4B6B]/20 hover:bg-[#8B4B6B]/30 text-[#8B4B6B]">
            <User className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onViewBasket}
            className="relative w-8 h-8 bg-[#8B4B6B]/20 hover:bg-[#8B4B6B]/30 text-[#8B4B6B]"
          >
            <ShoppingCart className="w-4 h-4" />
            {basketCount > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {basketCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-[#8B4B6B] text-3xl font-serif italic">Menú</h2>
        <p className="text-gray-700 mt-2">{categoryNames[category]}</p>
      </div>

      {/* Menu items */}
      <div className="max-w-2xl mx-auto">
        <div className="grid gap-4">
          {items.map((item) => (
            <Card 
              key={item.id}
              className="bg-white/80 backdrop-blur-sm border-[#8B4B6B]/20"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-[#8B4B6B] font-medium">{item.name}</CardTitle>
                    {item.description && (
                      <CardDescription className="text-sm text-gray-600 mt-1">{item.description}</CardDescription>
                    )}
                    <p className="text-lg font-medium text-gray-800 mt-2">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <Button
                    onClick={() => onAddToBasket(item)}
                    className="bg-[#8B4B6B] hover:bg-[#7A4159] text-white ml-4"
                  >
                    Agregar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}