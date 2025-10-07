'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedBackgroundProps {
  particleCount?: number;
  colors?: string[];
  children?: React.ReactNode;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
  size: number;
}

interface FloatingShape {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  particleCount = 200,
  colors = [
    'bg-blue-400',
    'bg-purple-400', 
    'bg-pink-400',
    'bg-indigo-400',
    'bg-violet-400',
    'bg-cyan-400',
    'bg-emerald-400',
    'bg-yellow-400'
  ],
  children,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingShapes, setFloatingShapes] = useState<FloatingShape[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    // Generate particles after component mounts
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 2,
      size: Math.random() * 4 + 2, // Random size between 2 and 6
    }));

    const newFloatingShapes: FloatingShape[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 60 + i * 20,
      delay: Math.random() * 3,
    }));

    setParticles(newParticles);
    setFloatingShapes(newFloatingShapes);
  }, [particleCount, colors]);

  // Don't render anything until hydrated to prevent SSR mismatch
  if (!isHydrated) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {children}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full opacity-80 ${particle.color}`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size * 3}px`,
            height: `${particle.size * 3}px`,
            boxShadow: `0 0 ${particle.size * 4}px rgba(59, 130, 246, 0.5), 0 0 ${particle.size * 8}px rgba(168, 85, 247, 0.3)`,
          }}
          animate={{
            x: [0, (particle.id % 2 === 0 ? 1 : -1) * (30 + particle.size * 8), 0],
            y: [0, (particle.id % 3 === 0 ? -1 : 1) * (25 + particle.size * 5), 0],
            scale: [0.8, 1.5 + particle.size * 0.2, 0.8],
            opacity: [0.4, 0.9, 0.4],
            rotate: [0, particle.id % 2 === 0 ? 180 : -180, 0],
          }}
          transition={{
            duration: 3 + particle.delay * 1.5,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: particle.delay,
          }}
        />
      ))}

      {/* Larger floating shapes */}
      {floatingShapes.map((shape) => (
        <motion.div
          key={shape.id}
          className="absolute rounded-full opacity-20"
          style={{
            left: `${shape.x}%`,
            top: `${shape.y}%`,
            width: `${shape.size}px`,
            height: `${shape.size}px`,
            background: 'linear-gradient(45deg, rgba(59,130,246,0.4), rgba(168,85,247,0.4))',
          }}
          animate={{
            rotate: 360,
            scale: [1, 1.2, 0.9, 1.1, 1],
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 20, -10, 0],
          }}
          transition={{
            rotate: {
              duration: 15 + shape.delay * 5,
              repeat: Infinity,
              ease: 'linear',
            },
            scale: {
              duration: 6 + shape.delay * 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
            x: {
              duration: 12 + shape.delay * 3,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
            y: {
              duration: 10 + shape.delay * 2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            },
          }}
        />
      ))}

      {/* Gradient wave effect */}
      <div className="absolute inset-0 opacity-15">
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(45deg, transparent 20%, rgba(59,130,246,0.2) 50%, transparent 80%)',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(-45deg, transparent 30%, rgba(168,85,247,0.15) 50%, transparent 70%)',
          }}
          animate={{
            x: ['100%', '-100%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {children}
    </div>
  );
};

export default AnimatedBackground;