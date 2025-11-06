"use client";
import React, { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after showing Welcome
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete the welcome sequence
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{
        backgroundColor: '#ffffff',
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 40px)'
      }}
    >
      {/* Corner flower */}
      <div className="absolute top-4 left-4">
        <img src="/assets/flower-logo.png" alt="Flower" className="h-12 w-12 object-contain" />
      </div>

      {/* Title */}
      <div className="absolute top-10 left-0 right-0 text-center">
        <span className="text-4xl md:text-5xl font-script text-buccaneer-700 select-none">Bouquet</span>
      </div>

      {/* Welcome text with soft entrance */}
      <div className="flex items-center justify-center min-h-screen">
        <h1
          className={`text-7xl md:text-8xl font-script text-red-700 transform transition-all duration-1000 ease-out ${fadeOut ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}`}
          style={{
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
            textShadow: '2px 2px 4px rgba(0,0,0,0.12)'
          }}
        >
          Welcome
        </h1>
      </div>
    </div>
  );
};