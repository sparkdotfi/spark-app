import { Token, USD_MOCK_TOKEN } from '@/domain/types/Token'
import { IconButton } from '@/ui/atoms/icon-button/IconButton'
import { Link } from '@/ui/atoms/link/Link'
import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { links } from '@/ui/constants/links'
import { Info } from '@/ui/molecules/info/Info'
import { cn } from '@/ui/utils/style'
import { NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { ExternalLinkIcon } from 'lucide-react'
import { ReactNode } from 'react'
import { UseGeneralStatsResult } from '../../logic/general-stats/useGeneralStats'

export interface GeneralStatsBarProps {
  accountSavingsToken: Token
  generalStatsResult: UseGeneralStatsResult
  psmSupplier: 'sky' | 'spark'
}

export function GeneralStatsBar({ accountSavingsToken, generalStatsResult, psmSupplier }: GeneralStatsBarProps) {
  if (generalStatsResult.isPending) {
    return <Skeleton className="h-10 w-full max-w-[400px]" />
  }

  if (generalStatsResult.isError) {
    return null
  }

  const liquidityCap = generalStatsResult.data.getLiquidityCap(accountSavingsToken)

  return (
    <div className={cn('inline-flex divide-x divide-secondary rounded-[10px]', 'bg-primary/80 py-3 backdrop-blur-lg')}>
      <Stat>
        <Label>TVL:</Label>
        <Value>{USD_MOCK_TOKEN.formatUSD(NormalizedUnitNumber(generalStatsResult.data.tvl), { compact: true })}</Value>
      </Stat>
      <Stat>
        <Label>Users:</Label>
        <Value>{formatUsersNumber(generalStatsResult.data.users)}</Value>
      </Stat>
      {liquidityCap && (
        <Stat>
          <Label>Liquidity:</Label>
          <Value>
            <div className="flex items-center gap-1">
              {USD_MOCK_TOKEN.formatUSD(NormalizedUnitNumber(liquidityCap), { compact: true })}
              <LiquidityCapInfo psmSupplier={psmSupplier} />
            </div>
          </Value>
        </Stat>
      )}
      <Stat>
        <Link to={links.skyInfoSavingsDashboard} variant="decorator" className="flex" external>
          <IconButton variant="transparent" size="s" icon={ExternalLinkIcon} />
        </Link>
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

function LiquidityCapInfo({ psmSupplier }: { psmSupplier: 'sky' | 'spark' }) {
  return psmSupplier === 'sky' ? <SkyPsmLiquidityInfo /> : <SparkPsmLiquidityInfo />
}

function SkyPsmLiquidityInfo() {
  return (
    <Info>
      The liquidity is provided by the Sky Peg Stability Module which allows 1:1 swaps between USDC and USDS without
      slippage or fees beyond network fees.{' '}
      <Link to={links.docs.savings.withdrawSavings} external>
        Learn more
      </Link>
    </Info>
  )
}

function SparkPsmLiquidityInfo() {
  return (
    <Info>
      The liquidity is provided by the Spark Peg Stability Module which allows 1:1 swaps between USDC and USDS without
      slippage or fees beyond network fees.{' '}
      <Link to={links.docs.savings.sparkPSM} external>
        Learn more
      </Link>
    </Info>
  )
}
