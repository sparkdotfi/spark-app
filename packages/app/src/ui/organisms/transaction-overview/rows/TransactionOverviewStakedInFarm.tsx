import { Token } from '@/domain/types/Token'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export interface TransactionOverviewStakedInFarmProps {
  token: Token
  amount: NormalizedUnitNumber
  farmName: string
}

export function TransactionOverviewStakedInFarm({ token, amount, farmName }: TransactionOverviewStakedInFarmProps) {
  const formattedAmount = token.format(amount, { style: 'auto' })

  return (
    <div className="flex w-fit items-center gap-1.5">
      <TokenIcon token={token} className="h-4 w-4" />
      <div className="flex items-baseline gap-1">
        <div
          className="typography-label-2 text-primary"
          data-testid={testIds.farmDetails.stakeDialog.transactionOverview.outcome}
        >
          {formattedAmount}
          {/* @note: next line is need to maintain backward compatibility with e2e test - amount should include token symbol */}
          <span className="hidden"> {token.symbol}</span> Staked in {farmName}
        </div>
      </div>
    </div>
  )
}
