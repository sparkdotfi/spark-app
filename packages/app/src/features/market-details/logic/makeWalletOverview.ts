import { NativeAssetInfo } from '@/config/chain/types'
import { getBorrowMaxValue } from '@/domain/action-max-value-getters/getBorrowMaxValue'
import { getDepositMaxValue } from '@/domain/action-max-value-getters/getDepositMaxValue'
import { MarketInfo, Reserve } from '@/domain/market-info/marketInfo'
import { getValidateBorrowArgs, validateBorrow } from '@/domain/market-validators/validateBorrow'
import { MarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { applyTransformers } from '@/utils/applyTransformers'
import { assert, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { WalletOverview } from '../types'

export interface MakeWalletOverviewParams {
  reserve: Reserve
  walletInfo: MarketWalletInfo
  marketInfo: MarketInfo
  connectedChainId: number
  nativeAssetInfo: NativeAssetInfo
}

export function makeWalletOverview({
  reserve,
  marketInfo,
  walletInfo,
  connectedChainId,
  nativeAssetInfo,
}: MakeWalletOverviewParams): WalletOverview {
  const overview = applyTransformers({ reserve, marketInfo, walletInfo, connectedChainId, nativeAssetInfo })([
    makeGuestModeOverview,
    makeChainMismatchOverview,
    makeDaiOverview,
    makeWalletNativeAssetOverview,
    makeBaseWalletOverview,
  ])
  assert(overview, 'The only item was skipped by transformers.')

  return overview
}

function makeGuestModeOverview({ reserve, walletInfo }: MakeWalletOverviewParams): WalletOverview | undefined {
  if (walletInfo.isConnected) {
    return undefined
  }

  const token = reserve.token

  return {
    guestMode: true,
    token,
    tokenBalance: walletInfo.findWalletBalanceForToken(token),
    deposit: {
      token,
      available: NormalizedUnitNumber(0),
    },
    borrow: {
      token,
      available: NormalizedUnitNumber(0),
      eligibility: reserve.borrowEligibilityStatus,
    },
  }
}

function makeChainMismatchOverview({
  reserve,
  marketInfo,
  walletInfo,
  connectedChainId,
}: MakeWalletOverviewParams): WalletOverview | undefined {
  if (connectedChainId === marketInfo.chainId) {
    return undefined
  }

  const token = reserve.token

  return {
    guestMode: false,
    token,
    tokenBalance: walletInfo.findWalletBalanceForToken(token),
    deposit: {
      token,
      available: NormalizedUnitNumber(0),
    },
    borrow: {
      token,
      available: NormalizedUnitNumber(0),
      eligibility: reserve.borrowEligibilityStatus,
    },
  }
}

function makeBaseWalletOverview({ reserve, marketInfo, walletInfo }: MakeWalletOverviewParams): WalletOverview {
  const token = reserve.token
  const tokenBalance = walletInfo.findWalletBalanceForToken(token)

  const availableToDeposit = getDepositMaxValue({
    asset: {
      status: reserve.status,
      totalLiquidity: reserve.totalLiquidity,
      isNativeAsset: marketInfo.nativeAssetInfo.nativeAssetName === token.symbol,
      supplyCap: reserve.supplyCap,
    },
    user: {
      balance: tokenBalance,
    },
    chain: {
      minRemainingNativeAsset: marketInfo.nativeAssetInfo.minRemainingNativeAssetBalance,
    },
  })

  const borrowValidationArgs = getValidateBorrowArgs(NormalizedUnitNumber(0), reserve, marketInfo)
  const validationIssue = validateBorrow(borrowValidationArgs)

  const availableToBorrow = getBorrowMaxValue({
    validationIssue,
    user: borrowValidationArgs.user,
    asset: borrowValidationArgs.asset,
  })

  return {
    guestMode: false,
    token,
    tokenBalance,
    deposit: {
      token,
      available: availableToDeposit,
    },
    borrow: {
      token,
      available: availableToBorrow,
      eligibility: reserve.borrowEligibilityStatus,
    },
  }
}

function makeDaiOverview({ reserve, marketInfo, ...rest }: MakeWalletOverviewParams): WalletOverview | undefined {
  if (reserve.token.symbol !== marketInfo.DAI.symbol) {
    return undefined
  }

  const baseOverview = makeBaseWalletOverview({ reserve, marketInfo, ...rest })
  const sDaiReserve = marketInfo.findOneReserveByToken(marketInfo.sDAI)
  const sDaiOverview = makeBaseWalletOverview({ reserve: sDaiReserve, marketInfo, ...rest })

  return {
    ...baseOverview,
    lend:
      import.meta.env.VITE_FEATURE_DISABLE_DAI_LEND !== '1'
        ? {
            ...baseOverview.deposit,
          }
        : undefined,
    deposit: {
      ...sDaiOverview.deposit,
    },
  }
}

function makeWalletNativeAssetOverview({
  reserve,
  walletInfo,
  nativeAssetInfo,
  ...rest
}: MakeWalletOverviewParams): WalletOverview | undefined {
  if (reserve.token.symbol !== nativeAssetInfo.wrappedNativeAssetSymbol) {
    return undefined
  }

  const baseOverview = makeBaseWalletOverview({ reserve, nativeAssetInfo, walletInfo, ...rest })

  const tokenBalance = NormalizedUnitNumber(
    walletInfo
      .findWalletBalanceForToken(reserve.token)
      .plus(walletInfo.findWalletBalanceForSymbol(nativeAssetInfo.nativeAssetSymbol)),
  )

  const availableToDeposit = getDepositMaxValue({
    asset: {
      status: reserve.status,
      totalLiquidity: reserve.totalLiquidity,
      isNativeAsset: true,
      supplyCap: reserve.supplyCap,
    },
    user: {
      balance: tokenBalance,
    },
    chain: {
      minRemainingNativeAsset: nativeAssetInfo.minRemainingNativeAssetBalance,
    },
  })

  return {
    ...baseOverview,
    tokenBalance,
    deposit: {
      ...baseOverview.deposit,
      available: availableToDeposit,
    },
  }
}
