import { ActionRow } from '@/features/actions/components/action-row/ActionRow'
import { ActionRowBaseProps } from '@/features/actions/components/action-row/types'
import { ArrowDownToLineIcon } from 'lucide-react'
import { StakeSpkAction } from './types'

export interface StakeSpkActionRowProps extends ActionRowBaseProps {
  action: StakeSpkAction
}

export function StakeSpkActionRow({ action: { spk, amount }, ...props }: StakeSpkActionRowProps) {
  return (
    <ActionRow {...props}>
      <ActionRow.Icon icon={ArrowDownToLineIcon} />

      <ActionRow.Title>
        <ActionRow.Title.Tokens tokens={[spk]} />
        Stake {spk.symbol}
      </ActionRow.Title>

      <ActionRow.Amount token={spk} amount={amount} />

      <ActionRow.ErrorWarning />

      <ActionRow.Trigger>Stake</ActionRow.Trigger>
    </ActionRow>
  )
}
