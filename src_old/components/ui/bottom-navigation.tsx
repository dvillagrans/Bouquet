import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import flowerLogo from '@/assets/flower-logo.png';

interface HeaderNavigationProps {
  className?: string;
}

const HeaderNavigation: React.FC<HeaderNavigationProps> = ({ className }) => {
  const navigate = useNavigate();
  const { cart, userName } = useCart();
  
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 safe-area-top",
        // Liquid Glass Effect
        "bg-gradient-to-b from-white/20 via-white/10 to-white/5",
        "backdrop-blur-xl backdrop-saturate-150",
        "border-b border-white/20",
        "shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
        "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:via-white/10 before:to-transparent before:pointer-events-none",
        "after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:via-transparent after:to-white/20 after:pointer-events-none",
        className
      )}
      role="banner"
      aria-label="Main header"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <div className="relative flex items-center justify-between py-2 sm:py-4 px-3 sm:px-6">
        {/* Left - Rose Logo */}
        <div className="flex items-center">
          <img 
            src={flowerLogo} 
            alt="Bouquet restaurant logo" 
            className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-sm transition-transform duration-300 hover:scale-110"
            role="img"
          />
        </div>

        {/* Center - App Name + Welcome Message */}
        <div className="flex flex-col items-center text-center flex-1 mx-2 sm:mx-4">
          <h1 className="text-lg sm:text-xl font-script text-buccaneer-700 drop-shadow-sm">
            Bouquet
          </h1>
          {userName && (
            <p className="text-xs sm:text-sm text-coral-tree-600 font-elegant">
              Bienvenido {userName}
            </p>
          )}
        </div>

        {/* Right - Shopping Cart */}
        <button
          onClick={() => navigate('/cart')}
          className={cn(
            "relative flex items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-500 touch-target group",
            "hover:scale-105 active:scale-95",
            // Liquid Glass Button Effect
            "bg-gradient-to-br from-white/40 via-white/20 to-white/10",
            "border border-white/30",
            "shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]",
            "backdrop-blur-md",
            "text-coral-tree-600",
            "before:absolute before:inset-0 before:bg-gradient-to-br before:from-coral-tree-100/50 before:to-transparent before:rounded-xl sm:before:rounded-2xl before:pointer-events-none"
          )}
          aria-label={`Shopping cart with ${cartItemsCount} ${cartItemsCount === 1 ? 'item' : 'items'}`}
          title={`Cart (${cartItemsCount} items)`}
        >
          <ShoppingCart 
            className="h-5 w-5 sm:h-6 sm:w-6 transition-all duration-500 relative z-10 drop-shadow-sm group-hover:scale-105" 
            aria-hidden="true" 
          />
          {cartItemsCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-to-r from-pink-500 to-coral-tree-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-pulse z-20"
              aria-hidden="true"
            >
              {cartItemsCount}
            </span>
          )}
          {/* Liquid Glass Glow Effect */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-coral-tree-200/30 via-transparent to-transparent blur-sm pointer-events-none" />
        </button>
      </div>
      
      {/* Additional Glass Reflection */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
    </header>
  );
};

export default HeaderNavigation;
