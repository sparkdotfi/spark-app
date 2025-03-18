import { useCookie3 } from '@/domain/analytics/cookie3'
import { ArrowDownToLineIcon } from 'lucide-react'
import { ActionRow } from '../../components/action-row/ActionRow'
import { ActionRowBaseProps } from '../../components/action-row/types'
import { DepositAction } from './types'

export interface DepositActionRowProps extends ActionRowBaseProps {
  action: DepositAction
}

export function DepositActionRow({ action, ...props }: DepositActionRowProps) {
  const { trackButtonClick } = useCookie3()

  function beforeAction() {
    trackButtonClick('Borrow_Deposit_Confirmation')
  }

  return (
    <ActionRow {...props}>
      <ActionRow.Icon icon={ArrowDownToLineIcon} />

      <ActionRow.Title>
        <ActionRow.Title.Tokens tokens={[action.token]} />
        Deposit {action.token.symbol}
      </ActionRow.Title>

      <ActionRow.Amount token={action.token} amount={action.value} />

      <ActionRow.ErrorWarning />

      <ActionRow.Trigger beforeAction={beforeAction}>Deposit</ActionRow.Trigger>
    </ActionRow>
  )
}
