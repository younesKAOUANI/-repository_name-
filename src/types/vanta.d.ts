// Type declarations for Vanta.js
declare module 'vanta/dist/vanta.waves.min.js' {
  interface VantaWavesOptions {
    el: HTMLElement;
    THREE: any;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    shininess?: number;
    waveHeight?: number;
    waveSpeed?: number;
    zoom?: number;
  }

  interface VantaEffect {
    destroy(): void;
  }

  export default function waves(options: VantaWavesOptions): VantaEffect;
}

declare module 'vanta/dist/vanta.birds.min.js' {
  interface VantaBirdsOptions {
    el: HTMLElement;
    THREE: any;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
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
  }

  interface VantaEffect {
    destroy(): void;
  }

  export default function birds(options: VantaBirdsOptions): VantaEffect;
}

declare module 'vanta/dist/vanta.net.min.js' {
  interface VantaNetOptions {
    el: HTMLElement;
    THREE: any;
    mouseControls?: boolean;
    touchControls?: boolean;
    gyroControls?: boolean;
    minHeight?: number;
    minWidth?: number;
    scale?: number;
    scaleMobile?: number;
    color?: number;
    backgroundColor?: number;
    points?: number;
    maxDistance?: number;
    spacing?: number;
    showDots?: boolean;
  }

  interface VantaEffect {
    destroy(): void;
  }

  export default function net(options: VantaNetOptions): VantaEffect;
}
