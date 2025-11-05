import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Ripple Effect Component
interface RippleProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export const RippleButton: React.FC<RippleProps> = ({ 
  className, 
  children, 
  onClick 
}) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const addRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.();
  };

  return (
    <button
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-coral-tree-500 focus:ring-offset-2",
        className
      )}
      onClick={addRipple}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: 'rgba(236, 72, 153, 0.3)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear'
          }}
        />
      ))}
    </button>
  );
};

// Floating Action Button
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  tooltip?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  className,
  tooltip
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative group">
      <button
        className={cn(
          "fixed bottom-20 right-6 z-40",
          "w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-r from-coral-tree-500 to-pink-500",
          "hover:from-coral-tree-600 hover:to-pink-600",
          "text-white transition-all duration-300",
          "hover:scale-110 hover:shadow-xl",
          "active:scale-95",
          "focus:outline-none focus:ring-2 focus:ring-coral-tree-500 focus:ring-offset-2",
          className
        )}
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={tooltip}
      >
        <div className="flex items-center justify-center">
          {icon}
        </div>
        
        {/* Tooltip */}
        {tooltip && (
          <div
            className={cn(
              "absolute right-16 top-1/2 -translate-y-1/2",
              "bg-gray-900 text-white text-sm px-3 py-2 rounded-lg",
              "opacity-0 transition-opacity duration-300",
              "pointer-events-none whitespace-nowrap",
              isHovered && "opacity-100"
            )}
          >
            {tooltip}
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
          </div>
        )}
      </button>
    </div>
  );
};

// Progress Indicator
interface ProgressIndicatorProps {
  current: number;
  total: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  current,
  total,
  className
}) => {
  const percentage = (current / total) * 100;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-buccaneer-700">
          Step {current} of {total}
        </span>
        <span className="text-sm text-coral-tree-600">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-coral-tree-500 to-pink-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Toast Notification
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-500 text-white'
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg",
        "transform transition-all duration-300",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        typeStyles[type]
      )}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-white/80 hover:text-white"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Loading Spinner
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-coral-tree-500",
        sizeClasses[size],
        className
      )}
    />
  );
};

// Pulse Animation
interface PulseProps {
  children: React.ReactNode;
  className?: string;
}

export const Pulse: React.FC<PulseProps> = ({ children, className }) => (
  <div
    className={cn(
      "animate-pulse",
      className
    )}
  >
    {children}
  </div>
);

// Shake Animation for Errors
interface ShakeProps {
  children: React.ReactNode;
  shouldShake: boolean;
  className?: string;
}

export const Shake: React.FC<ShakeProps> = ({ 
  children, 
  shouldShake, 
  className 
}) => (
  <div
    className={cn(
      "transition-transform duration-300",
      shouldShake && "animate-shake",
      className
    )}
  >
    {children}
  </div>
);

// Bounce Animation
interface BounceProps {
  children: React.ReactNode;
  className?: string;
}

export const Bounce: React.FC<BounceProps> = ({ children, className }) => (
  <div
    className={cn(
      "animate-bounce",
      className
    )}
  >
    {children}
  </div>
);

// Heart Animation for Likes
interface HeartProps {
  isLiked: boolean;
  onClick: () => void;
  className?: string;
}

export const Heart: React.FC<HeartProps> = ({ 
  isLiked, 
  onClick, 
  className 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onClick();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      className={cn(
        "transition-all duration-300",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2",
        className
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          "transition-all duration-300",
          isLiked && "text-pink-500 scale-110",
          isAnimating && "animate-ping"
        )}
      >
        ♥
      </div>
    </button>
  );
};

