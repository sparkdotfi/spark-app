import { UseOracleInfoResult } from '@/domain/oracles/useOracleInfo'
import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { assertNever } from '@sparkdotfi/common-universal'
import { FixedOraclePanel } from './components/FixedOraclePanel'
import { MarketOraclePanel } from './components/MarketOraclePanel'
import { UnderlyingAssetOraclePanel } from './components/UnderlyingAssetOraclePanel'
import { UnknownOraclePanel } from './components/UnknownOraclePanel'
import { YieldingFixedOraclePanel } from './components/YieldingFixedOraclePanel'

type OraclePanelProps = UseOracleInfoResult

export function OraclePanel({ data, isLoading, error }: OraclePanelProps) {
  if (isLoading) return <Skeleton className="h-40 w-full" />
  if (!data || error) return null

  switch (data.type) {
    case 'fixed':
      return <FixedOraclePanel {...data} />

    case 'market-price':
      return <MarketOraclePanel {...data} />

    case 'yielding-fixed':
      return <YieldingFixedOraclePanel {...data} />

    case 'underlying-asset':
      return <UnderlyingAssetOraclePanel {...data} />

    case 'unknown':
      return <UnknownOraclePanel {...data} />

    default:
      assertNever(data)
  }
}
