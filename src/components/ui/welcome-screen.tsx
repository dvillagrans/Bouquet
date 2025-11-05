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
      className={`
        fixed inset-0 z-50 bg-white transition-opacity duration-1000
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen">
        {/* Welcome Text */}
        <h1 
          className={`
            text-8xl md:text-9xl font-script text-red-700
            transform transition-all duration-1000 ease-out
            ${fadeOut ? 'scale-110 opacity-0' : 'scale-100 opacity-100'}
          `}
          style={{
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive",
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Welcome
        </h1>
      </div>
    </div>
  );
};