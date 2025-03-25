import { NativeAssetInfo } from '@/config/chain/types'
import { TokenWithBalance } from '@/domain/common/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { Token } from '@/domain/types/Token'
import { MarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { applyTransformers } from '@/utils/applyTransformers'
import { assert } from '@sparkdotfi/common-universal'

export interface GetDepositOptionsParams {
  token: Token
  marketInfo: MarketInfo
  walletInfo: MarketWalletInfo
  nativeAssetInfo: NativeAssetInfo
}

export function getDepositOptions({
  token,
  marketInfo,
  walletInfo,
  nativeAssetInfo,
}: GetDepositOptionsParams): TokenWithBalance[] {
  const options = applyTransformers({ token, marketInfo, walletInfo, nativeAssetInfo })([
    getNativeAssetDepositOptions,
    getDefaultDepositOptions,
  ])
  assert(options, `No deposit options found for token ${token.symbol}`)

  return options
}

function getNativeAssetDepositOptions({
  token,
  marketInfo,
  walletInfo,
  nativeAssetInfo,
}: GetDepositOptionsParams): TokenWithBalance[] | undefined {
  const { nativeAssetSymbol, wrappedNativeAssetSymbol } = nativeAssetInfo

  if (token.symbol !== nativeAssetSymbol && token.symbol !== wrappedNativeAssetSymbol) {
    return undefined
  }
  const native = marketInfo.findOneReserveBySymbol(nativeAssetSymbol)
  const wrapped = marketInfo.findOneReserveBySymbol(wrappedNativeAssetSymbol)

  return [
    {
      token: native.token,
      balance: walletInfo.findWalletBalanceForToken(native.token),
    },
    {
      token: wrapped.token,
      balance: walletInfo.findWalletBalanceForToken(wrapped.token),
    },
  ]
}

function getDefaultDepositOptions({ token, walletInfo }: GetDepositOptionsParams): TokenWithBalance[] {
  return [
    {
      token,
      balance: walletInfo.findWalletBalanceForToken(token),
    },
  ]
}
