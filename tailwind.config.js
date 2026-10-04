/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		opacity: Object.fromEntries(Array.from({ length: 101 }, (_, i) => [i, `${i / 100}`])),
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		// Predictable overlay scale. Radix/shadcn overlays use z-50 (overlay);
		// full-screen modal dialogs use z-[70]+; toasts use z-[100].
		zIndex: {
			sticky: '20',
			sidebar: '30',
			dropdown: '40',
			'clara-button': '45',
			'clara-panel': '46',
			overlay: '50',
			modal: '70',
			toast: '100'
		},
  		colors: {
			// Semantic theme tokens (DEC-UI-004). Values live in src/index.css and
			// switch with the `.dark` class; components never hard-code hex colors.
			canvas: { DEFAULT: 'rgb(var(--canvas) / <alpha-value>)', raised: 'rgb(var(--canvas-raised) / <alpha-value>)' },
			surface: 'rgb(var(--surface) / <alpha-value>)',
			subtle: 'rgb(var(--subtle) / <alpha-value>)',
			fill: { DEFAULT: 'rgb(var(--fill) / <alpha-value>)', strong: 'rgb(var(--fill-strong) / <alpha-value>)' },
			line: { DEFAULT: 'rgb(var(--line) / <alpha-value>)', strong: 'rgb(var(--line-strong) / <alpha-value>)' },
			ink: {
				DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
				strong: 'rgb(var(--ink-strong) / <alpha-value>)',
				mid: 'rgb(var(--ink-mid) / <alpha-value>)',
				soft: 'rgb(var(--ink-soft) / <alpha-value>)',
				faint: 'rgb(var(--ink-faint) / <alpha-value>)',
				ghost: 'rgb(var(--ink-ghost) / <alpha-value>)'
			},
			'on-ink': 'rgb(var(--on-ink) / <alpha-value>)',
			// Legacy ramps kept so older class names stay valid; they resolve to tokens.
			brand: {
				'50': 'rgb(var(--fill) / <alpha-value>)', '100': 'rgb(var(--fill-strong) / <alpha-value>)', '200': 'rgb(var(--line-strong) / <alpha-value>)', '300': 'rgb(var(--ink-ghost) / <alpha-value>)',
				'400': 'rgb(var(--ink-faint) / <alpha-value>)', '500': 'rgb(var(--ink-soft) / <alpha-value>)', '600': 'rgb(var(--ink-mid) / <alpha-value>)', '700': 'rgb(var(--ink) / <alpha-value>)',
				'800': 'rgb(var(--ink-strong) / <alpha-value>)', '900': 'rgb(var(--ink-strong) / <alpha-value>)'
			},
			gold: {
				'50': 'rgb(var(--fill) / <alpha-value>)', '100': 'rgb(var(--fill-strong) / <alpha-value>)', '200': 'rgb(var(--line-strong) / <alpha-value>)', '300': 'rgb(var(--ink-ghost) / <alpha-value>)',
				'400': 'rgb(var(--ink-faint) / <alpha-value>)', '500': 'rgb(var(--ink-soft) / <alpha-value>)', '600': 'rgb(var(--ink-soft) / <alpha-value>)', '700': 'rgb(var(--ink-mid) / <alpha-value>)'
			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
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
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
		boxShadow: {
			soft: 'var(--shadow-soft)',
			float: 'var(--shadow-float)'
		},
		transitionTimingFunction: {
			campus: 'cubic-bezier(0.22, 1, 0.36, 1)'
		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
