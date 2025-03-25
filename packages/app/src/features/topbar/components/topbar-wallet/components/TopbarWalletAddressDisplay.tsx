import { Address } from '@/ui/atoms/address/Address'
import { CopyButton } from '@/ui/molecules/copy-button/CopyButton'
import { CheckedAddress } from '@sparkdotfi/common-universal'

interface TopbarWalletAddressDisplayProps {
  walletIcon: string
  address: CheckedAddress
}

export function TopbarWalletAddressDisplay({ walletIcon, address }: TopbarWalletAddressDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-sm bg-secondary p-10 md:p-6">
      <div className="rounded-full bg-primary p-1">
        <img src={walletIcon} alt="Wallet icon" className="aspect-square h-12 md:h-6" />
      </div>

      <div className="typography-label-2 overflow-hidden text-primary">
        <div className="flex items-center gap-1">
          <Address compact address={address} />
          <CopyButton text={address} />
        </div>
      </div>
    </div>
  )
}
