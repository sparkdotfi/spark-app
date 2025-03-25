import { getChainConfigEntry } from '@/config/chain'
import { getNativeAssetInfo } from '@/config/chain/utils/getNativeAssetInfo'
import { paths } from '@/config/paths'
import { useCapAutomatorInfo } from '@/domain/cap-automator/useCapAutomatorInfo'
import { useD3MInfo } from '@/domain/d3m-info/useD3MInfo'
import { NotFoundError } from '@/domain/errors/not-found'
import { useMarketInfo } from '@/domain/market-info/useMarketInfo'
import { UseOracleInfoResult, useOracleInfo } from '@/domain/oracles/useOracleInfo'
import { useSandboxPageRedirect } from '@/domain/sandbox/useSandboxPageRedirect'
import { OpenDialogFunction, useOpenDialog } from '@/domain/state/dialogs'
import { Token } from '@/domain/types/Token'
import { useMarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { sandboxDialogConfig } from '@/features/dialogs/sandbox/SandboxDialog'
import { CheckedAddress, raise } from '@sparkdotfi/common-universal'
import { useChainId } from 'wagmi'
import { MarketOverview, WalletOverview } from '../types'
import { makeDaiMarketOverview } from './makeDaiMarketOverview'
import { makeMarketOverview } from './makeMarketOverview'
import { makeWalletOverview } from './makeWalletOverview'
import { useMarketDetailsParams } from './useMarketDetailsParams'
import { useSparkRewards } from './useSparkRewards'

export interface UseMarketDetailsResult {
  token: Token
  aToken: Token
  variableDebtTokenAddress: CheckedAddress
  chainName: string
  chainId: number
  marketOverview: MarketOverview
  walletOverview: WalletOverview
  chainMismatch: boolean
  oracleInfo: UseOracleInfoResult
  openDialog: OpenDialogFunction
  openSandboxModal: () => void
}

export function useMarketDetails(): UseMarketDetailsResult {
  const params = useMarketDetailsParams()
  const { chainId, asset } = params

  const { marketInfo } = useMarketInfo({ chainId })
  const { D3MInfo } = useD3MInfo({ chainId })
  const walletInfo = useMarketWalletInfo({ chainId })
  const { meta: chainMeta } = getChainConfigEntry(chainId)
  const connectedChainId = useChainId()

  const openDialog = useOpenDialog()
  function openSandboxModal(): void {
    openDialog(sandboxDialogConfig, { mode: 'ephemeral' } as const)
  }

  useSandboxPageRedirect({
    basePath: paths.marketDetails,
    fallbackPath: paths.markets,
    basePathParams: params,
  })
  const nativeAssetInfo = getNativeAssetInfo(marketInfo.chainId)

  const chainMismatch = connectedChainId !== chainId

  const reserve = marketInfo.findReserveByUnderlyingAsset(asset) ?? raise(new NotFoundError())

  const isDaiOverview = reserve.token.symbol === marketInfo.DAI.symbol && D3MInfo

  const { capAutomatorInfo } = useCapAutomatorInfo({
    chainId,
    token: isDaiOverview ? marketInfo.sDAI : reserve.token,
  })

  const oracleInfo = useOracleInfo({
    reserve,
    marketInfo,
  })

  const sparkRewards = useSparkRewards({ chainId, reserve })

  const marketOverview = isDaiOverview
    ? makeDaiMarketOverview({
        reserve,
        marketInfo,
        D3MInfo,
        sparkRewards,
      })
    : makeMarketOverview({
        reserve,
        marketInfo,
        capAutomatorInfo,
        sparkRewards,
      })

  const walletOverview = makeWalletOverview({
    reserve,
    marketInfo,
    walletInfo,
    connectedChainId,
    nativeAssetInfo,
  })

  return {
    token: reserve.token,
    aToken: reserve.aToken,
    variableDebtTokenAddress: reserve.variableDebtTokenAddress,
    chainName: chainMeta.name,
    chainId,
    marketOverview,
    walletOverview,
    chainMismatch,
    oracleInfo,
    openDialog,
    openSandboxModal,
  }
}
