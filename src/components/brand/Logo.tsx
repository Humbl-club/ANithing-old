import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'default' | 'white' | 'icon-only';
  animated?: boolean;
}

const sizeMap = {
  xs: 'h-6 w-auto',
  sm: 'h-8 w-auto', 
  md: 'h-12 w-auto',
  lg: 'h-16 w-auto',
  xl: 'h-20 w-auto',
  '2xl': 'h-24 w-auto',
};

export function Logo({ 
  className, 
  size = 'md', 
  variant = 'default',
  animated = false 
}: LogoProps) {
  const logoClass = cn(
    sizeMap[size],
    animated && 'hover:scale-105 transition-transform duration-300 ease-spring',
    className
  );

  if (variant === 'icon-only') {
    return (
      <div className={cn('inline-flex items-center justify-center', logoClass)}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background Circle with Gradient */}
          <defs>
            <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff006e" />
              <stop offset="50%" stopColor="#ff4081" />
              <stop offset="100%" stopColor="#ff79b0" />
            </linearGradient>
            <filter id="iconGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Outer glow circle */}
          <circle 
            cx="24" 
            cy="24" 
            r="22" 
            fill="url(#iconGradient)" 
            opacity="0.2"
            filter="url(#iconGlow)"
          />
          
          {/* Main circle */}
          <circle 
            cx="24" 
            cy="24" 
            r="20" 
            fill="url(#iconGradient)"
            className={animated ? 'animate-pulse-glow' : ''}
          />
          
          {/* Stylized "A" letter with anime aesthetic */}
          <path
            d="M16 34 L24 14 L32 34 M19 28 L29 28"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          
          {/* Anime-style star accent */}
          <path
            d="M36 16 L37 18 L39 18 L37.5 19.5 L38 22 L36 20.5 L34 22 L34.5 19.5 L33 18 L35 18 Z"
            fill="white"
            opacity="0.9"
            className={animated ? 'animate-float' : ''}
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      {/* Icon */}
      <div className="relative">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(sizeMap[size], animated && 'hover:rotate-12 transition-transform duration-300')}
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff006e" />
              <stop offset="30%" stopColor="#ff4081" />
              <stop offset="70%" stopColor="#ff79b0" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff006e" />
              <stop offset="25%" stopColor="#ff4081" />
              <stop offset="50%" stopColor="#ff79b0" />
              <stop offset="75%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Background glow */}
          <circle 
            cx="24" 
            cy="24" 
            r="22" 
            fill="url(#logoGradient)" 
            opacity="0.15"
            filter="url(#glow)"
            className={animated ? 'animate-pulse' : ''}
          />
          
          {/* Main icon background */}
          <circle 
            cx="24" 
            cy="24" 
            r="18" 
            fill="url(#logoGradient)"
            className={animated ? 'animate-gradient-shift' : ''}
          />
          
          {/* Stylized "A" with modern anime aesthetic */}
          <g filter="url(#textGlow)">
            <path
              d="M16 32 L24 16 L32 32 M19.5 26 L28.5 26"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              opacity="0.95"
            />
          </g>
          
          {/* Decorative elements */}
          <g className={animated ? 'animate-float' : ''}>
            {/* Top star */}
            <path
              d="M35 13 L36 15 L38 15 L36.5 16.5 L37 19 L35 17.5 L33 19 L33.5 16.5 L32 15 L34 15 Z"
              fill="white"
              opacity="0.8"
            />
            
            {/* Bottom right sparkle */}
            <circle cx="37" cy="31" r="1.5" fill="white" opacity="0.6" />
            <circle cx="34" cy="35" r="1" fill="white" opacity="0.7" />
            
            {/* Left side accent */}
            <path
              d="M13 25 L14 27 L16 27 L14.5 28.5 L15 31 L13 29.5 L11 31 L11.5 28.5 L10 27 L12 27 Z"
              fill="white"
              opacity="0.5"
              transform="scale(0.7)"
            />
          </g>
        </svg>
      </div>

      {/* Text Logo */}
      <div className="flex flex-col leading-none">
        <svg
          viewBox="0 0 200 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            'h-auto',
            size === 'xs' && 'w-16',
            size === 'sm' && 'w-20', 
            size === 'md' && 'w-32',
            size === 'lg' && 'w-40',
            size === 'xl' && 'w-48',
            size === '2xl' && 'w-56',
            animated && 'hover:scale-105 transition-transform duration-300'
          )}
        >
          <defs>
            <linearGradient id="mainTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {variant === 'white' ? (
                <>
                  <stop offset="0%" stopColor="white" />
                  <stop offset="100%" stopColor="white" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#ff006e" />
                  <stop offset="20%" stopColor="#ff4081" />
                  <stop offset="40%" stopColor="#ff79b0" />
                  <stop offset="60%" stopColor="#c084fc" />
                  <stop offset="80%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </>
              )}
            </linearGradient>
            
            <filter id="mainTextGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* ANITHING Text */}
          <text
            x="5"
            y="28"
            fontSize="24"
            fontWeight="800"
            fontFamily="Inter, system-ui, sans-serif"
            fill="url(#mainTextGradient)"
            filter="url(#mainTextGlow)"
            className={animated ? 'animate-shimmer' : ''}
          >
            ANITHING
          </text>
          
          {/* Subtitle */}
          <text
            x="5"
            y="38"
            fontSize="8"
            fontWeight="500"
            fontFamily="Inter, system-ui, sans-serif"
            fill={variant === 'white' ? 'rgba(255,255,255,0.7)' : 'rgba(255, 0, 110, 0.8)'}
            letterSpacing="2px"
          >
            ANIME • MANGA • MORE
          </text>
        </svg>
      </div>
    </div>
  );
}

export default Logo;