import { cn } from '@/ui/utils/style'
import { ReactNode } from 'react'

export interface SparkTokenNavLinkContentProps {
  isActive: boolean
  children: ReactNode
}
export function SparkTokenNavLinkContent({ isActive, children }: SparkTokenNavLinkContentProps) {
  return (
    <div
      className={cn(
        'relative flex w-full gap-2 text-secondary hover:text-primary sm:p-6',
        'items-center sm:grid sm:grid-cols-[1fr_auto] sm:gap-8',
        isActive && 'text-primary',
      )}
    >
      <div
        className={cn(
          'absolute top-0 bottom-0 left-0 hidden w-1 bg-gradient-spark-primary-1 opacity-0 sm:w-[3px]',
          isActive && 'block opacity-1',
        )}
      />
      {children}
    </div>
  )
}
