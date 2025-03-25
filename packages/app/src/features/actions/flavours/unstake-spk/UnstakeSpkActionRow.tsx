import { ActionRow } from '@/features/actions/components/action-row/ActionRow'
import { ActionRowBaseProps } from '@/features/actions/components/action-row/types'
import { ArrowUpToLineIcon } from 'lucide-react'
import { UnstakeSpkAction } from './types'

export interface UnstakeSpkActionRowProps extends ActionRowBaseProps {
  action: UnstakeSpkAction
}

export function UnstakeSpkActionRow({ action: { spk, amount, unstakeAll }, ...props }: UnstakeSpkActionRowProps) {
  return (
    <ActionRow {...props}>
      <ActionRow.Icon icon={ArrowUpToLineIcon} />

      <ActionRow.Title>
        <ActionRow.Title.Tokens tokens={[spk]} />
        Unstake {spk.symbol}
      </ActionRow.Title>

      <ActionRow.Amount token={spk} amount={amount} />

      <ActionRow.ErrorWarning />

      <ActionRow.Trigger>{unstakeAll ? 'Unstake all' : 'Unstake'}</ActionRow.Trigger>
    </ActionRow>
  )
}
