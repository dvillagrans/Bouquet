import { ImageWithFallback } from './figma/ImageWithFallback';
import type { MenuItem } from '../App';

type Category = 'drinks' | 'breakfast' | 'appetizers' | 'dishes' | 'desserts';

interface MenuProps {
  category: Category;
  onBack: () => void;
  onAddToBasket: (item: MenuItem) => void;
  onViewBasket: () => void;
  basketCount: number;
}

export function Menu({ category, onBack, onAddToBasket, onViewBasket, basketCount }: MenuProps) {
  const menuItems: Record<Category, MenuItem[]> = {
    drinks: [
      { id: '1', name: 'Mojito Classic', price: 12.50, category: 'drinks', description: 'Ron blanco, menta fresca, lima' },
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
  };

  const categoryNames = {
    drinks: 'Bebidas',
    breakfast: 'Desayunos',
    appetizers: 'Aperitivos',
    dishes: 'Platos Principales',
    desserts: 'Postres'
  };

  const items = menuItems[category] || [];

  return (
    <div className="min-h-screen p-8 relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[#8B4B6B] text-2xl font-serif italic">Bouquet</h1>
          <p className="text-xs text-gray-600 mt-1">WELCOME SPANISH</p>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={onBack}
            className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center hover:bg-[#8B4B6B]/30 transition-colors"
          >
            <span className="text-[#8B4B6B] text-xs">🏠</span>
          </button>
          <div className="w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center">
            <span className="text-[#8B4B6B] text-xs">👤</span>
          </div>
          <button 
            onClick={onViewBasket}
            className="relative w-8 h-8 bg-[#8B4B6B]/20 rounded-full flex items-center justify-center hover:bg-[#8B4B6B]/30 transition-colors"
          >
            <span className="text-[#8B4B6B] text-xs">🛒</span>
            {basketCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {basketCount}
              </span>
            )}
          </button>
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
            <div 
              key={item.id}
              className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-[#8B4B6B]/20 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="text-[#8B4B6B] font-medium">{item.name}</h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                )}
                <p className="text-lg font-medium text-gray-800 mt-2">${item.price.toFixed(2)}</p>
              </div>
              
              <button
                onClick={() => onAddToBasket(item)}
                className="bg-[#8B4B6B] text-white px-4 py-2 rounded-lg hover:bg-[#7A4159] transition-colors ml-4"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}