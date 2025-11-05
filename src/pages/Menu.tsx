import React, { useContext, useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Search } from 'lucide-react';
import { menuItems } from '@/data/menuData';
import { ModernMenuCard } from '@/components/ui/modern-menu-card';

import { Input } from '@/components/ui/input';

import { FloatingActionButton } from '@/components/ui/micro-interactions';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

const Menu = () => {
  const { category } = useParams<{ category: string }>();
  const { addToCart, cart } = useCart();
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [category]);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Filter items based on current category and search term
  const filteredItems = useMemo(() => {
    let items = category 
      ? menuItems.filter(item => item.category === category)
      : menuItems;

    // Apply search filter
    if (searchTerm) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return items;
  }, [category, searchTerm]);

  const getCategoryTitle = () => {
    const titles: Record<string, string> = {
      drinks: 'Drinks',
      breakfast: 'Breakfast',
      appetizers: 'Appetizers',
      dishes: 'Main Dishes',
      desserts: 'Desserts',
    };
    return titles[category || ''] || 'Menu';
  };

  const getCategoryDescription = () => {
    const descriptions: Record<string, string> = {
      drinks: 'Refreshing beverages to quench your thirst',
      breakfast: 'Start your day with our delicious morning options',
      appetizers: 'Perfect starters to begin your meal',
      dishes: 'Hearty and satisfying main courses',
      desserts: 'Sweet treats to end your meal perfectly',
    };
    return descriptions[category || ''] || 'Explore our menu';
  };

  const handleAddToCart = (item: typeof menuItems[0]) => {
    addToCart(item);
    toast.success(`${item.name} added to cart`, {
      description: "Item successfully added to your basket",
      duration: 2000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 sm:pt-24">
      {/* Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Category Header */}
        <div className="mb-4 sm:mb-6 text-center">
          <h2 className="text-xl sm:text-2xl font-medium text-buccaneer-800">
            {getCategoryTitle()}
          </h2>
        </div>

        {/* Search */}
        <div className="mb-4 sm:mb-6">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 sm:h-12 text-base rounded-lg border border-gray-200 focus:border-coral-tree-400 focus:ring-1 focus:ring-coral-tree-400"
            />
          </div>
        </div>

        {/* Menu Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 sm:h-48 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredItems.map((item) => (
              <ModernMenuCard
                key={item.id}
                item={item}
                onAddToCart={() => handleAddToCart(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 mb-4 text-sm sm:text-base">No encontramos resultados</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-coral-tree-500 text-white rounded-lg hover:bg-coral-tree-600 transition-colors text-sm sm:text-base"
            >
              Limpiar búsqueda
            </button>
          </div>
        )}

        {/* Floating Action Button for Cart */}
        {cartItemsCount > 0 && (
          <FloatingActionButton
            icon={<ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />}
            onClick={() => navigate('/cart')}
            tooltip={`View cart (${cartItemsCount} items)`}
          />
        )}
      </main>
    </div>
  );
};

export default Menu;
