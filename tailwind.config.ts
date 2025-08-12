import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				glass: {
					DEFAULT: 'hsl(var(--glass-bg))',
					border: 'hsl(var(--glass-border))',
					hover: 'hsl(var(--glass-hover))',
					focus: 'hsl(var(--glass-focus))'
				},
				pink: {
					50: '#fdf2f8',
					100: '#fce7f3',
					200: '#fbcfe8',
					300: '#f9a8d4',
					400: '#f472b6',
					500: '#ff006e', // Primary ANITHING pink
					600: '#ec4899',
					700: '#be185d',
					800: '#9d174d',
					900: '#831843',
					950: '#4c1d3b',
					accent: '#ff4081', // Secondary pink accent
					light: '#ff79b0', // Light pink accent
				},
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
					950: '#3b1065'
				},
				// ANITHING Brand Colors
				brand: {
					primary: '#0a0a0f', // Deep space navy
					secondary: '#1a1a2e', // Rich dark purple
					tertiary: '#16213e', // Deep blue-gray
					surface: '#1e1e2e', // Card backgrounds
					overlay: 'rgba(26, 26, 46, 0.95)', // Modal overlays
				},
				// Enhanced neutral colors for better contrast
				neutral: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-pink': 'linear-gradient(135deg, hsl(329 75% 51%), hsl(315 100% 65%))',
				'gradient-purple': 'linear-gradient(135deg, hsl(270 91% 65%), hsl(280 100% 70%))',
				'gradient-rainbow': 'linear-gradient(135deg, hsl(219 100% 65%), hsl(270 95% 50%), hsl(329 75% 51%))',
				'gradient-glass': 'linear-gradient(135deg, hsl(220 20% 8% / 0.4), hsl(220 15% 12% / 0.6))',
				'shimmer': 'linear-gradient(110deg, transparent 40%, hsl(var(--foreground) / 0.1) 50%, transparent 60%)'
			},
			backdropBlur: {
				xs: '2px',
				sm: '4px',
				md: '8px',
				lg: '12px',
				xl: '16px',
				'2xl': '20px',
				'3xl': '24px',
				'glass': '20px',
				'heavy': '40px'
			},
			boxShadow: {
				'glow-primary': 'var(--glow-primary)',
				'glow-accent': 'var(--glow-accent)',
				'glow-card': 'var(--glow-card)',
				// ANITHING Pink Glow Effects
				'glow-pink-sm': '0 0 10px rgba(255, 0, 110, 0.3)',
				'glow-pink-md': '0 0 20px rgba(255, 0, 110, 0.4)',
				'glow-pink-lg': '0 0 30px rgba(255, 0, 110, 0.5)',
				'glow-pink-xl': '0 0 40px rgba(255, 0, 110, 0.6)',
				// Purple Glow Effects
				'glow-purple-sm': '0 0 10px rgba(168, 85, 247, 0.3)',
				'glow-purple-md': '0 0 20px rgba(168, 85, 247, 0.4)',
				'glow-purple-lg': '0 0 30px rgba(168, 85, 247, 0.5)',
				'glow-purple-xl': '0 0 40px rgba(168, 85, 247, 0.6)',
				// Glass Shadows
				'glass-sm': '0 4px 6px rgba(0, 0, 0, 0.07), 0 1px 3px rgba(0, 0, 0, 0.05)',
				'glass-md': '0 8px 16px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
				'glass-lg': '0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
				'glass-xl': '0 24px 48px rgba(0, 0, 0, 0.15), 0 12px 24px rgba(0, 0, 0, 0.10)',
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			zIndex: {
				'base': '10',
				'dropdown': '100', 
				'sticky': '110',
				'fixed': '120',
				'modal-backdrop': '130',
				'modal': '140',
				'popover': '150',
				'tooltip': '160',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-in-right': {
					'0%': { opacity: '0', transform: 'translateX(100px)' },
					'100%': { opacity: '1', transform: 'translateX(0)' }
				},
				'bounce-in': {
					'0%': { opacity: '0', transform: 'scale(0.3)' },
					'50%': { opacity: '1', transform: 'scale(1.05)' },
					'70%': { transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'glow-pulse': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(219 100% 65% / 0.3)' },
					'50%': { boxShadow: '0 0 40px hsl(219 100% 65% / 0.6)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'float-delayed': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-15px) rotate(180deg)' }
				},
				'gradient-shift': {
					'0%, 100%': { 
						backgroundPosition: '0% 50%',
						transform: 'scale(1)'
					},
					'50%': { 
						backgroundPosition: '100% 50%',
						transform: 'scale(1.05)'
					}
				},
				'particle-float': {
					'0%, 100%': { 
						transform: 'translateY(0px) translateX(0px) rotate(0deg)',
						opacity: '0.4'
					},
					'25%': { 
						transform: 'translateY(-20px) translateX(10px) rotate(90deg)',
						opacity: '0.8'
					},
					'50%': { 
						transform: 'translateY(-10px) translateX(-10px) rotate(180deg)',
						opacity: '0.6'
					},
					'75%': { 
						transform: 'translateY(-15px) translateX(5px) rotate(270deg)',
						opacity: '0.9'
					}
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px hsl(219 100% 65% / 0.3)',
						transform: 'scale(1)'
					},
					'50%': { 
						boxShadow: '0 0 40px hsl(219 100% 65% / 0.6), 0 0 60px hsl(315 100% 65% / 0.4)',
						transform: 'scale(1.02)'
					}
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'slide-up-fade': {
					'0%': { 
						opacity: '0', 
						transform: 'translateY(30px) scale(0.95)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'translateY(0px) scale(1)' 
					}
				},
				'rotate-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'background-pan': {
					'0%': { backgroundPosition: '0% 0%' },
					'100%': { backgroundPosition: '100% 100%' }
				},
				'slide-in-from-bottom': {
					'0%': { 
						opacity: '0', 
						transform: 'translateY(100%)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'translateY(0)' 
					}
				},
				'slide-in-from-top': {
					'0%': { 
						opacity: '0', 
						transform: 'translateY(-100%)' 
					},
					'100%': { 
						opacity: '1', 
						transform: 'translateY(0)' 
					}
				},
				'glass-shine': {
					'0%': { 
						transform: 'translateX(-100%) skewX(-12deg)',
						opacity: '0'
					},
					'50%': {
						opacity: '1'
					},
					'100%': { 
						transform: 'translateX(200%) skewX(-12deg)',
						opacity: '0'
					}
				},
				'glass-pulse': {
					'0%, 100%': { 
						background: 'rgba(255, 255, 255, 0.05)',
						borderColor: 'rgba(255, 255, 255, 0.1)'
					},
					'50%': { 
						background: 'rgba(255, 255, 255, 0.1)',
						borderColor: 'rgba(255, 255, 255, 0.2)'
					}
				},
				'micro-bounce': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-2px)' }
				},
				'glass-glow': {
					'0%, 100%': { 
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 20px rgba(255, 105, 180, 0.1)'
					},
					'50%': { 
						boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15), 0 0 30px rgba(255, 105, 180, 0.2)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.8s ease-out',
				'scale-in': 'scale-in 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.7s ease-out',
				'bounce-in': 'bounce-in 0.8s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'float-delayed': 'float-delayed 4s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 8s ease-in-out infinite',
				'particle-float': 'particle-float 6s ease-in-out infinite',
				'shimmer': 'shimmer 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'slide-up-fade': 'slide-up-fade 0.6s ease-out',
				'rotate-slow': 'rotate-slow 20s linear infinite',
				'background-pan': 'background-pan 10s ease-in-out infinite',
				'slide-in-from-bottom': 'slide-in-from-bottom 0.3s ease-out',
				'slide-in-from-top': 'slide-in-from-top 0.3s ease-out',
				'glass-shine': 'glass-shine 2s ease-in-out infinite',
				'glass-pulse': 'glass-pulse 2s ease-in-out infinite',
				'micro-bounce': 'micro-bounce 1s ease-in-out infinite',
				'glass-glow': 'glass-glow 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;