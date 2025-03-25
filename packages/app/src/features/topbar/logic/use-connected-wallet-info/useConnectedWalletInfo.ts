import { useBlockExplorerAddressLink } from '@/domain/hooks/useBlockExplorerAddressLink'
import { EnsName } from '@/domain/types/EnsName'
import { assets } from '@/ui/assets'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Connector, useEnsAvatar, useEnsName } from 'wagmi'
import { TopbarWalletProps } from '../../components/topbar-wallet/TopbarWallet'
import { getWalletIcon } from './getWalletIcon'

interface UseConnectedWalletInfoParams {
  address: CheckedAddress | undefined
  connector: Connector | undefined
  isInSandbox: boolean
  onDisconnect: () => void
  isMobileDisplay: boolean
}

export function useConnectedWalletInfo({
  connector,
  address,
  isInSandbox,
  onDisconnect,
  isMobileDisplay,
}: UseConnectedWalletInfoParams): TopbarWalletProps['connectedWalletInfo'] {
  const { data: ensName } = useEnsName({
    address,
  })

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
  })

  const blockExplorerAddressLink = useBlockExplorerAddressLink({ address })

  if (!address || !connector) return undefined

  return {
    dropdownTriggerInfo: {
      mode: isInSandbox ? 'sandbox' : 'connected',
      avatar: ensAvatar ?? assets.walletIcons.default,
      address: CheckedAddress(address),
      ensName: ensName ? EnsName(ensName) : undefined,
    },
    dropdownContentInfo: {
      walletIcon: getWalletIcon(connector),
      address: CheckedAddress(address),
      onDisconnect,
      blockExplorerAddressLink,
    },
    isMobileDisplay,
  }
}
