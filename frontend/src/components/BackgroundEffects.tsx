'use client';

import { useEffect, useState } from 'react';

export default function BackgroundEffects() {
  const [smallStars, setSmallStars] = useState('');
  const [mediumStars, setMediumStars] = useState('');
  const [largeStars, setLargeStars] = useState('');

  useEffect(() => {
    const generateStars = (count: number) => {
      let value = '';
      for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * 2000);
        const y = Math.floor(Math.random() * 2000);
        value += `${x}px ${y}px #FFF, `;
      }
      return value.slice(0, -2); // Remove trailing comma
    };

    setSmallStars(generateStars(700));
    setMediumStars(generateStars(200));
    setLargeStars(generateStars(100));
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="stars-container opacity-30 animate-twinkle">
        <div className="stars-small" style={{ boxShadow: smallStars }}></div>
        <div className="stars-medium" style={{ boxShadow: mediumStars }}></div>
        <div className="stars-large" style={{ boxShadow: largeStars }}></div>
      </div>
      
      <style jsx>{`
        .stars-small {
          width: 1px;
          height: 1px;
          background: transparent;
          animation: animStar 50s linear infinite;
        }
        .stars-medium {
          width: 2px;
          height: 2px;
          background: transparent;
          animation: animStar 100s linear infinite;
        }
        .stars-large {
          width: 3px;
          height: 3px;
          background: transparent;
          animation: animStar 150s linear infinite;
        }

        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
        
        @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.5; }
        }
        
        .animate-twinkle {
            animation: twinkle 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
