import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Star, 
  Truck, 
  Shield, 
  Heart, 
  Award, 
  Zap,
  TrendingUp,
  Users,
  Coffee
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

interface HomeFeaturesProps {
  className?: string;
}

export const HomeFeatures: React.FC<HomeFeaturesProps> = ({ className }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features: Feature[] = [
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Get your order in 15-30 minutes with our express delivery service",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "Fresh ingredients and expertly crafted dishes every time",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      icon: Truck,
      title: "Free Delivery",
      description: "No delivery fees on orders over $25",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your data and payments are protected with bank-level security",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const stats = [
    { icon: Users, label: "Happy Customers", value: "2,500+", color: "text-pink-500" },
    { icon: Coffee, label: "Orders Today", value: "150+", color: "text-coral-tree-500" },
    { icon: Award, label: "Awards Won", value: "12", color: "text-yellow-500" },
    { icon: TrendingUp, label: "Satisfaction", value: "98%", color: "text-green-500" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className={cn("space-y-16", className)}>
      {/* Features Carousel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative"
      >
        <div className="text-center mb-8">
          <h3 className="text-3xl font-script text-buccaneer-800 mb-4">
            Why Choose Bouquet?
          </h3>
          <div className="w-24 h-1 bg-gradient-to-r from-coral-tree-400 to-pink-400 mx-auto rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-r from-coral-tree-50 to-pink-50">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center justify-center p-8"
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    features[currentFeature].bgColor
                  )}>
                    {React.createElement(features[currentFeature].icon, {
                      className: cn("w-8 h-8", features[currentFeature].color)
                    })}
                  </div>
                  <div className="text-left">
                    <h4 className="text-2xl font-elegant text-buccaneer-800 mb-2">
                      {features[currentFeature].title}
                    </h4>
                    <p className="text-coral-tree-600 font-medium">
                      {features[currentFeature].description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentFeature 
                      ? "bg-coral-tree-500 w-8" 
                      : "bg-coral-tree-300"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20"
      >
        <div className="text-center mb-8">
          <h3 className="text-2xl font-script text-buccaneer-800 mb-2">
            Our Impact
          </h3>
          <p className="text-coral-tree-600">
            Numbers that speak for our commitment to excellence
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-coral-tree-100 to-pink-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className={cn("text-3xl font-bold mb-2", stat.color)}>
                  {stat.value}
                </div>
                <div className="text-sm text-buccaneer-600 font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Special Offers */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 to-coral-tree-500 text-white"
      >
        <div className="absolute inset-0 bg-white/10 bg-gradient-to-br from-white/20 to-transparent" />
        
        <div className="relative z-10 p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Zap className="w-8 h-8" />
          </motion.div>
          
          <h3 className="text-3xl font-script mb-4">
            Special Offer Today!
          </h3>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Get 20% off your first order when you spend over $30. 
            Use code <span className="font-bold bg-white/20 px-2 py-1 rounded">WELCOME20</span>
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-coral-tree-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors duration-300"
          >
            Claim Offer
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

