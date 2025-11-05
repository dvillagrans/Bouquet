import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface EnhancedCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const EnhancedCard: React.FC<EnhancedCardProps> = ({
  children,
  className,
  hover = true,
  gradient,
  onClick,
  disabled = false
}) => {
  return (
    <Card
      className={cn(
        "glass-card border-0 transition-all duration-300 ease-out",
        hover && !disabled && "hover:glass-medium hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
        onClick && !disabled && "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        gradient && `bg-gradient-to-br ${gradient}`,
        className
      )}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </Card>
  );
};

interface CategoryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  gradient: string;
  onClick: () => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  icon: Icon,
  title,
  description,
  gradient,
  onClick,
  className
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <EnhancedCard
      className={cn("overflow-hidden group focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2", className)}
      onClick={onClick}
      gradient={gradient}
    >
      <CardContent 
        className="p-8 text-white relative"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Browse ${title} category${description ? ` - ${description}` : ''}`}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300" />
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="glass-light rounded-full p-6 group-hover:scale-110 transition-transform duration-300 shadow-lg" aria-hidden="true">
            <Icon className="h-12 w-12 drop-shadow-sm" />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-script font-bold drop-shadow-sm">{title}</h3>
            {description && (
              <p className="text-sm opacity-90 font-elegant mt-1">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </EnhancedCard>
  );
};

interface MenuItemCardProps {
  name: string;
  description: string;
  price: number;
  image?: string;
  onAddToCart: () => void;
  className?: string;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  name,
  description,
  price,
  image,
  onAddToCart,
  className
}) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onAddToCart();
    }
  };

  const itemId = name.toLowerCase().replace(/\s+/g, '-');

  return (
    <EnhancedCard className={cn("overflow-hidden", className)}>
      {image && (
        <div className="h-48 bg-gradient-to-br from-albescent-white-100 to-albescent-white-200 flex items-center justify-center">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <CardTitle 
          className="text-xl font-script text-buccaneer-700"
          id={`item-title-${itemId}`}
        >
          {name}
        </CardTitle>
        <CardDescription 
          className="text-coral-tree-600 font-elegant"
          id={`item-description-${itemId}`}
        >
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <span 
            className="text-2xl font-bold text-buccaneer-800 font-script"
            aria-label={`Price: ${price} dollars`}
          >
            ${price.toFixed(2)}
          </span>
          <button
            onClick={onAddToCart}
            onKeyDown={handleKeyDown}
            className="bg-gradient-to-r from-pink-500 to-coral-tree-500 text-white px-6 py-2 rounded-full font-elegant hover:shadow-lg hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pink-300"
            aria-label={`Add ${name} to cart for $${price.toFixed(2)}`}
            aria-describedby={`item-title-${itemId} item-description-${itemId}`}
          >
            Add to Cart
          </button>
        </div>
      </CardContent>
    </EnhancedCard>
  );
};