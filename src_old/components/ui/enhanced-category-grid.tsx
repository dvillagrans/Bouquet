import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Sunrise, Utensils, Cookie, Wine, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  gradient: string;
  itemsCount?: number;
  isPopular?: boolean;
}

interface EnhancedCategoryGridProps {
  categories: Category[];
  onCategoryClick: (categoryId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const EnhancedCategoryGrid: React.FC<EnhancedCategoryGridProps> = ({
  categories,
  onCategoryClick,
  isLoading = false,
  className
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setVisibleCategories(categories.map(cat => cat.id));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading, categories]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto", className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl h-48" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto", className)}
    >
      <AnimatePresence>
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isVisible = visibleCategories.includes(category.id);
          
          return (
            <motion.div
              key={category.id}
              variants={itemVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              whileHover="hover"
              onHoverStart={() => setHoveredCategory(category.id)}
              onHoverEnd={() => setHoveredCategory(null)}
              className="group cursor-pointer"
              onClick={() => onCategoryClick(category.id)}
            >
              <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                {/* Background Gradient */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-90 group-hover:opacity-100 transition-opacity duration-500",
                  category.gradient
                )} />
                
                {/* Popular Badge */}
                {category.isPopular && (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: -45 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring", stiffness: 200 }}
                    className="absolute top-4 right-4 z-10"
                  >
                    <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Popular
                    </div>
                  </motion.div>
                )}

                {/* Content */}
                <div className="relative z-10 p-8 h-48 flex flex-col justify-center items-center text-center">
                  {/* Icon */}
                  <motion.div
                    className={cn(
                      "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
                      "bg-white/20 backdrop-blur-sm group-hover:bg-white/30 group-hover:scale-110"
                    )}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                  </motion.div>

                  {/* Title */}
                  <motion.h3 
                    className="text-2xl font-script text-white mb-2 drop-shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    {category.name}
                  </motion.h3>

                  {/* Description */}
                  <p className="text-white/90 text-sm font-elegant mb-4 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Items Count */}
                  {category.itemsCount && (
                    <div className="text-white/80 text-xs font-medium">
                      {category.itemsCount} items available
                    </div>
                  )}

                  {/* Arrow Icon */}
                  <motion.div
                    className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ 
                      x: hoveredCategory === category.id ? 5 : 0 
                    }}
                  >
                    <ArrowRight className="w-5 h-5 text-white" />
                  </motion.div>
                </div>

                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />

                {/* Ripple Effect */}
                <motion.div
                  className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 ease-out"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)'
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

