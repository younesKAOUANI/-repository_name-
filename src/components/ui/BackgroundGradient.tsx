import React from 'react';

interface BackgroundGradientProps {
    className?: string;
    centerX?: number;
    centerY?: number;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    intensity?: number;
}

const BackgroundGradient: React.FC<BackgroundGradientProps> = ({
    className = '',
    centerX = 50,
    centerY = 50,
    size = 'sm',
    intensity = 0.2,
}) => {
    const sizeMap = {
        sm: '100vw',
        md: '120vw',
        lg: '150vw',
        xl: '200vw',
    };

    const gradientSize = sizeMap[size];

    const gradientStyle = {
        background: `radial-gradient(
            ellipse ${gradientSize} ${gradientSize} at ${centerX}% ${centerY}%,
            rgba(34, 197, 94, ${intensity}) 0%,
            rgba(59, 130, 246, ${intensity * 0.5}) 10%,
            rgba(6, 182, 212, ${intensity * 0.3}) 40%,
            rgba(34, 197, 94, ${intensity * 0.1}) 75%,
            transparent 100%
        )`,
    };

    return (
        <div
            className={`absolute inset-0 -z-10 pointer-events-none ${className}`}
            style={gradientStyle}
        />
    );
};

export default BackgroundGradient;