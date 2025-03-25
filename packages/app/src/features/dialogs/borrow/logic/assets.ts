import { NativeAssetInfo } from '@/config/chain/types'
import { TokenWithBalance } from '@/domain/common/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { Token } from '@/domain/types/Token'
import { MarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { applyTransformers } from '@/utils/applyTransformers'
import { assert } from '@sparkdotfi/common-universal'

export interface GetBorrowOptionsParams {
  token: Token
  marketInfo: MarketInfo
  walletInfo: MarketWalletInfo
  nativeAssetInfo: NativeAssetInfo
}

export function getBorrowOptions({
  token,
  marketInfo,
  walletInfo,
  nativeAssetInfo,
}: GetBorrowOptionsParams): TokenWithBalance[] {
  const options = applyTransformers({ token, marketInfo, walletInfo, nativeAssetInfo })([
    getNativeAssetBorrowOptions,
    getDefaultBorrowOptions,
  ])
  assert(options, `No deposit options found for token ${token.symbol}`)

  return options
}

function getNativeAssetBorrowOptions({
  token,
  marketInfo,
  walletInfo,
  nativeAssetInfo,
}: GetBorrowOptionsParams): TokenWithBalance[] | undefined {
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

function getDefaultBorrowOptions({ token, walletInfo }: GetBorrowOptionsParams): TokenWithBalance[] {
  return [
    {
      token,
      balance: walletInfo.findWalletBalanceForToken(token),
    },
  ]
}
