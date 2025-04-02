import { NativeAssetInfo } from '@/config/chain/types'
import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { MarketWalletInfo, WalletBalance } from '@/domain/wallet/useMarketWalletInfo'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

interface MakeAssetListParams {
  marketInfo: MarketInfo
  walletInfo: MarketWalletInfo
  includeDeposits: boolean
  nativeAssetInfo: NativeAssetInfo
  chainId: number
}
function makeAssetList({
  marketInfo,
  walletInfo,
  includeDeposits,
  nativeAssetInfo,
}: MakeAssetListParams): TokenWithBalance[] {
  return walletInfo.walletBalances
    .map((walletBalance) => calculateCombinedBalance({ walletBalance, marketInfo, includeDeposits, nativeAssetInfo }))
    .filter(({ value }) => value.gt(0))
    .sort((a, b) => b.token.toUSD(b.value).comparedTo(a.token.toUSD(a.value)))
    .map((asset) => ({
      token: asset.token,
      balance: asset.value,
    }))
}

interface CalculateCombinedBalanceParams {
  walletBalance: WalletBalance
  marketInfo: MarketInfo
  includeDeposits: boolean
  nativeAssetInfo: NativeAssetInfo
}
function calculateCombinedBalance({
  walletBalance,
  marketInfo,
  includeDeposits,
  nativeAssetInfo,
}: CalculateCombinedBalanceParams): TokenWithValue {
  if (!includeDeposits || walletBalance.token.symbol === nativeAssetInfo.nativeAssetSymbol) {
    return {
      token: walletBalance.token,
      value: walletBalance.balance,
    }
  }

  const deposit = marketInfo.findPositionByToken(walletBalance.token)?.collateralBalance ?? NormalizedNumber.ZERO
  return {
    token: walletBalance.token,
    value: NormalizedNumber(walletBalance.balance.plus(deposit)),
  }
}

export interface MakeWalletCompositionParams {
  marketInfo: MarketInfo
  walletInfo: MarketWalletInfo
  compositionWithDeposits: boolean
  setCompositionWithDeposits: (includeDeposits: boolean) => void
  nativeAssetInfo: NativeAssetInfo
  chainId: number
}

export interface WalletCompositionInfo {
  assets: TokenWithBalance[]
  includeDeposits: boolean
  setIncludeDeposits: (includeDeposits: boolean) => void
}

export function makeWalletComposition({
  marketInfo,
  walletInfo,
  compositionWithDeposits,
  setCompositionWithDeposits,
  nativeAssetInfo,
  chainId,
}: MakeWalletCompositionParams): WalletCompositionInfo {
  return {
    assets: makeAssetList({
      marketInfo,
      walletInfo,
      includeDeposits: compositionWithDeposits,
      nativeAssetInfo,
      chainId,
    }),
    includeDeposits: compositionWithDeposits,
    setIncludeDeposits: setCompositionWithDeposits,
  }
}
