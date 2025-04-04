import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

interface ActionDetailsProps {
  label: string
  token: Token
  value: NormalizedNumber
}

export function ActionDetails({ label, token, value }: ActionDetailsProps) {
  return (
    <div className="flex flex-col items-baseline">
      <p className="typography-label-4 text-secondary">{label}</p>
      <p className="typography-body-2 text-primary">
        {token.format(value, { style: 'auto' })} {token.symbol}
      </p>
      <div className="typography-label-4 text-secondary">{token.formatUSD(value)}</div>
    </div>
  )
}
