import { getChainConfigEntry } from '@/config/chain'
import { useSandboxState } from '@/domain/sandbox/useSandboxState'
import { useOpenDialog } from '@/domain/state/dialogs'
import { sandboxDialogConfig } from '@/features/dialogs/sandbox/SandboxDialog'
import { selectNetworkDialogConfig } from '@/features/dialogs/select-network/SelectNetworkDialog'
import { usePrefetchSavingsGeneralStats } from '@/features/savings/logic/general-stats/usePrefetchSavingsGeneralStats'
import { SupportedChain } from '@/features/topbar/types'
import { getBuildInfo } from '@/ui/utils/getBuildInfo'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CheckedAddress, raise } from '@sparkdotfi/common-universal'
import { useAccount, useChainId, useChains } from 'wagmi'
import { TopbarProps } from '../components/topbar/Topbar'
import { useAirdropInfo } from './use-airdrop-info/useAirdropInfo'
import { useConnectedWalletInfo } from './use-connected-wallet-info/useConnectedWalletInfo'
import { useDisconnect } from './useDisconnect'
import { useNavigationInfo } from './useNavigationInfo'
import { useNetworkChange } from './useNetworkChange'
import { usePrefetchCanWalletBatchQuery } from './usePrefetchCanWalletBatchQuery'
import { useRewardsInfo } from './useRewardsInfo'
import { useSparkRewardsSummary } from './useSparkRewardsSummary'

interface UseTopbarParams {
  isMobileDisplay: boolean
}

export function useTopbar({ isMobileDisplay }: UseTopbarParams): TopbarProps {
  const currentChainId = useChainId()
  const chains = useChains()
  const { openConnectModal = () => {} } = useConnectModal()
  const { address, connector } = useAccount()
  usePrefetchCanWalletBatchQuery()
  usePrefetchSavingsGeneralStats()

  const openDialog = useOpenDialog()

  const { isInSandbox, deleteSandbox } = useSandboxState()

  const rewardsInfo = useRewardsInfo({
    chainId: currentChainId,
    address: address && CheckedAddress(address),
  })
  const sparkRewardsSummary = useSparkRewardsSummary()

  const airdropInfo = useAirdropInfo({ refreshIntervalInMs: 100 })
  const navigationInfo = useNavigationInfo({ chainId: currentChainId })

  const { changeNetworkAsync } = useNetworkChange()
  const { disconnect } = useDisconnect({
    changeNetworkAsync,
    deleteSandbox,
    isInSandbox,
  })

  const connectedWalletInfo = useConnectedWalletInfo({
    address: address && CheckedAddress(address),
    connector,
    isInSandbox,
    onDisconnect: disconnect,
    isMobileDisplay,
  })

  const supportedChains: SupportedChain[] = chains.map((chain) => {
    const { meta } = getChainConfigEntry(chain.id)
    return {
      id: chain.id,
      name: meta.name,
    }
  })

  const currentChain = supportedChains.find((chain) => chain.id === currentChainId) ?? {
    id: currentChainId,
    name: supportedChains[0]?.name ?? raise('No supported chains'),
  } // this fallback object is needed when we add new chains

  function openSandboxDialog(): void {
    openDialog(sandboxDialogConfig, { mode: 'ephemeral', asDrawer: isMobileDisplay } as const)
  }

  function openSelectNetworkDialog(): void {
    openDialog(selectNetworkDialogConfig, {
      asDrawer: isMobileDisplay,
    })
  }

  return {
    menuInfo: {
      onSandboxModeClick: isInSandbox ? disconnect : openSandboxDialog,
      isInSandbox,
      buildInfo: getBuildInfo(),
      isMobileDisplay,
      airdropInfo,
      rewardsInfo,
      sparkRewardsSummary,
    },
    navigationInfo,
    networkInfo: {
      currentChain,
      onSelectNetwork: openSelectNetworkDialog,
    },
    walletInfo: {
      onConnect: openConnectModal,
      connectedWalletInfo,
    },
    airdropInfo,
    rewardsInfo,
    sparkRewardsSummary,
    isMobileDisplay,
  }
}
