import * as ProgressPrimitive from '@radix-ui/react-progress'
import * as React from 'react'

import { cn } from '@/ui/utils/style'
import { VariantProps, cva } from 'class-variance-authority'

const indicatorVariants = cva('h-full w-full flex-1 rounded-full transition-all', {
  variants: {
    variant: {
      'in-progress': 'bg-gradient-spark-primary-1',
      finished: 'bg-fg-system-error-secondary',
    },
  },
  defaultVariants: {
    variant: 'in-progress',
  },
})

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & VariantProps<typeof indicatorVariants>
>(({ className, variant, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(indicatorVariants({ variant }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
