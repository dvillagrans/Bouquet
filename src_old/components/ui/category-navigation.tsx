import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Coffee, Sunrise, Utensils, ChefHat, IceCream } from 'lucide-react';

interface CategoryNavigationProps {
  currentCategory?: string;
}

const categories = [
  { 
    id: 'drinks', 
    name: 'Bebidas', 
    icon: Coffee, 
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    textColor: 'text-blue-700',
    description: 'Refrescantes y deliciosas'
  },
  { 
    id: 'breakfast', 
    name: 'Desayunos', 
    icon: Sunrise, 
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    textColor: 'text-orange-700',
    description: 'Para empezar el día'
  },
  { 
    id: 'appetizers', 
    name: 'Entradas', 
    icon: Utensils, 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 hover:bg-green-100',
    textColor: 'text-green-700',
    description: 'Perfectas para compartir'
  },
  { 
    id: 'dishes', 
    name: 'Platos Principales', 
    icon: ChefHat, 
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    textColor: 'text-purple-700',
    description: 'Nuestras especialidades'
  },
  { 
    id: 'desserts', 
    name: 'Postres', 
    icon: IceCream, 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    textColor: 'text-pink-700',
    description: 'El final perfecto'
  },
];

export const CategoryNavigation: React.FC<CategoryNavigationProps> = ({ currentCategory }) => {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-script text-buccaneer-800 mb-2">
          Explora Nuestro Menú
        </h2>
        <p className="text-buccaneer-600">
          Descubre sabores únicos en cada categoría
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = currentCategory === category.id;
          
          return (
            <Link
              key={category.id}
              to={`/menu/${category.id}`}
              className={`
                group relative overflow-hidden rounded-2xl p-6 text-center transition-all duration-300 
                hover:scale-105 hover:shadow-xl focus-ring
                ${isActive 
                  ? 'bg-gradient-to-br ' + category.color + ' text-white shadow-lg scale-105' 
                  : category.bgColor + ' ' + category.textColor + ' hover:shadow-lg'
                }
              `}
              aria-label={`Ver ${category.name} - ${category.description}`}
            >
              {/* Background Pattern */}
              <div className={`
                absolute inset-0 opacity-10 transition-opacity duration-300
                ${isActive ? 'opacity-20' : 'group-hover:opacity-20'}
              `}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-white/10 -translate-y-10 translate-x-10" />
                <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full bg-white/10 translate-y-8 -translate-x-8" />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className={`
                  inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 transition-all duration-300
                  ${isActive 
                    ? 'bg-white/30' 
                    : 'bg-white/50 group-hover:bg-white/70'
                  }
                `}>
                  <Icon className={`
                    w-6 h-6 transition-all duration-300 group-hover:scale-110
                    ${isActive ? 'text-white' : 'text-current'}
                  `} />
                </div>
                
                {/* Category Name */}
                <h3 className={`
                  font-medium text-sm mb-1 transition-colors duration-300
                  ${isActive ? 'text-white' : 'text-current'}
                `}>
                  {category.name}
                </h3>
                
                {/* Description */}
                <p className={`
                  text-xs opacity-80 transition-opacity duration-300
                  ${isActive ? 'text-white/90' : 'text-current'}
                `}>
                  {category.description}
                </p>
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/50 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};