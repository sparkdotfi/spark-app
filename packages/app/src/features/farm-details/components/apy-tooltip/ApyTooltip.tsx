import { farmAddresses } from '@/config/chain/constants'
import { Info } from '@/ui/molecules/info/Info'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { mainnet } from 'viem/chains'

export interface ApyTooltipProps {
  farmAddress: CheckedAddress
}

export function ApyTooltip({ farmAddress }: ApyTooltipProps) {
  if (farmAddress === farmAddresses[mainnet.id].skyUsds) {
    return (
      <Info className="text-primary-inverse">
        The yield comes from Sky Token Rewards offered by Sky. The APY is calculated based on three factors: your share
        of the total deposits, the token emissions, and the current price of the reward token.
      </Info>
    )
  }

  return null
}
