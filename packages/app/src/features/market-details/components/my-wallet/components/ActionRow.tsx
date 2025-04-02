import { Token } from '@/domain/types/Token'
import { Button } from '@/ui/atoms/button/Button'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { ActionDetails } from './ActionDetails'

interface ActionRowProps {
  token: Token
  value: NormalizedNumber
  label: string
  buttonText: string
  onAction: () => void
}

export function ActionRow({ token, value, label, buttonText, onAction }: ActionRowProps) {
  return (
    <div className="grid grid-cols-[_1fr,_70px] border-primary border-t py-4">
      <ActionDetails label={label} token={token} value={value} />
      <Button variant="secondary" disabled={value.isZero()} size="s" onClick={onAction}>
        {buttonText}
      </Button>
    </div>
  )
}
