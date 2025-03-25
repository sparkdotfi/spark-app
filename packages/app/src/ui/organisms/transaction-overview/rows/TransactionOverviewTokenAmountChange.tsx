import { Token } from '@/domain/types/Token'
import { TokenAmount } from '@/ui/molecules/token-amount/TokenAmount'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { MoveRightIcon } from 'lucide-react'

export interface TransactionOverviewTokenAmountChangeProps {
  token: Token
  currentAmount: NormalizedUnitNumber
  updatedAmount?: NormalizedUnitNumber
}

export function TransactionOverviewTokenAmountChange({
  token,
  currentAmount,
  updatedAmount,
}: TransactionOverviewTokenAmountChangeProps) {
  return (
    <div className="flex gap-2.5">
      <TokenAmount token={token} amount={currentAmount} />
      {updatedAmount && (
        <>
          <MoveRightIcon className="icon-xxs icon-secondary mt-[3px]" />
          <TokenAmount token={token} amount={updatedAmount} />
        </>
      )}
    </div>
  )
}
