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
  return (
    <ActionRow {...props}>
      <ActionRow.Icon icon={ArrowRightLeftIcon} />

      <ActionRow.Title>
        <ActionRow.Title.Tokens tokens={[token, savingsToken]} />
        Convert {token.symbol} to {savingsToken.symbol}
      </ActionRow.Title>

      <ActionRow.Amount token={savingsToken} amount={value} />

      <ActionRow.ErrorWarning />

      <ActionRow.Trigger>Convert</ActionRow.Trigger>
    </ActionRow>
  )
}
