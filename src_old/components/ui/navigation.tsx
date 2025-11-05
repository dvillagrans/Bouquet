import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Home, Menu as MenuIcon, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import flowerLogo from '@/assets/flower-logo.png';
import { cn } from '@/lib/utils';

interface NavigationProps {
  showBackButton?: boolean;
  showCart?: boolean;
  showSearch?: boolean;
  title?: string;
  customBackAction?: () => void;
  onSearchClick?: () => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  showBackButton = false,
  showCart = true,
  showSearch = false,
  title,
  customBackAction,
  onSearchClick,
  className
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart } = useCart();
  
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleBackClick = () => {
    if (customBackAction) {
      customBackAction();
    } else {
      navigate(-1);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const getPageTitle = () => {
    if (title) return title;
    
    const pathTitles: Record<string, string> = {
      '/home': 'Menu Categories',
      '/cart': 'My Basket',
      '/payment': 'Payment Options',
      '/success': 'Order Confirmed',
      '/split-bill': 'Split Bill'
    };

    // Handle dynamic menu routes
    if (location.pathname.startsWith('/menu/')) {
      const category = location.pathname.split('/')[2];
      const categoryTitles: Record<string, string> = {
        drinks: 'Drinks',
        breakfast: 'Breakfast',
        appetizers: 'Appetizers',
        dishes: 'Main Dishes',
        desserts: 'Desserts'
      };
      return categoryTitles[category] || 'Menu';
    }

    return pathTitles[location.pathname] || 'Bouquet';
  };

  return (
    <header 
      className={cn(
        "glass sticky top-0 z-50 border-0 border-b border-gray-200",
        "backdrop-blur-md bg-white/95",
        className
      )}
      role="banner"
    >
      <nav 
        className="container mx-auto px-3 sm:px-6 py-3 sm:py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          {/* Left side - Back button or Home */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {showBackButton ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackClick}
                onKeyDown={(e) => handleKeyDown(e, handleBackClick)}
                className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 hover:bg-albescent-white-100 transition-colors focus-ring"
                aria-label="Go back to previous page"
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/home')}
                onKeyDown={(e) => handleKeyDown(e, () => navigate('/home'))}
                className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 hover:bg-albescent-white-100 transition-colors focus-ring"
                aria-label="Go to home page"
                title="Home"
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </Button>
            )}
          </div>

          {/* Center - Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
            <img 
              src={flowerLogo} 
              alt="Bouquet restaurant logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm"
              role="img"
            />
            <div className="text-center">
              <h1 className="text-lg sm:text-2xl font-script text-buccaneer-700 drop-shadow-sm" id="page-title">
                Bouquet
              </h1>
              <p className="text-xs sm:text-sm text-coral-tree-600 font-elegant" aria-describedby="page-title">
                {getPageTitle()}
              </p>
            </div>
          </div>

          {/* Right side - Search, Cart or spacer */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchClick}
                onKeyDown={(e) => handleKeyDown(e, () => onSearchClick?.())}
                className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 hover:bg-albescent-white-100 transition-colors focus-ring"
                aria-label="Search menu items"
                title="Search"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </Button>
            )}
            {showCart && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/cart')}
                onKeyDown={(e) => handleKeyDown(e, () => navigate('/cart'))}
                className="relative shrink-0 h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/20 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md hover:shadow-lg focus-ring"
                aria-label={`Shopping cart with ${cartItemsCount} ${cartItemsCount === 1 ? 'item' : 'items'}`}
                title={`Cart (${cartItemsCount} items)`}
              >
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                {cartItemsCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-pink-500 to-coral-tree-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse"
                    aria-hidden="true"
                  >
                    {cartItemsCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};