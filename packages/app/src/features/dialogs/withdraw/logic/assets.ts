import { NativeAssetInfo } from '@/config/chain/types'
import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { Token } from '@/domain/types/Token'
import { MarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { applyTransformers } from '@/utils/applyTransformers'
import { assert, NormalizedNumber } from '@sparkdotfi/common-universal'

export function getTokenSupply(marketInfo: MarketInfo, withdrawAsset: TokenWithValue): NormalizedNumber {
  const position = marketInfo.findOnePositionBySymbol(withdrawAsset.token.symbol)
  return position.collateralBalance.minus(withdrawAsset.value)
}

export interface GetWithdrawOptionsParams {
  token: Token
  marketInfo: MarketInfo
  walletInfo: MarketWalletInfo
  nativeAssetInfo: NativeAssetInfo
}

export function getWithdrawOptions({
  token,
  marketInfo,
  walletInfo,
  nativeAssetInfo,
}: GetWithdrawOptionsParams): TokenWithBalance[] {
  const options = applyTransformers({ token, marketInfo, walletInfo, nativeAssetInfo })([
    getNativeAssetWithdrawOptions,
    getDefaultWithdrawOptions,
  ])
  assert(options, `No deposit options found for token ${token.symbol}`)

  return options
}

function getNativeAssetWithdrawOptions({
  token,
  marketInfo,
  walletInfo,
  nativeAssetInfo,
}: GetWithdrawOptionsParams): TokenWithBalance[] | undefined {
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

function getDefaultWithdrawOptions({ token, walletInfo }: GetWithdrawOptionsParams): TokenWithBalance[] {
  return [
    {
      token,
      balance: walletInfo.findWalletBalanceForToken(token),
    },
  ]
}
