import { cn } from '@/ui/utils/style'
import { assert } from '@marsfoundation/common-universal'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'
import { Loader } from '../loader/Loader'

export const buttonVariants = cva(
  cn(
    'relative isolate inline-flex select-none items-center justify-center',
    'overflow-hidden whitespace-nowrap rounded-sm transition-colors',
    'focus-visible:bg-primary focus-visible:text-neutral-950 ',
    'focus-visible:outline-none focus-visible:ring focus-visible:ring-primary-200 focus-visible:ring-offset-0',
  ),
  {
    variants: {
      variant: {
        primary: cn(
          'before:-z-10 bg-gradient-spark-primary-1 text-primary-inverse before:absolute',
          'focus-visible:before:bg-primary active:before:bg-neutral-800',
          'before:inset-0 before:transition-colors hover:before:bg-neutral-950 active:text-primary-inverse',
          'disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-500 disabled:before:bg-neutral-50 disabled:before:bg-none',
        ),
        secondary: cn(
          'bg-neutral-950 text-primary-inverse active:bg-neutral-950',
          'hover:bg-neutral-800 active:text-primary-inverse',
          'disabled:cursor-not-allowed disabled:border-none disabled:bg-neutral-50 disabled:text-neutral-500',
        ),
        tertiary: cn(
          'border border-primary border-solid bg-primary',
          'text-neutral-950 shadow-xs hover:bg-neutral-50 active:bg-neutral-100',
          'disabled:cursor-not-allowed disabled:border-none disabled:bg-neutral-50 disabled:text-neutral-500',
        ),
        transparent: cn(
          'overflow-visible text-secondary transition-colors',
          'hover:text-neutral-700',
          'active:text-neutral-900',
          'disabled:cursor-not-allowed disabled:text-neutral-300',
          'focus-visible:bg-transparent',
        ),
        loading: 'cursor-wait bg-neutral-50 text-primary-inverse',
      },
      size: {
        l: 'typography-button-1 h-12 px-3 py-3.5',
        m: 'typography-button-2 h-10 px-2 py-2.5',
        s: 'typography-button-2 h-8 p-2',
      },
      spacing: {
        s: 'gap-1',
        m: 'gap-2',
        l: 'gap-3',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'm',
      spacing: 'm',
    },
  },
)

const buttonIconVariants = cva('', {
  variants: {
    size: {
      l: 'icon-sm',
      m: 'icon-sm',
      s: 'icon-xs',
    },
  },
})

type ButtonIconSize = VariantProps<typeof buttonIconVariants>['size']
export interface ButtonContextProps {
  size: ButtonIconSize
}
export const ButtonContext = React.createContext<ButtonContextProps | null>(null)

export function useButtonContext(): ButtonContextProps {
  const context = React.useContext(ButtonContext)
  assert(context, 'useButtonContext must be used within a Button component')
  return context
}

export type ButtonIconType = React.ComponentType<{ className?: string }>

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant: _variant,
      spacing,
      size = 'm',
      asChild = false,
      type = 'button',
      loading = false,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'

    const variant = loading ? 'loading' : _variant

    return (
      <Comp
        {...props}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, spacing }), className)}
        ref={ref}
        type={type}
      >
        {loading && (
          <div className="absolute inset-0 flex animate-reveal items-center justify-center bg-neutral-50">
            <Loader size={20} />
          </div>
        )}
        <ButtonContext.Provider value={{ size }}>{children}</ButtonContext.Provider>
      </Comp>
    )
  },
)
Button.displayName = 'Button'

interface ButtonIconProps {
  icon: ButtonIconType
  className?: string
}

export function ButtonIcon({ icon: Icon, className }: ButtonIconProps) {
  const { size } = useButtonContext()
  return <Icon className={cn(buttonIconVariants({ size }), className)} />
}
