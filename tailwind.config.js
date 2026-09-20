/**
 * CampusNav monochrome design tokens.
 *
 * CampusNav's interface language is strictly grayscale: white, off-white,
 * light/medium/dark gray, and black. Meaning is carried by icon, border
 * weight, fill, opacity, typography, pattern, and badge shape — never by hue
 * alone. To enforce that globally without rewriting every component, the
 * chromatic Tailwind scales are remapped onto neutral ramps here. Existing
 * semantic class names (`bg-red-50`, `text-green-700`, ...) keep their
 * relative lightness and therefore their visual hierarchy.
 */

/** Shared neutral ramp. Light values stay as surfaces, dark values as ink. */
const neutral = {
  50: '#FAFAFA',
  100: '#F0F0F2',
  200: '#E3E3E6',
  300: '#D2D2D7',
  400: '#AEAEB2',
  500: '#8E8E93',
  600: '#6E6E73',
  700: '#48484A',
  800: '#2C2C2E',
  900: '#1D1D1F',
  950: '#000000',
}

/** Higher-contrast ramp for states that must read as the strongest signal. */
const emphasis = {
  50: '#F5F5F7',
  100: '#EBEBED',
  200: '#D2D2D7',
  300: '#AEAEB2',
  400: '#6E6E73',
  500: '#48484A',
  600: '#2C2C2E',
  700: '#1D1D1F',
  800: '#000000',
  900: '#000000',
  950: '#000000',
}

/** Scales that previously carried hue and are now neutralized. */
const neutralizedScales = [
  'green', 'blue', 'amber', 'yellow', 'orange', 'purple', 'violet', 'indigo',
  'teal', 'cyan', 'sky', 'emerald', 'lime', 'fuchsia', 'pink', 'rose',
  'gray', 'slate', 'zinc', 'stone', 'neutral',
]

const monochromeScales = {
  // `red` and `destructive` states remain the strongest, so they use `emphasis`.
  red: { ...emphasis },
  ...Object.fromEntries(neutralizedScales.map((name) => [name, { ...neutral }])),
}

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
  		colors: {
			...monochromeScales,
			// CampusNav primary. `brand-700` is the primary action ink.
			brand: {
				'50': '#F5F5F7',
				'100': '#EBEBED',
				'200': '#D2D2D7',
				'300': '#AEAEB2',
				'400': '#8E8E93',
				'500': '#6E6E73',
				'600': '#48484A',
				'700': '#1D1D1F',
				'800': '#000000',
				'900': '#000000'
			},
			gold: {
				'50': '#F5F5F8',
				'100': '#E7E7EA',
				'200': '#D4D4D7',
				'300': '#B7B7BA',
				'400': '#98989B',
				'500': '#7A7A7D',
				'600': '#5D5D60',
				'700': '#424244'
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
  			},
  			'overlay-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'panel-in': {
  				from: { opacity: '0', transform: 'translateY(10px) scale(0.985)' },
  				to: { opacity: '1', transform: 'translateY(0) scale(1)' }
  			},
  			'sheet-up': {
  				from: { transform: 'translateY(100%)' },
  				to: { transform: 'translateY(0)' }
  			},
  			'drawer-in': {
  				from: { transform: 'translateX(-100%)' },
  				to: { transform: 'translateX(0)' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'overlay-in': 'overlay-in 0.18s ease-out',
  			'panel-in': 'panel-in 0.22s cubic-bezier(0.22, 1, 0.36, 1)',
  			'sheet-up': 'sheet-up 0.26s cubic-bezier(0.22, 1, 0.36, 1)',
  			'drawer-in': 'drawer-in 0.24s cubic-bezier(0.22, 1, 0.36, 1)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
