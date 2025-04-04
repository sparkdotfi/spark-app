import { Token } from '@/domain/types/Token'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { testIds } from '@/ui/utils/testIds'
import { getFractionalPart, getWholePart } from '@/utils/bigNumber'
import { useTimestamp } from '@/utils/useTimestamp'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { cva } from 'class-variance-authority'
import { SavingsOverview } from '../../logic/makeSavingsOverview'
import { savingsTokenToAccountType } from '../common/utils'

export interface GrowingBalanceProps {
  underlyingToken: Token
  savingsToken: Token
  calculateUnderlyingTokenBalance: (timestampInMs: number) => SavingsOverview
  balanceRefreshIntervalInMs: number | undefined
}

export function GrowingBalance({
  underlyingToken,
  savingsToken,
  calculateUnderlyingTokenBalance,
  balanceRefreshIntervalInMs,
}: GrowingBalanceProps) {
  const { timestampInMs } = useTimestamp({ refreshIntervalInMs: balanceRefreshIntervalInMs })
  const { depositedAssets: _depositedAssets, depositedAssetsPrecision } = calculateUnderlyingTokenBalance(timestampInMs)
  const depositedAssets = NormalizedNumber(_depositedAssets.toFixed(depositedAssetsPrecision))
  const accountType = savingsTokenToAccountType(savingsToken)

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <TokenIcon token={underlyingToken} className="size-10 lg:size-14" />
      <div
        className="flex items-baseline tabular-nums"
        data-testid={testIds.savings.account.savingsToken.balanceInUnderlyingToken}
      >
        <div className={wholePartVariants({ accountType })}>{getWholePart(depositedAssets)}</div>
        {depositedAssetsPrecision > 0 && (
          <div className="relative">
            <div className={fractionalPartVariants({ accountType })}>
              {getFractionalPart(depositedAssets, depositedAssetsPrecision)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const wholePartVariants = cva('typography-heading-1 sm:typography-display-2 relative bg-clip-text text-transparent', {
  variants: {
    accountType: {
      susds: 'bg-[linear-gradient(90deg,#FFF_0%,#80D98D_64.65%,#2CCA9A_100%)]',
      susdc: 'bg-[linear-gradient(90deg,#FFF_0%,#00C2A1_64.65%,#09B2A9_100%)]',
      sdai: 'bg-[linear-gradient(90deg,#FFF_0%,#7CC54D_64.65%,#54AC3D_100%)]',
    },
  },
})

const fractionalPartVariants = cva('typography-heading-4 sm:typography-heading-3 [text-shadow:_0_1px_4px_rgb(0_0_0)]', {
  variants: {
    accountType: {
      susds: 'text-[#2CCA9A]',
      susdc: 'text-[#09B2A9]',
      sdai: 'text-[#54AC3D]',
    },
  },
})
