import { assets } from '@/ui/assets'
import { NetworkBadge } from '@/ui/atoms/network-badge/NetworkBadge'

export interface PageHeaderProps {
  chainId: number
}

export function PageHeader({ chainId }: PageHeaderProps) {
  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-3">
        <img src={assets.token.spk} alt="SPK" className="size-10" />
        <h1 className="typography-heading-3 md:typography-heading-1">SPK Staking</h1>
      </div>
      <NetworkBadge chainId={chainId} />
    </div>
  )
}
