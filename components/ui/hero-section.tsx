import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Clock, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  userName: string;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ userName, className }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'breakfast';
    if (hour < 18) return 'lunch';
    return 'dinner';
  };

  const stats = [
    { icon: Star, label: '4.9 Rating', value: '4.9', color: 'text-yellow-500' },
    { icon: Clock, label: 'Avg. Wait', value: '15min', color: 'text-blue-500' },
    { icon: Users, label: 'Happy Customers', value: '2.5k+', color: 'text-green-500' },
    { icon: TrendingUp, label: 'Popular Today', value: '85%', color: 'text-pink-500' }
  ];

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-albescent-white-50 to-coral-tree-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(236,72,153,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(239,68,68,0.1),transparent_50%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200 rounded-full opacity-20 animate-float" />
      <div className="absolute top-40 right-20 w-16 h-16 bg-coral-tree-200 rounded-full opacity-30 animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-20 left-20 w-12 h-12 bg-buccaneer-200 rounded-full opacity-25 animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center py-16 px-6"
        >
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <h1 className="text-6xl md:text-7xl font-script text-buccaneer-800 mb-4 drop-shadow-sm">
              {getGreeting()}, {userName}!
            </h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-coral-tree-400 rounded-full" />
              <span className="text-lg text-coral-tree-600 font-elegant">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="h-1 w-16 bg-gradient-to-r from-coral-tree-400 to-buccaneer-400 rounded-full" />
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl md:text-2xl text-coral-tree-600 font-elegant max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Discover our carefully curated menu and find your perfect {getTimeOfDay()} experience
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-12"
          >
            <button className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-coral-tree-500 to-pink-500 hover:from-coral-tree-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-medium text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-coral-tree-500 focus:ring-offset-2">
              <span>Explore Menu</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            </button>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto px-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20">
                <div className={cn("w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300", stat.color.replace('text-', 'bg-').replace('-500', '-100'))}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div className="text-2xl font-bold text-buccaneer-800 mb-1">{stat.value}</div>
                <div className="text-sm text-coral-tree-600 font-medium">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

