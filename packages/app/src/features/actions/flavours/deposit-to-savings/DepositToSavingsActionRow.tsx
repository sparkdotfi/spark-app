import { useCookie3 } from '@/domain/analytics/cookie3'
import { ActionRow } from '@/features/actions/components/action-row/ActionRow'
import { ActionRowBaseProps } from '@/features/actions/components/action-row/types'
import { ArrowRightLeftIcon } from 'lucide-react'
import { DepositToSavingsAction } from './types'

export interface DepositToSavingsActionRowProps extends ActionRowBaseProps {
  action: DepositToSavingsAction
}

export function DepositToSavingsActionRow({
  action: { savingsToken, token, value },
  ...props
}: DepositToSavingsActionRowProps) {
  const { trackButtonClick } = useCookie3()

  function beforeAction() {
    trackButtonClick('Savings_Deposit_Confirmation')
  }

  return (
    <ActionRow {...props}>
      <ActionRow.Icon icon={ArrowRightLeftIcon} />

      <ActionRow.Title>
        <ActionRow.Title.Tokens tokens={[token, savingsToken]} />
        Convert {token.symbol} to {savingsToken.symbol}
      </ActionRow.Title>

      <ActionRow.Amount token={savingsToken} amount={value} />

      <ActionRow.ErrorWarning />

      <ActionRow.Trigger beforeAction={beforeAction}>Convert</ActionRow.Trigger>
    </ActionRow>
  )
}
