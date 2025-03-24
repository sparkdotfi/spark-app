import { ActionRow } from '@/features/actions/components/action-row/ActionRow'
import { ActionRowBaseProps } from '@/features/actions/components/action-row/types'
import { ArrowUpToLineIcon } from 'lucide-react'
import { FinalizeSpkUnstakeAction } from './types'

export interface FinalizeSpkUnstakeActionRowProps extends ActionRowBaseProps {
  action: FinalizeSpkUnstakeAction
}

export function FinalizeSpkUnstakeActionRow({ action: { spk, amount }, ...props }: FinalizeSpkUnstakeActionRowProps) {
  return (
    <ActionRow {...props}>
      <ActionRow.Icon icon={ArrowUpToLineIcon} />

      <ActionRow.Title>
        <ActionRow.Title.Tokens tokens={[spk]} />
        Claim {spk.symbol}
      </ActionRow.Title>

      <ActionRow.Amount token={spk} amount={amount} />

      <ActionRow.ErrorWarning />

      <ActionRow.Trigger>Claim</ActionRow.Trigger>
    </ActionRow>
  )
}
