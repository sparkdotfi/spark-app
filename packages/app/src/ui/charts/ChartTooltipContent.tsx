import { ReactNode } from 'react'
import { cn } from '../utils/style'

export function ChartTooltipContent({ children: [date, value] }: { children: ReactNode[] }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-sm bg-primary-inverse p-3">
      {date}
      {value}
    </div>
  )
}

function TooltipDate({ children }: { children: ReactNode }) {
  return <div className="typography-label-4 flex flex-col gap-3 text-secondary">{children}</div>
}

type TooltipValueProps = {
  children: ReactNode
} & (
  | {
      dotColor: string
    }
  | {
      dotClassName: string
    }
)
function TooltipValue(props: TooltipValueProps) {
  return (
    <div className="typography-label-2 flex items-center gap-1.5 text-primary-inverse">
      <div
        className={cn('size-2 rounded-full', 'dotClassName' in props ? props.dotClassName : '')}
        style={'dotColor' in props ? { backgroundColor: props.dotColor } : {}}
      />
      <div>{props.children}</div>
    </div>
  )
}

ChartTooltipContent.Date = TooltipDate
ChartTooltipContent.Value = TooltipValue
