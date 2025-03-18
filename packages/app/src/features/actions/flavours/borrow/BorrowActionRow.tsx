import { useCookie3 } from '@/domain/analytics/cookie3'
import { ArrowUpFromLineIcon } from 'lucide-react'
import { ActionRow } from '../../components/action-row/ActionRow'
import { ActionRowBaseProps } from '../../components/action-row/types'
import { BorrowAction } from './types'

export interface BorrowActionRowProps extends ActionRowBaseProps {
  action: BorrowAction
}

export function BorrowActionRow({ action, ...props }: BorrowActionRowProps) {
  const { trackButtonClick } = useCookie3()

  function beforeAction() {
    trackButtonClick('Borrow_Borrow_Confirmation')
  }

  return (
    <ActionRow {...props}>
      <ActionRow.Icon icon={ArrowUpFromLineIcon} />

      <ActionRow.Title>
        <ActionRow.Title.Tokens tokens={[action.token]} />
        Borrow {action.token.symbol}
      </ActionRow.Title>

      <ActionRow.Amount token={action.token} amount={action.value} />

      <ActionRow.ErrorWarning />

      <ActionRow.Trigger beforeAction={beforeAction}>Borrow</ActionRow.Trigger>
    </ActionRow>
  )
}
