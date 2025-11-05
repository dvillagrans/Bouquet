import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Star, Clock, ChefHat } from 'lucide-react';
import { MenuItem } from '@/types';

interface ModernMenuCardProps {
  item: MenuItem;
  onAddToCart: () => void;
}

// Function to generate food images based on category and item
const getItemImage = (item: MenuItem): string => {
  const category = item.category;
  const itemName = item.name.toLowerCase();
  
  // Create SVG placeholder images based on category
  const svgImages: Record<string, string> = {
    drinks: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="drinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff6b9d;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#c44569;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#drinkGrad)"/>
        <circle cx="100" cy="80" r="45" fill="rgba(255,255,255,0.2)"/>
        <rect x="85" y="35" width="30" height="90" rx="15" fill="rgba(255,255,255,0.3)"/>
        <circle cx="100" cy="60" r="8" fill="rgba(255,255,255,0.6)"/>
        <circle cx="90" cy="75" r="6" fill="rgba(255,255,255,0.4)"/>
        <circle cx="110" cy="85" r="7" fill="rgba(255,255,255,0.5)"/>
        <path d="M70 140 Q100 120 130 140 Q100 160 70 140" fill="rgba(255,255,255,0.2)"/>
      </svg>
    `)}`,
    
    breakfast: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="breakfastGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffa726;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff7043;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#breakfastGrad)"/>
        <ellipse cx="100" cy="120" rx="60" ry="40" fill="rgba(255,255,255,0.3)"/>
        <circle cx="85" cy="110" r="15" fill="rgba(255,255,255,0.4)"/>
        <circle cx="115" cy="110" r="15" fill="rgba(255,255,255,0.4)"/>
        <path d="M70 140 Q100 130 130 140 Q100 150 70 140" fill="rgba(255,255,255,0.2)"/>
        <circle cx="100" cy="70" r="25" fill="rgba(255,255,255,0.2)"/>
        <path d="M85 60 L100 45 L115 60" stroke="rgba(255,255,255,0.6)" stroke-width="3" fill="none"/>
      </svg>
    `)}`,
    
    appetizers: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="appetizerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#66bb6a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#43a047;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#appetizerGrad)"/>
        <circle cx="100" cy="100" r="50" fill="rgba(255,255,255,0.2)"/>
        <circle cx="85" cy="85" r="8" fill="rgba(255,255,255,0.4)"/>
        <circle cx="115" cy="85" r="8" fill="rgba(255,255,255,0.4)"/>
        <circle cx="100" cy="115" r="8" fill="rgba(255,255,255,0.4)"/>
        <circle cx="85" cy="115" r="6" fill="rgba(255,255,255,0.3)"/>
        <circle cx="115" cy="115" r="6" fill="rgba(255,255,255,0.3)"/>
        <path d="M80 130 Q100 120 120 130" stroke="rgba(255,255,255,0.5)" stroke-width="2" fill="none"/>
      </svg>
    `)}`,
    
    dishes: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dishGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#8e24aa;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6a1b9a;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#dishGrad)"/>
        <ellipse cx="100" cy="130" rx="70" ry="45" fill="rgba(255,255,255,0.2)"/>
        <ellipse cx="100" cy="125" rx="60" ry="35" fill="rgba(255,255,255,0.3)"/>
        <circle cx="80" cy="115" r="12" fill="rgba(255,255,255,0.4)"/>
        <circle cx="120" cy="115" r="12" fill="rgba(255,255,255,0.4)"/>
        <circle cx="100" cy="105" r="15" fill="rgba(255,255,255,0.5)"/>
        <path d="M60 140 Q100 130 140 140" stroke="rgba(255,255,255,0.3)" stroke-width="2" fill="none"/>
        <circle cx="100" cy="60" r="8" fill="rgba(255,255,255,0.6)"/>
        <path d="M95 52 Q100 45 105 52" stroke="rgba(255,255,255,0.7)" stroke-width="2" fill="none"/>
      </svg>
    `)}`,
    
    desserts: `data:image/svg+xml,${encodeURIComponent(`
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dessertGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ec407a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d81b60;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" fill="url(#dessertGrad)"/>
        <ellipse cx="100" cy="140" rx="50" ry="30" fill="rgba(255,255,255,0.3)"/>
        <ellipse cx="100" cy="120" rx="45" ry="25" fill="rgba(255,255,255,0.4)"/>
        <ellipse cx="100" cy="100" rx="40" ry="20" fill="rgba(255,255,255,0.5)"/>
        <circle cx="90" cy="90" r="4" fill="rgba(255,255,255,0.7)"/>
        <circle cx="110" cy="90" r="4" fill="rgba(255,255,255,0.7)"/>
        <circle cx="100" cy="85" r="3" fill="rgba(255,255,255,0.8)"/>
        <path d="M85 75 Q100 65 115 75" stroke="rgba(255,255,255,0.6)" stroke-width="2" fill="none"/>
        <circle cx="100" cy="50" r="6" fill="rgba(255,255,255,0.4)"/>
      </svg>
    `)}`
  };
  
  return svgImages[category] || svgImages.dishes;
};

// Function to get category-specific badges
const getCategoryBadge = (category: string) => {
  const badges: Record<string, { icon: React.ReactNode; text: string; color: string }> = {
    drinks: { icon: <Star className="w-3 h-3" />, text: "Refreshing", color: "bg-blue-100 text-blue-800" },
    breakfast: { icon: <Clock className="w-3 h-3" />, text: "Morning", color: "bg-orange-100 text-orange-800" },
    appetizers: { icon: <ChefHat className="w-3 h-3" />, text: "Starter", color: "bg-green-100 text-green-800" },
    dishes: { icon: <ChefHat className="w-3 h-3" />, text: "Main Course", color: "bg-purple-100 text-purple-800" },
    desserts: { icon: <Star className="w-3 h-3" />, text: "Sweet", color: "bg-pink-100 text-pink-800" },
  };
  
  return badges[category] || badges.dishes;
};

export const ModernMenuCard: React.FC<ModernMenuCardProps> = ({ item, onAddToCart }) => {
  const badge = getCategoryBadge(item.category);
  const itemId = item.name.toLowerCase().replace(/\s+/g, '-');

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onAddToCart();
    }
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-white">
      {/* Image Section */}
      <div className="relative h-36 sm:h-48 overflow-hidden">
        <img 
          src={getItemImage(item)} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Category Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <Badge className={`${badge.color} border-0 shadow-md text-xs`}>
            {badge.icon}
            <span className="ml-1 text-xs font-medium">{badge.text}</span>
          </Badge>
        </div>
        
        {/* Price Badge */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <div className="bg-white rounded-full px-2 sm:px-3 py-1 shadow-lg">
            <span className="text-base sm:text-lg font-bold text-coral-tree-600">
              ${item.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Title and Description */}
          <div>
            <h3 
              className="text-lg sm:text-xl font-script text-buccaneer-800 mb-2 group-hover:text-coral-tree-700 transition-colors line-clamp-2"
              id={`item-title-${itemId}`}
            >
              {item.name}
            </h3>
            <p 
              className="text-buccaneer-600 text-xs sm:text-sm leading-relaxed line-clamp-2"
              id={`item-description-${itemId}`}
            >
              {item.description}
            </p>
          </div>

          {/* Action Button */}
          <Button
            onClick={onAddToCart}
            onKeyDown={handleKeyDown}
            className="w-full bg-gradient-to-r from-coral-tree-500 to-pink-500 hover:from-coral-tree-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 focus-ring group h-10 sm:h-11 text-sm sm:text-base"
            aria-label={`Add ${item.name} to cart for $${item.price.toFixed(2)}`}
            aria-describedby={`item-title-${itemId} item-description-${itemId}`}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" aria-hidden="true" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};