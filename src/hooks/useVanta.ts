import { useEffect, useRef } from 'react';

export type VantaEffectType = 'waves' | 'birds' | 'net' | 'fog' | 'clouds';

interface VantaOptions {
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  color?: number;
  backgroundColor?: number;
  shininess?: number;
  waveHeight?: number;
  waveSpeed?: number;
  zoom?: number;
  // Birds specific
  color1?: number;
  color2?: number;
  colorMode?: string;
  birdSize?: number;
  wingSpan?: number;
  speedLimit?: number;
  separation?: number;
  alignment?: number;
  cohesion?: number;
  quantity?: number;
  // Net specific
  points?: number;
  maxDistance?: number;
  spacing?: number;
  showDots?: boolean;
}

export const useVanta = (effect: VantaEffectType, options: VantaOptions = {}) => {
  const vantaRef = useRef<HTMLElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    if (!vantaEffect.current && typeof window !== 'undefined') {
      const initVanta = async () => {
        console.log('🌊 Initializing Vanta effect:', effect);
        try {
          const THREE = await import('three');
          console.log('✅ THREE.js loaded');
          
          let VANTA;
          switch (effect) {
            case 'waves':
              VANTA = await import('vanta/dist/vanta.waves.min.js');
              console.log('✅ Vanta waves loaded');
              break;
            case 'birds':
              VANTA = await import('vanta/dist/vanta.birds.min.js');
              break;
            case 'net':
              VANTA = await import('vanta/dist/vanta.net.min.js');
              break;
            default:
              VANTA = await import('vanta/dist/vanta.waves.min.js');
          }
          
          if (vantaRef.current) {
            console.log('🎯 Element found, creating Vanta effect...');
            const defaultOptions = {
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.00,
              minWidth: 200.00,
              scale: 1.00,
              scaleMobile: 1.00,
              ...options
            };

            console.log('🎨 Vanta options:', defaultOptions);

            vantaEffect.current = VANTA.default({
              el: vantaRef.current,
              THREE: THREE,
              ...defaultOptions
            });
            
            console.log('✅ Vanta effect created successfully!');
          } else {
            console.log('❌ No element found for Vanta effect');
          }
        } catch (error) {
          console.error('❌ Vanta.js could not load:', error);
        }
      };

      initVanta();
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [effect, options]);

  return vantaRef;
};

// Predefined configurations for common use cases
export const VantaPresets = {
  oceanWaves: {
    color: 0x2563eb,
    shininess: 30.00,
    waveHeight: 15.00,
    waveSpeed: 0.75,
    zoom: 1.00
  },
  
  calmWaves: {
    color: 0x3b82f6,
    shininess: 20.00,
    waveHeight: 8.00,
    waveSpeed: 0.5,
    zoom: 1.2
  },
  
  medicalBirds: {
    color1: 0x2563eb,
    color2: 0x3b82f6,
    colorMode: 'variance',
    birdSize: 1.2,
    wingSpan: 15,
    speedLimit: 3,
    separation: 15,
    alignment: 20,
    cohesion: 15,
    quantity: 3
  },
  
  networkNodes: {
    color: 0x2563eb,
    backgroundColor: 0x1e40af,
    points: 10,
    maxDistance: 20,
    spacing: 15,
    showDots: true
  }
};
