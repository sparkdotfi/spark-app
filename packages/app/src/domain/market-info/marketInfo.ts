import { getChainConfigEntry } from '@/config/chain'
import { NativeAssetInfo } from '@/config/chain/types'
import { fromRay } from '@/utils/math'
import { assert, CheckedAddress, raise } from '@sparkdotfi/common-universal'
import { BaseUnitNumber, NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { bigNumberify } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { Token } from '../types/Token'
import { TokenSymbol } from '../types/TokenSymbol'
import { AaveDataLayerQueryReturnType, aaveDataLayerSelectFn } from './aave-data-layer/query'
import { determineEModeState, extractEmodeInfoFromReserves } from './emode'
import { IncentivesData, getIncentivesData } from './incentives'
import { parseRawPercentage } from './math'
import {
  BorrowEligibilityStatus,
  CollateralEligibilityStatus,
  ReserveStatus,
  SupplyAvailabilityStatus,
  getBorrowEligibilityStatus,
  getCollateralEligibilityStatus,
  getReserveStatus,
  getSupplyAvailabilityStatus,
} from './reserve-status'
import {
  determineIsolationModeState,
  determineSiloBorrowingState,
  normalizeUserSummary as normalizeUserPositionSummary,
} from './utils'

export interface Reserve {
  token: Token

  aToken: Token
  variableDebtTokenAddress: CheckedAddress

  status: ReserveStatus

  supplyAvailabilityStatus: SupplyAvailabilityStatus
  collateralEligibilityStatus: CollateralEligibilityStatus
  borrowEligibilityStatus: BorrowEligibilityStatus

  isIsolated: boolean
  isBorrowableInIsolation: boolean // in practice this is true only for stablecoins
  isSiloedBorrowing: boolean
  eModeCategory?: EModeCategory

  // @note: available liquidity respects borrow cap, so it can be negative when the cap is reached and breached (interests)
  availableLiquidity: NormalizedNumber
  availableLiquidityUSD: NormalizedNumber
  unborrowedLiquidity: NormalizedNumber
  supplyCap?: NormalizedNumber
  borrowCap?: NormalizedNumber
  totalLiquidity: NormalizedNumber // = supplied
  totalLiquidityUSD: NormalizedNumber
  totalDebt: NormalizedNumber
  totalDebtUSD: NormalizedNumber
  totalVariableDebt: NormalizedNumber
  totalVariableDebtUSD: NormalizedNumber
  isolationModeTotalDebt: NormalizedNumber // @note: this is already divided by debtCeilingDecimals
  debtCeiling: NormalizedNumber // @note: this is already divided by debtCeilingDecimals
  supplyAPY: Percentage | undefined
  maxLtv: Percentage
  liquidationThreshold: Percentage
  liquidationBonus: Percentage
  reserveFactor: Percentage
  aTokenBalance: NormalizedNumber

  lastUpdateTimestamp: number

  variableBorrowIndex: BigNumber
  variableBorrowRate: BigNumber
  liquidityIndex: BigNumber
  liquidityRate: BigNumber
  variableRateSlope1: BigNumber
  variableRateSlope2: BigNumber
  optimalUtilizationRate: Percentage
  utilizationRate: Percentage
  baseVariableBorrowRate: BigNumber

  variableBorrowApy: Percentage | undefined

  priceInUSD: BigNumber
  priceOracle: CheckedAddress
  usageAsCollateralEnabled: boolean
  usageAsCollateralEnabledOnUser: boolean

  incentives: IncentivesData
}

export interface UserPosition {
  reserve: Reserve
  scaledVariableDebt: BigNumber
  scaledATokenBalance: BigNumber
  collateralBalance: NormalizedNumber
  borrowBalance: NormalizedNumber
}

export interface UserPositionSummary {
  loanToValue: Percentage
  maxLoanToValue: Percentage
  healthFactor: BigNumber | undefined
  availableBorrowsUSD: NormalizedNumber
  totalBorrowsUSD: NormalizedNumber
  currentLiquidationThreshold: Percentage
  totalCollateralUSD: NormalizedNumber
  totalLiquidityUSD: NormalizedNumber
}

export type EModeState = { enabled: false } | { enabled: true; category: EModeCategory }
export type SiloBorrowingState = { enabled: false } | { enabled: true; siloedBorrowingReserve: Reserve }
export type IsolatedBorrowingState = { enabled: false } | { enabled: true; isolatedBorrowingReserve: Reserve }

export interface UserConfiguration {
  eModeState: EModeState
  isolationModeState: IsolatedBorrowingState
  siloBorrowingState: SiloBorrowingState
}

export interface EModeCategory {
  id: number
  name: string
  ltv: Percentage
  liquidationThreshold: Percentage
  liquidationBonus: Percentage
}
export type EModeCategories = Record<number, EModeCategory>

export interface UserReward {
  assets: CheckedAddress[]
  value: NormalizedNumber
  token: Token
  incentiveControllerAddress: CheckedAddress
}

export class MarketInfo {
  private readonly nativePosition: UserPosition

  constructor(
    public readonly reserves: Reserve[],
    public readonly userPositions: UserPosition[], // exists for every reserve, even if empty
    public readonly userPositionSummary: UserPositionSummary,
    public readonly userConfiguration: UserConfiguration,
    public readonly emodeCategories: EModeCategories,
    public readonly timestamp: number,
    public readonly chainId: number,
    public readonly userRewards: UserReward[],
    public readonly nativeAssetInfo: NativeAssetInfo,
    public readonly daiSymbol: TokenSymbol,
    public readonly sDaiSymbol: TokenSymbol,
  ) {
    const wrappedNativeAssetPosition =
      userPositions.find((p) => p.reserve.token.symbol === nativeAssetInfo.wrappedNativeAssetSymbol) ??
      raise('Wrapped native reserve not found.')
    const wrappedNativeToken = wrappedNativeAssetPosition.reserve.token
    const nativeReserve = {
      ...wrappedNativeAssetPosition.reserve,
      token: wrappedNativeToken.clone({
        symbol: nativeAssetInfo.nativeAssetSymbol,
        name: nativeAssetInfo.nativeAssetName,
        address: CheckedAddress.EEEE(),
      }),
    }
    this.nativePosition = {
      ...wrappedNativeAssetPosition,
      reserve: nativeReserve,
    }
  }

  get DAI(): Token {
    return this.findOneTokenBySymbol(this.daiSymbol)
  }

  get sDAI(): Token {
    return this.findOneTokenBySymbol(this.sDaiSymbol)
  }

  findTokenBySymbol(symbol: TokenSymbol): Token | undefined {
    return this.findReserveByATokenSymbol(symbol)?.aToken ?? this.findReserveBySymbol(symbol)?.token
  }
  findOneTokenBySymbol(symbol: TokenSymbol): Token {
    return this.findTokenBySymbol(symbol) ?? raise(`Token ${symbol} not found`)
  }

  findReserveBySymbol(symbol: TokenSymbol): Reserve | undefined {
    if (symbol === this.nativeAssetInfo.nativeAssetSymbol) {
      return this.nativePosition.reserve
    }

    return this.findReserveByATokenSymbol(symbol) ?? this.reserves.find((r) => r.token.symbol === symbol)
  }
  findReserveByToken(token: Token): Reserve | undefined {
    return this.findReserveBySymbol(token.symbol)
  }
  findReserveByUnderlyingAsset(underlyingAsset: CheckedAddress): Reserve | undefined {
    if (underlyingAsset === CheckedAddress.EEEE()) {
      return this.nativePosition.reserve
    }

    return this.reserves.find((r) => r.token.address === underlyingAsset)
  }
  findReserveByATokenSymbol(symbol: TokenSymbol): Reserve | undefined {
    return this.reserves.find((r) => r.aToken.symbol === symbol)
  }
  findOneReserveBySymbol(symbol: TokenSymbol): Reserve {
    return this.findReserveBySymbol(symbol) ?? raise(`Reserve ${symbol} not found`)
  }
  findOneReserveByToken(token: Token): Reserve {
    return this.findOneReserveBySymbol(token.symbol)
  }
  findOneReserveByUnderlyingAsset(underlyingAsset: CheckedAddress): Reserve {
    return this.findReserveByUnderlyingAsset(underlyingAsset) ?? raise(`Reserve ${underlyingAsset} not found`)
  }

  findPositionBySymbol(symbol: TokenSymbol): UserPosition | undefined {
    if (symbol === this.nativeAssetInfo.nativeAssetSymbol) {
      return this.nativePosition
    }

    return this.findPositionByATokenSymbol(symbol) ?? this.userPositions.find((p) => p.reserve.token.symbol === symbol)
  }
  findPositionByToken(token: Token): UserPosition | undefined {
    return this.findPositionBySymbol(token.symbol)
  }
  findPositionByATokenSymbol(symbol: TokenSymbol): UserPosition | undefined {
    return this.userPositions.find((p) => p.reserve.aToken.symbol === symbol)
  }
  findOnePositionBySymbol(symbol: TokenSymbol): UserPosition {
    return this.findPositionBySymbol(symbol) ?? raise(`Position ${symbol} not found`)
  }
  findOnePositionByToken(token: Token): UserPosition {
    return this.findOnePositionBySymbol(token.symbol)
  }
}

export interface MarketInfoSelectFnParams {
  timeAdvance?: number // time advance in seconds
}

export function marketInfoSelectFn({ timeAdvance }: MarketInfoSelectFnParams = {}) {
  return (data: AaveDataLayerQueryReturnType) => {
    const rawAaveData = aaveDataLayerSelectFn({ timeAdvance })(data)
    const chainId = data.chainId
    const { markets, daiSymbol, sdaiSymbol } = getChainConfigEntry(chainId)
    assert(markets && daiSymbol && sdaiSymbol, 'Markets config, dai and sdai symbols are required for market info')
    const tokens = rawAaveData.userSummary.userReservesData.map(
      (r): Token =>
        new Token({
          address: CheckedAddress(r.reserve.underlyingAsset),
          symbol: TokenSymbol(r.reserve.symbol),
          name: r.reserve.name,
          decimals: r.reserve.decimals,
          unitPriceUsd: r.reserve.priceInUSD,
        }),
    )

    /* eslint-disable func-style */
    const findOneTokenBySymbol = (symbol: TokenSymbol): Token => {
      return tokens.find((t) => t.symbol === symbol) ?? raise(`Token ${symbol} not found`)
    }
    /* eslint-enable func-style */

    const eModeCategories = extractEmodeInfoFromReserves(rawAaveData.formattedReserves)

    const reserves = rawAaveData.userSummary.userReservesData.map((r): Reserve => {
      const token = findOneTokenBySymbol(TokenSymbol(r.reserve.symbol))
      const supplyAvailabilityStatus = getSupplyAvailabilityStatus(r.reserve)
      const collateralEligibilityStatus = getCollateralEligibilityStatus(r.reserve)
      const borrowEligibilityStatus = getBorrowEligibilityStatus(r.reserve)

      return {
        token,

        aToken: token.createAToken(CheckedAddress(r.reserve.aTokenAddress)),
        variableDebtTokenAddress: CheckedAddress(r.reserve.variableDebtTokenAddress),

        status: getReserveStatus(r.reserve),

        supplyAvailabilityStatus,
        collateralEligibilityStatus,
        borrowEligibilityStatus,

        isIsolated: r.reserve.isIsolated,
        eModeCategory:
          r.reserve.eModeCategoryId !== 0
            ? (eModeCategories[r.reserve.eModeCategoryId] ??
              raise(`EMode category ${r.reserve.eModeCategoryId} not found`))
            : undefined,
        isSiloedBorrowing: r.reserve.isSiloedBorrowing,
        isBorrowableInIsolation: r.reserve.borrowableInIsolation,

        availableLiquidity: NormalizedNumber(r.reserve.formattedAvailableLiquidity), // @note: r.reserve.availableLiquidity doesn't respect borrow caps so we use formattedAvailableLiquidity which does
        availableLiquidityUSD: NormalizedNumber(r.reserve.availableLiquidityUSD),
        unborrowedLiquidity: NormalizedNumber(r.reserve.unborrowedLiquidity),
        supplyCap: r.reserve.supplyCap !== '0' ? NormalizedNumber(r.reserve.supplyCap) : undefined,
        borrowCap: r.reserve.borrowCap !== '0' ? NormalizedNumber(r.reserve.borrowCap) : undefined,
        totalLiquidity: NormalizedNumber(r.reserve.totalLiquidity),
        totalLiquidityUSD: NormalizedNumber(r.reserve.totalLiquidityUSD),
        totalDebt: NormalizedNumber(r.reserve.totalDebt),
        totalDebtUSD: NormalizedNumber(r.reserve.totalDebtUSD),
        totalVariableDebt: NormalizedNumber(r.reserve.totalVariableDebt),
        totalVariableDebtUSD: NormalizedNumber(r.reserve.totalVariableDebtUSD),
        isolationModeTotalDebt: NormalizedNumber(r.reserve.isolationModeTotalDebtUSD),
        debtCeiling: NormalizedNumber(r.reserve.debtCeilingUSD),
        supplyAPY: supplyAvailabilityStatus === 'no' ? undefined : Percentage(r.reserve.supplyAPY), // when supplying is disabled, APY is not available
        maxLtv: parseRawPercentage(r.reserve.baseLTVasCollateral),
        liquidationThreshold: parseRawPercentage(r.reserve.reserveLiquidationThreshold),
        liquidationBonus: bigNumberify(r.reserve.formattedReserveLiquidationBonus).gt(0)
          ? Percentage(r.reserve.formattedReserveLiquidationBonus)
          : Percentage(0),
        variableBorrowApy: borrowEligibilityStatus === 'no' ? undefined : Percentage(r.reserve.variableBorrowAPY), // when borrowing is disabled, APY is not available
        reserveFactor: Percentage(r.reserve.reserveFactor),
        aTokenBalance: NormalizedNumber(r.underlyingBalance),

        lastUpdateTimestamp: r.reserve.lastUpdateTimestamp,

        variableBorrowIndex: bigNumberify(r.reserve.variableBorrowIndex),
        variableBorrowRate: bigNumberify(r.reserve.variableBorrowRate),
        liquidityIndex: bigNumberify(r.reserve.liquidityIndex),
        liquidityRate: bigNumberify(r.reserve.liquidityRate),
        variableRateSlope1: bigNumberify(r.reserve.variableRateSlope1),
        variableRateSlope2: bigNumberify(r.reserve.variableRateSlope2),
        optimalUtilizationRate: Percentage(fromRay(r.reserve.optimalUsageRatio)),
        utilizationRate: Percentage(r.reserve.borrowUsageRatio),
        baseVariableBorrowRate: bigNumberify(r.reserve.baseVariableBorrowRate),

        priceInUSD: bigNumberify(r.reserve.priceInUSD),
        priceOracle: CheckedAddress(r.reserve.priceOracle),

        usageAsCollateralEnabled: r.reserve.usageAsCollateralEnabled,
        usageAsCollateralEnabledOnUser: r.usageAsCollateralEnabledOnUser,

        // incentives are fetched from the blockchain
        incentives: getIncentivesData(r.reserve, findOneTokenBySymbol),
      }
    })

    const userPositions = rawAaveData.rawUserReserves.map((r): UserPosition => {
      const reserve = reserves.find((res) => res.token.address === r.underlyingAsset)!
      const formattedReserve = rawAaveData.userSummary.userReservesData.find(
        (res) => res.underlyingAsset === r.underlyingAsset,
      )!

      return {
        reserve,
        scaledATokenBalance: bigNumberify(r.scaledATokenBalance),
        scaledVariableDebt: bigNumberify(r.scaledVariableDebt),
        collateralBalance: NormalizedNumber(formattedReserve.underlyingBalance),
        borrowBalance: NormalizedNumber(formattedReserve.variableBorrows),
      }
    })

    const userPositionSummary = normalizeUserPositionSummary(rawAaveData.userSummary)

    const userConfiguration: UserConfiguration = {
      eModeState: determineEModeState(rawAaveData.userEmodeCategoryId, eModeCategories),
      isolationModeState: determineIsolationModeState(rawAaveData.userSummary, reserves),
      siloBorrowingState: determineSiloBorrowingState(userPositions),
    }

    const allIncentiveEligibleAddresses: CheckedAddress[] = rawAaveData.userSummary.userReservesData.flatMap(
      ({ reserve }) =>
        [
          { data: reserve.aIncentivesData, address: reserve.aTokenAddress },
          { data: reserve.vIncentivesData, address: reserve.variableDebtTokenAddress },
          { data: reserve.sIncentivesData, address: reserve.stableDebtTokenAddress },
        ]
          .filter(({ data }) => data && data.length > 0)
          .map(({ address }) => CheckedAddress(address)),
    )

    const userRewards: UserReward[] = Object.values(rawAaveData.userRewards)
      .map((value) => {
        const token = findOneTokenBySymbol(TokenSymbol(value.rewardTokenSymbol))
        return {
          value: token.fromBaseUnit(BaseUnitNumber(value.claimableRewards.dp(0))),
          token,
          incentiveControllerAddress: CheckedAddress(value.incentiveControllerAddress),
          assets: allIncentiveEligibleAddresses, // overriding rewards assets to ensure that all possible rewards are claimed
        }
      })
      .filter((r) => r.value.gt(0))

    return new MarketInfo(
      reserves,
      userPositions,
      userPositionSummary,
      userConfiguration,
      eModeCategories,
      rawAaveData.timestamp,
      chainId,
      userRewards,
      markets.nativeAssetInfo,
      daiSymbol,
      sdaiSymbol,
    )
  }
}
