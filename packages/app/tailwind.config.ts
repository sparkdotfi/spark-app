import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '.storybook/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      textColor: {
        primary: {
          DEFAULT: 'rgb(var(--base-black))',
          inverse: 'rgb(var(--base-white))',
        },
        secondary: 'rgb(var(--neutral-600))',
        tertiary: 'rgb(var(--neutral-300))',
        brand: {
          primary: 'rgb(var(--primary-800))',
          secondary: 'rgb(var(--primary-800))', // @todo: split primary and secondary
        },
        system: {
          success: {
            primary: 'rgb(var(--success-600))',
            secondary: 'rgb(var(--success-700))',
          },
          warning: {
            primary: 'rgb(var(--warning-600))',
          },
          error: {
            primary: 'rgb(var(--error-700))',
            secondary: 'rgb(var(--error-800))',
          },
        },
        feature: {
          savings: {
            primary: 'rgb(var(--savings-500))',
            secondary: 'rgb(var(--savings-600))',
          },
          borrow: {
            primary: 'rgb(var(--borrow-500))',
            secondary: 'rgb(var(--borrow-600))',
          },
          farms: {
            primary: 'rgb(var(--farms-500))',
            secondary: 'rgb(var(--farms-600))',
          },
        },
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
        roobert: ['Roobert', ...defaultTheme.fontFamily.sans],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
      },
      outlineColor: {
        primary: 'rgb(var(--neutral-100))',
        secondary: 'rgb(var(--neutral-200))',
        tertiary: 'rgb(var(--neutral-300))',
        quaternary: 'rgb(var(--neutral-400))',
        brand: {
          primary: 'rgb(var(--primary-400))',
          secondary: 'rgb(var(--primary-500))',
          tertiary: 'rgb(var(--primary-600))',
        },
        system: {
          success: {
            primary: 'rgb(var(--success-500))',
            secondary: 'rgb(var(--success-600))',
          },
          warning: {
            primary: 'rgb(var(--warning-500))',
            secondary: 'rgb(var(--warning-600))',
          },
          error: {
            primary: 'rgb(var(--error-500))',
            secondary: 'rgb(var(--error-600))',
          },
        },
        focus: 'rgb(var(--primary-200))',
      },
      borderColor: {
        primary: 'rgb(var(--neutral-100))',
        secondary: 'rgb(var(--neutral-200))',
        tertiary: 'rgb(var(--neutral-300))',
        quaternary: 'rgb(var(--neutral-400))',
        brand: {
          primary: 'rgb(var(--primary-400))',
          secondary: 'rgb(var(--primary-500))',
          tertiary: 'rgb(var(--primary-600))',
        },
        system: {
          success: {
            primary: 'rgb(var(--success-500))',
            secondary: 'rgb(var(--success-600))',
          },
          warning: {
            primary: 'rgb(var(--warning-500))',
            secondary: 'rgb(var(--warning-600))',
          },
          error: {
            primary: 'rgb(var(--error-600))',
            secondary: 'rgb(var(--error-700))',
          },
        },
        focus: 'rgb(var(--primary-200))',
      },
      backgroundColor: {
        primary: {
          DEFAULT: 'rgb(var(--base-white))',
          inverse: 'rgb(var(--base-black))',
        },
        secondary: {
          DEFAULT: 'rgb(var(--neutral-50))',
          inverse: 'rgb(var(--neutral-950))',
        },
        tertiary: 'rgb(var(--neutral-100))',
        quaternary: 'rgb(var(--neutral-200))',
        brand: {
          primary: 'rgb(var(--primary-50))',
          secondary: 'rgb(var(--primary-100))',
          tertiary: 'rgb(var(--primary-200))',
          quaternary: 'rgb(var(--primary-300))',
        },
        system: {
          success: {
            primary: 'rgb(var(--success-100))',
            secondary: 'rgb(var(--success-200))',
          },
          warning: {
            primary: 'rgb(var(--warning-100))',
            secondary: 'rgb(var(--warning-200))',
          },
          error: {
            primary: 'rgb(var(--error-100))',
            secondary: 'rgb(var(--error-200))',
          },
        },
      },
      colors: {
        base: {
          white: 'rgb(var(--base-white))',
          black: 'rgb(var(--base-black))',
        },
        neutral: {
          DEFAULT: 'rgb(var(--neutral-500))',
          50: 'rgb(var(--neutral-50))',
          100: 'rgb(var(--neutral-100))',
          200: 'rgb(var(--neutral-200))',
          300: 'rgb(var(--neutral-300))',
          400: 'rgb(var(--neutral-400))',
          500: 'rgb(var(--neutral-500))',
          600: 'rgb(var(--neutral-600))',
          700: 'rgb(var(--neutral-700))',
          800: 'rgb(var(--neutral-800))',
          900: 'rgb(var(--neutral-900))',
          950: 'rgb(var(--neutral-950))',
        },
        primary: {
          DEFAULT: 'rgb(var(--primary-800))',
          50: 'rgb(var(--primary-50))',
          100: 'rgb(var(--primary-100))',
          200: 'rgb(var(--primary-200))',
          300: 'rgb(var(--primary-300))',
          400: 'rgb(var(--primary-400))',
          500: 'rgb(var(--primary-500))',
          600: 'rgb(var(--primary-600))',
          700: 'rgb(var(--primary-700))',
          800: 'rgb(var(--primary-800))',
          900: 'rgb(var(--primary-900))',
          950: 'rgb(var(--primary-950))',
        },
        success: {
          DEFAULT: 'rgb(var(--success-600))',
          100: 'rgb(var(--success-100))',
          200: 'rgb(var(--success-200))',
          300: 'rgb(var(--success-300))',
          400: 'rgb(var(--success-400))',
          500: 'rgb(var(--success-500))',
          600: 'rgb(var(--success-600))',
          700: 'rgb(var(--success-700))',
          800: 'rgb(var(--success-800))',
          900: 'rgb(var(--success-900))',
          950: 'rgb(var(--success-950))',
        },
        warning: {
          DEFAULT: 'rgb(var(--warning-600))',
          100: 'rgb(var(--warning-100))',
          200: 'rgb(var(--warning-200))',
          300: 'rgb(var(--warning-300))',
          400: 'rgb(var(--warning-400))',
          500: 'rgb(var(--warning-500))',
          600: 'rgb(var(--warning-600))',
          700: 'rgb(var(--warning-700))',
          800: 'rgb(var(--warning-800))',
          900: 'rgb(var(--warning-900))',
          950: 'rgb(var(--warning-950))',
        },
        error: {
          DEFAULT: 'rgb(var(--error-700))',
          100: 'rgb(var(--error-100))',
          200: 'rgb(var(--error-200))',
          300: 'rgb(var(--error-300))',
          400: 'rgb(var(--error-400))',
          500: 'rgb(var(--error-500))',
          600: 'rgb(var(--error-600))',
          700: 'rgb(var(--error-700))',
          800: 'rgb(var(--error-800))',
          900: 'rgb(var(--error-900))',
          950: 'rgb(var(--error-950))',
        },
        savings: {
          DEFAULT: 'rgb(var(--savings-600))',
          100: 'rgb(var(--savings-100))',
          200: 'rgb(var(--savings-200))',
          300: 'rgb(var(--savings-300))',
          400: 'rgb(var(--savings-400))',
          500: 'rgb(var(--savings-500))',
          600: 'rgb(var(--savings-600))',
          700: 'rgb(var(--savings-700))',
          800: 'rgb(var(--savings-800))',
          900: 'rgb(var(--savings-900))',
          950: 'rgb(var(--savings-950))',
        },
        borrow: {
          DEFAULT: 'rgb(var(--borrow-600))',
          100: 'rgb(var(--borrow-100))',
          200: 'rgb(var(--borrow-200))',
          300: 'rgb(var(--borrow-300))',
          400: 'rgb(var(--borrow-400))',
          500: 'rgb(var(--borrow-500))',
          600: 'rgb(var(--borrow-600))',
          700: 'rgb(var(--borrow-700))',
          800: 'rgb(var(--borrow-800))',
          900: 'rgb(var(--borrow-900))',
          950: 'rgb(var(--borrow-950))',
        },
        farms: {
          DEFAULT: 'rgb(var(--farms-600))',
          50: 'rgb(var(--farms-50))',
          100: 'rgb(var(--farms-100))',
          200: 'rgb(var(--farms-200))',
          300: 'rgb(var(--farms-300))',
          400: 'rgb(var(--farms-400))',
          500: 'rgb(var(--farms-500))',
          600: 'rgb(var(--farms-600))',
          700: 'rgb(var(--farms-700))',
          800: 'rgb(var(--farms-800))',
          900: 'rgb(var(--farms-900))',
          950: 'rgb(var(--farms-950))',
        },
        page: {
          savings: 'rgb(var(--page-savings))',
          borrow: 'rgb(var(--page-borrow))',
          farms: 'rgb(var(--page-farms))',
        },
        fg: {
          primary: {
            DEFAULT: 'rgb(var(--neutral-950))',
            inverse: 'rgb(var(--neutral-50))',
          },
          secondary: {
            DEFAULT: 'rgb(var(--neutral-800))',
            inverse: 'rgb(var(--neutral-200))',
          },
          tertiary: 'rgb(var(--neutral-600))',
          quaternary: 'rgb(var(--neutral-500))',
          brand: {
            primary: 'rgb(var(--primary-500))',
            secondary: 'rgb(var(--primary-600))',
            tertiary: 'rgb(var(--primary-700))',
            quaternary: 'rgb(var(--primary-800))',
          },
          system: {
            success: {
              primary: 'rgb(var(--success-500))',
              secondary: 'rgb(var(--success-600))',
            },
            warning: {
              primary: 'rgb(var(--warning-500))',
              secondary: 'rgb(var(--warning-600))',
            },
            error: {
              primary: 'rgb(var(--error-600))',
              secondary: 'rgb(var(--error-700))',
            },
          },
        },
        alpha: {
          dialog: 'color-mix(in srgb, rgb(var(--base-black)) 40%, transparent)',
          overlay: 'color-mix(in srgb, rgb(var(--neutral-100)) 30%, transparent)',
        },
      },
      backgroundImage: {
        // gradients
        'gradient-spark-primary-1': 'linear-gradient(270.98deg, #FFCD4D -5.71%, #FA43BD 102.6%)',
        'gradient-spark-primary-2': 'linear-gradient(104.99deg, #FFC555 -21.89%, #FB4AB9 87.44%)',
        'gradient-spark-secondary': 'linear-gradient(104.99deg, #FFC555 -21.89%, #FB4AB9 87.44%)',
        'gradient-orange': 'linear-gradient(89.87deg, #FF895D 0.14%, #FFE6A4 50.03%, #FFFFFF 99.92%)',
        'gradient-purple': 'linear-gradient(90.22deg, #7A6BFF 0.12%, #BDDEFF 49.95%, #FFFFFF 99.78%)',
        'gradient-magenta': 'linear-gradient(89.84deg, #FA43BD -2.08%, #FFB5B5 48.92%, #FFFFFF 99.92%)',
        'gradient-green': 'linear-gradient(90deg, #11B93E 0%, #40DA69 50.47%, #FFFFFF 100%)',
        'gradient-savings': 'radial-gradient(155.75% 155.75% at 50% 155.75%, #FFEF79 0%, #00C2A1 100%)',
        'gradient-ltv-green': 'linear-gradient(231deg, #00C2A1 0%, #FFEF79 100%)',
        'gradient-ltv-orange': 'linear-gradient(231deg, #FF895D 0%, #FFCD4D 100%)',
        'gradient-ltv-red': 'linear-gradient(231deg, #D91838 0%, #FF7881 100%)',
        'gradient-savings-dai-counter': 'linear-gradient(90deg, #FFF 38.9%, #7CC54D 64.65%, #53AB3C 97.76%)',
        'gradient-savings-usds-counter': 'linear-gradient(90deg, #FFF 38.9%, #8CDB8B 64.65%, #00C2A1 97.76%)',
        'gradient-savings-opportunity-savings-rate':
          'linear-gradient(125deg, #FFF 19.84%, #8CDB8B 40.17%, #00C2A1 64.6%)',
        'gradient-savings-opportunity-button': 'linear-gradient(105deg, #43E26B, #10B73D)',
        'gradient-borrow-rate-orange': 'linear-gradient(89.87deg, #FFFFFF 0.14%, #FFE6A4 50.03%, #FF895D 99.92%)',
        'gradient-farms-1': 'linear-gradient(89.84deg, #FFFFFF -2.08%, #FFB5B5 48.92%, #FA43BD 99.92%)',
        'gradient-farms-2': 'linear-gradient(270deg, #FA43BD -47.6%, #F5F5FA 102.16%)',
        'gradient-farms-3': 'linear-gradient(89.84deg, #FA43BD -2.08%, #FFB5B5 48.92%, #FFFFFF 99.92%)',
        'gradient-spark-rewards-1': 'linear-gradient(351deg, #5823F3 -2.08%, #61A8FF 86.76%)',
        'gradient-spark-rewards-2':
          'linear-gradient(90deg, rgba(88, 35, 243, 0.10) -23.03%, rgba(97, 168, 255, 0.10) 100%)',
        // backgrounds with images
        'sdai-token-panel': 'url(/src/ui/assets/savings/sdai-token-panel-bg.svg), linear-gradient(#101014, #101014)',
        'susds-token-panel': 'url(/src/ui/assets/savings/susds-token-panel-bg.svg), linear-gradient(#101014, #101014)',
        'active-farm-panel': 'url(/src/ui/assets/savings/active-farm-panel-bg.svg), linear-gradient(#101014, #101014)',
        'savings-opportunity-panel': 'url(/src/ui/assets/savings/savings-opportunity-panel-bg.svg)',
        'farm-cta-panel': 'url(/src/ui/assets/farms/farm-cta-panel-bg.svg)',
        'dai-upgrade': 'url(/src/ui/assets/savings/dai-upgrade-bg.svg), linear-gradient(#101014, #101014)',
        'sdai-upgrade': 'url(/src/ui/assets/savings/sdai-upgrade-bg.svg), linear-gradient(#101014, #101014)',
        'savings-welcome': 'url(/src/ui/assets/savings/savings-welcome-bg.svg)',
        'connect-wallet-cta':
          'url(/src/ui/assets/banners/connect-wallet-cta-bg.svg), linear-gradient(#101014, #101014)',
      },
      boxShadow: {
        nav: '0px 20px 40px 0px var(--nav-shadow)',
        tooltip: '0px 4px 30px 7px var(--tooltip-shadow)',
        xs: '0px 1px 4px rgb(16, 16, 20, 0.05)',
        sm: '0px 1px 10px rgb(16, 16, 20, 0.1), 0px 1px 2px rgb(16, 16, 20, 0.06)',
        md: '0px 4px 14px -2px rgb(16, 16, 20, 0.1), 0px 2px 8px -2px rgb(16, 16, 20, 0.04)',
        lg: '0px 12px 16px -4px rgb(16, 16, 20, 0.08), 0px 4px 6px -2px rgb(16, 16, 20, 0.03)',
        xl: '0px 20px 24px -4px rgb(16, 16, 20, 0.08), 0px 8px 8px -4px rgb(16, 16, 20, 0.03)',
        '2xl': '0px 24px 48px -12px rgb(16, 16, 20, 0.18)',
        '3xl': '0px 32px 64px -12px rgb(16, 16, 20, 0.24)',
        'glow-xs': '0px 1px 4px rgb(255, 255, 255, 0.1)',
        'glow-sm': '0px 1px 10px rgb(255, 255, 255, 0.2), 0px 1px 2px rgb(255, 255, 255, 0.12)',
        'glow-md': '0px 4px 14px -2px rgb(255, 255, 255, 0.2), 0px 2px 8px -2px rgb(255, 255, 255, 0.8)',
        'glow-lg': '0px 8px 14px -3px rgb(255, 255, 255, 0.16), 0px 0px 4px 0px rgb(255, 255, 255, 0.06)',
        'glow-xl': '0px 20px 24px -4px rgb(255, 255, 255, 0.16), 0px 8px 8px -4px rgb(255, 255, 255, 0.06)',
        'glow-2xl': '0px 24px 48px -12px rgb(255, 255, 255, 0.26)',
        'glow-3xl': '0px 32px 64px -12px rgb(255, 255, 255, 0.44)',
      },
      borderRadius: {
        xxs: '4px',
        xs: '6px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '36px',
      },
      blur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '60px',
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '40px',
        '3xl': '60px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0px' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0px' },
        },
        'sprinkle-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(180deg)' },
        },
        'sprinkle-come-in-out': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' },
        },
        reveal: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'sprinkle-spin': 'sprinkle-spin 1s linear',
        'sprinkle-come-in-out': 'sprinkle-come-in-out 700ms forwards',
        reveal: 'reveal 0.25s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        '.typography-display-1': {
          fontSize: '4.5rem', // 72px
          lineHeight: '4.5rem', // 72px
          letterSpacing: 'calc(-2 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-display-2': {
          fontSize: '3.5rem', // 56px
          lineHeight: '3.5rem', // 56px
          letterSpacing: 'calc(-2 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-display-3': {
          fontSize: '3rem', // 48px
          lineHeight: '3.75rem', // 60px
          letterSpacing: 'calc(-1 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-heading-1': {
          fontSize: '2.25rem', // 36px
          lineHeight: '2.625rem', // 42px
          letterSpacing: 'calc(-1 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-heading-2': {
          fontSize: '2rem', // 32px
          lineHeight: '2.5rem', // 40px
          letterSpacing: 'calc(-1 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-heading-3': {
          fontSize: '1.5rem', // 24px
          lineHeight: '1.75rem', // 28px
          letterSpacing: 'calc(-1 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-heading-4': {
          fontSize: '1.25rem', // 20px
          lineHeight: '1.5rem', // 24px
          letterSpacing: 'calc(-1 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-heading-5': {
          fontSize: '1.125rem', // 18px
          lineHeight: '1.25rem', // 20px
          letterSpacing: 'calc(-1 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-body-1': {
          fontSize: '1rem', // 16px
          lineHeight: '1.5rem', // 24px
          letterSpacing: '0px',
          fontWeight: '400',
          fontFamily: theme('fontFamily.sans'),
        },

        '.typography-body-2': {
          fontSize: '0.875rem', // 14px
          lineHeight: '1.25rem', // 20px
          letterSpacing: '0px',
          fontWeight: '400',
          fontFamily: theme('fontFamily.sans'),
        },

        '.typography-body-3': {
          fontSize: '0.75rem', // 12px
          lineHeight: '1.125rem', // 18px
          letterSpacing: '0px',
          fontWeight: '400',
          fontFamily: theme('fontFamily.sans'),
        },

        '.typography-body-4': {
          fontSize: '0.75rem', // 12px
          lineHeight: '1.125rem', // 18px
          letterSpacing: '0px',
          fontWeight: '400',
          fontFamily: theme('fontFamily.sans'),
        },

        // @todo update typography below when added
        '.typography-label-1': {
          fontSize: '1rem', // 16px
          lineHeight: '1.125rem', // 18px
          letterSpacing: 'calc(-0.5 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-label-2': {
          fontSize: '0.875rem', // 14px
          lineHeight: '1rem', // 16px
          letterSpacing: 'calc(-0.5 * 0.01em)',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-label-3': {
          fontSize: '0.75rem', // 12px
          lineHeight: '1rem', // 16px
          letterSpacing: '0px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-label-4': {
          fontSize: '0.75rem', // 12px
          lineHeight: '1rem', // 16px
          letterSpacing: '0px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-button-1': {
          fontSize: '1rem', // 16px
          lineHeight: '1.25rem', // 20px
          letterSpacing: '0px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '.typography-button-2': {
          fontSize: '0.875rem', // 14px
          lineHeight: '1rem', // 16px
          letterSpacing: '0px',
          fontWeight: '500',
          fontFamily: theme('fontFamily.roobert'),
        },

        '@screen sm': {
          '.typography-display-1': {
            fontSize: '7.25rem', // 116px
            lineHeight: '7.25rem', // 116px
          },

          '.typography-display-2': {
            fontSize: '4.5rem', // 72px
            lineHeight: '4.5rem', // 72px
          },

          '.typography-display-3': {
            fontSize: '3.5rem', // 56px
            lineHeight: '3.5rem', // 56px
          },

          '.typography-heading-1': {
            fontSize: '3rem', // 48px
            lineHeight: '3.75rem', // 60px
          },

          '.typography-heading-2': {
            fontSize: '2.625rem', // 42px
            lineHeight: '3rem', // 48px
          },

          '.typography-heading-3': {
            fontSize: '2rem', // 32px
            lineHeight: '2.5rem', // 40px
          },

          '.typography-heading-4': {
            fontSize: '1.5rem', // 24px
            lineHeight: '1.75rem', // 28px
          },

          '.typography-heading-5': {
            fontSize: '1.25rem', // 20px
            lineHeight: '1.5rem', // 24px
          },

          '.typography-body-1': {
            fontSize: '1.125rem', // 18px
            lineHeight: '1.75rem', // 28px
          },

          '.typography-body-2': {
            fontSize: '1rem', // 16px
            lineHeight: '1.5rem', // 24px
          },

          '.typography-body-3': {
            fontSize: '0.875rem', // 14px
            lineHeight: '1.25rem', // 20px
          },

          '.typography-body-4': {
            fontSize: '0.75rem', // 12px
            lineHeight: '1.125rem', // 18px
          },

          '.typography-label-1': {
            fontSize: '1.125rem', // 18px
            lineHeight: '1.375rem', // 22px
          },

          '.typography-label-2': {
            fontSize: '1rem', // 16px
            lineHeight: '1.125rem', // 18px
          },

          '.typography-label-3': {
            fontSize: '0.875rem', // 14px
            lineHeight: '1rem', // 16px
          },

          '.typography-label-4': {
            fontSize: '0.75rem', // 12px
            lineHeight: '1rem', // 16px
          },

          '.typography-button-1': {
            fontSize: '1rem', // 16px
            lineHeight: '1.25rem', // 20px
          },

          '.typography-button-2': {
            fontSize: '0.875rem', // 14px
            lineHeight: '1rem', // 16px
          },
        },
      })

      addUtilities({
        '.leading-spacious': {
          lineHeight: '150%',
        },
        '.leading-normal': {
          lineHeight: '125%',
        },
        '.leading-dense': {
          lineHeight: '100%',
        },

        '@screen sm': {
          '.leading-spacious': {
            lineHeight: '150%',
          },
          '.leading-normal': {
            lineHeight: '125%',
          },
          '.leading-dense': {
            lineHeight: '100%',
          },
        },
      })

      addUtilities({
        '.icon-xxs': {
          width: '12px',
          height: '12px',
        },
        '.icon-xs': {
          width: '16px',
          height: '16px',
        },
        '.icon-sm': {
          width: '20px',
          height: '20px',
        },
        '.icon-md': {
          width: '24px',
          height: '24px',
        },
      })

      addUtilities({
        '.icon-primary': {
          color: 'rgb(var(--base-black))',
        },
        '.icon-primary-inverse': {
          color: 'rgb(var(--base-white))',
        },
        '.icon-secondary': {
          color: 'rgb(var(--neutral-500))',
        },
        '.icon-tertiary': {
          color: 'rgb(var(--neutral-300))',
        },
        '.icon-brand-primary': {
          color: 'rgb(var(--primary-700))',
        },
        '.icon-brand-secondary': {
          color: 'rgb(var(--primary-800))',
        },
        '.icon-system-success-primary': {
          color: 'rgb(var(--success-600))',
        },
        '.icon-system-success-secondary': {
          color: 'rgb(var(--success-700))',
        },
      })
    }),
  ],
} satisfies Config
