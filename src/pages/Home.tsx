import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Coffee, Sunrise, Utensils, Cookie, Wine } from 'lucide-react';

const categories = [
  { id: 'drinks', name: 'Drinks', icon: Wine },
  { id: 'breakfast', name: 'Breakfast', icon: Sunrise },
  { id: 'appetizers', name: 'Appetizers', icon: Coffee },
  { id: 'dishes', name: 'Dishes', icon: Utensils },
  { id: 'desserts', name: 'Desserts', icon: Cookie },
];

const Home = () => {
  const { userName } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-champagne pt-20 sm:pt-24 p-3 sm:p-6">
      <div className="max-w-md mx-auto">
        
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => navigate(`/menu/${category.id}`)}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-2 sm:gap-3 min-h-[100px] sm:min-h-[120px]"
              >
                <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-coral-tree-600" />
                <span className="text-xs sm:text-sm font-medium text-buccaneer-700 text-center leading-tight">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
