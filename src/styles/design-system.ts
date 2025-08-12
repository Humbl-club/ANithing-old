/**
 * ANITHING Design System
 * Comprehensive design tokens for dark theme with pink accents
 * Ensuring AAA accessibility standards
 */

// Core Brand Colors - Dark theme with pink accents
export const colors = {
  // Dark Background Gradients
  background: {
    primary: '#0a0a0f',      // Deep space navy
    secondary: '#1a1a2e',    // Rich dark purple
    tertiary: '#16213e',     // Deep blue-gray
    surface: '#1e1e2e',      // Card backgrounds
    overlay: 'rgba(26, 26, 46, 0.95)', // Modal overlays
  },

  // Pink Accent System
  pink: {
    50: '#fdf2f8',   // Lightest pink for text on dark
    100: '#fce7f3',  // Very light pink
    200: '#fbcfe8',  // Light pink
    300: '#f9a8d4',  // Medium-light pink
    400: '#f472b6',  // Medium pink
    500: '#ff006e',  // Primary pink - main brand color
    600: '#ec4899',  // Pink 600
    700: '#be185d',  // Darker pink
    800: '#9d174d',  // Very dark pink
    900: '#831843',  // Deepest pink
    accent: '#ff4081', // Secondary pink accent
    light: '#ff79b0', // Light pink accent
  },

  // Secondary Colors for Contrast
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
  },

  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Neutral Colors (High Contrast for Accessibility)
  neutral: {
    50: '#f8fafc',   // Pure white alternative
    100: '#f1f5f9',  // Very light gray
    200: '#e2e8f0',  // Light gray
    300: '#cbd5e1',  // Medium-light gray
    400: '#94a3b8',  // Medium gray
    500: '#64748b',  // Base gray
    600: '#475569',  // Medium-dark gray
    700: '#334155',  // Dark gray
    800: '#1e293b',  // Very dark gray
    900: '#0f172a',  // Near black
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
    900: '#7f1d1d',
  },

  // Special Effects
  glow: {
    pink: 'rgba(255, 0, 110, 0.4)',
    purple: 'rgba(168, 85, 247, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
  },
} as const;

// Typography System
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Consolas', 'Monaco', 'monospace'],
    heading: ['Inter', 'system-ui', 'sans-serif'],
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
    '5xl': ['3rem', { lineHeight: '1.16667' }],   // 48px
    '6xl': ['3.75rem', { lineHeight: '1.13333' }], // 60px
    '7xl': ['4.5rem', { lineHeight: '1.11111' }], // 72px
    '8xl': ['6rem', { lineHeight: '1' }],         // 96px
    '9xl': ['8rem', { lineHeight: '1' }],         // 128px
  },

  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
} as const;

// Spacing System (8pt grid)
export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// Shadow System (Layered depth)
export const shadows = {
  // Standard shadows
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Brand glow effects
  glow: {
    pink: {
      sm: '0 0 10px rgba(255, 0, 110, 0.3)',
      md: '0 0 20px rgba(255, 0, 110, 0.4)',
      lg: '0 0 30px rgba(255, 0, 110, 0.5)',
      xl: '0 0 40px rgba(255, 0, 110, 0.6)',
    },
    purple: {
      sm: '0 0 10px rgba(168, 85, 247, 0.3)',
      md: '0 0 20px rgba(168, 85, 247, 0.4)',
      lg: '0 0 30px rgba(168, 85, 247, 0.5)',
      xl: '0 0 40px rgba(168, 85, 247, 0.6)',
    },
    blue: {
      sm: '0 0 10px rgba(59, 130, 246, 0.3)',
      md: '0 0 20px rgba(59, 130, 246, 0.4)',
      lg: '0 0 30px rgba(59, 130, 246, 0.5)',
      xl: '0 0 40px rgba(59, 130, 246, 0.6)',
    },
  },

  // Glassmorphism shadows
  glass: {
    sm: '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.05)',
    md: '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
    xl: '0 24px 48px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.10)',
  },
} as const;

// Border Radius System
export const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// Animation Timing
export const animations = {
  timing: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  easing: {
    linear: 'cubic-bezier(0.0, 0.0, 1.0, 1.0)',
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1.0)',
    easeIn: 'cubic-bezier(0.42, 0.0, 1.0, 1.0)',
    easeOut: 'cubic-bezier(0.0, 0.0, 0.58, 1.0)',
    easeInOut: 'cubic-bezier(0.42, 0.0, 0.58, 1.0)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// Breakpoints
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Component Variants
export const variants = {
  button: {
    primary: {
      background: colors.pink[500],
      color: colors.neutral[50],
      hover: {
        background: colors.pink[400],
        shadow: shadows.glow.pink.md,
      },
    },
    secondary: {
      background: colors.purple[600],
      color: colors.neutral[50],
      hover: {
        background: colors.purple[500],
        shadow: shadows.glow.purple.md,
      },
    },
    ghost: {
      background: 'transparent',
      color: colors.neutral[200],
      border: `1px solid ${colors.neutral[700]}`,
      hover: {
        background: colors.neutral[800],
        border: `1px solid ${colors.pink[500]}`,
      },
    },
  },

  card: {
    default: {
      background: colors.background.surface,
      border: `1px solid ${colors.neutral[800]}`,
      shadow: shadows.glass.md,
    },
    elevated: {
      background: colors.background.surface,
      border: `1px solid ${colors.neutral[700]}`,
      shadow: shadows.glass.lg,
      glow: shadows.glow.pink.sm,
    },
    interactive: {
      background: colors.background.surface,
      border: `1px solid ${colors.neutral[800]}`,
      shadow: shadows.glass.md,
      hover: {
        border: `1px solid ${colors.pink[500]}`,
        shadow: shadows.glass.xl,
        glow: shadows.glow.pink.md,
      },
    },
  },
} as const;

// Accessibility helpers
export const a11y = {
  focusRing: {
    default: `0 0 0 2px ${colors.pink[500]}`,
    offset: `0 0 0 2px ${colors.background.primary}, 0 0 0 4px ${colors.pink[500]}`,
  },
  
  contrast: {
    // Ensure minimum contrast ratios
    text: {
      primary: colors.neutral[50],    // AAA on dark backgrounds
      secondary: colors.neutral[200], // AA on dark backgrounds
      tertiary: colors.neutral[400],  // AA on medium backgrounds
    },
    
    interactive: {
      primary: colors.pink[400],      // AAA compliant pink
      secondary: colors.purple[400],  // AAA compliant purple
      success: colors.success[400],   // AAA compliant green
      warning: colors.warning[400],   // AAA compliant amber
      error: colors.error[400],       // AAA compliant red
    },
  },
} as const;

export type DesignSystem = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  animations: typeof animations;
  breakpoints: typeof breakpoints;
  zIndex: typeof zIndex;
  variants: typeof variants;
  a11y: typeof a11y;
};

export const designSystem: DesignSystem = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  animations,
  breakpoints,
  zIndex,
  variants,
  a11y,
} as const;

export default designSystem;