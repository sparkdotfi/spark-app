import { formatPercentage } from '@/domain/common/format'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { cn } from '@/ui/utils/style'
import { ReactNode } from 'react'
import { UseGeneralStatsResult } from '../../types'

export interface GeneralStatsBarProps {
  generalStatsResult: UseGeneralStatsResult
}

export function GeneralStatsBar({ generalStatsResult }: GeneralStatsBarProps) {
  if (generalStatsResult.isPending) {
    return <Skeleton className="h-10 w-full max-w-[400px]" />
  }

  if (generalStatsResult.isError) {
    return null
  }

  return (
    <div className={cn('inline-flex divide-x divide-secondary rounded-[10px]', 'bg-primary/80 py-3 backdrop-blur-lg')}>
      <Stat>
        <Label>Stakers:</Label>
        <Value>{formatUsersNumber(generalStatsResult.data.stakers)}</Value>
      </Stat>
      <Stat>
        <Label>TVL:</Label>
        <Value>{USD_MOCK_TOKEN.formatUSD(generalStatsResult.data.tvl, { compact: true })}</Value>
      </Stat>
      <Stat>
        <Label>APR:</Label>
        <Value>{formatPercentage(generalStatsResult.data.apr)}</Value>
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
