import { formatPercentage } from '@/domain/common/format'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { cn } from '@/ui/utils/style'
import { ReactNode } from 'react'
import { GeneralStats } from '../../types'

export interface GeneralStatsBarProps {
  generalStats: GeneralStats
}

export function GeneralStatsBar({ generalStats }: GeneralStatsBarProps) {
  return (
    <div className={cn('inline-flex divide-x divide-secondary rounded-[10px]', 'bg-primary/80 py-3 backdrop-blur-lg')}>
      <Stat>
        <Label>Stakers:</Label>
        <Value>{formatUsersNumber(generalStats.stakers)}</Value>
      </Stat>
      <Stat>
        <Label>TVL:</Label>
        <Value>{USD_MOCK_TOKEN.formatUSD(generalStats.tvl, { compact: true })}</Value>
      </Stat>
      <Stat>
        <Label>APR:</Label>
        <Value>{formatPercentage(generalStats.apr)}</Value>
      </Stat>
    </div>
  )
}

export function Stat({ children }: { children: ReactNode }) {
  return <div className="flex gap-1 px-3 sm:px-4">{children}</div>
}

function Label({ children }: { children: string }) {
  return <div className="typography-label-3 text-secondary">{children}</div>
}

function Value({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('typography-label-3 text-primary', className)}>{children}</div>
}

function formatUsersNumber(users: number): string {
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(users)
}
