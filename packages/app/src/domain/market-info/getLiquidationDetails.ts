import { getChainConfigEntry } from '@/config/chain'
import { TokenWithValue } from '@/domain/common/types'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedUnitNumber, Percentage, raise } from '@sparkdotfi/common-universal'
import { eModeCategoryIdToName } from '../e-mode/constants'

export interface LiquidationDetails {
  liquidationPrice: NormalizedUnitNumber
  tokenWithPrice: {
    priceInUSD: NormalizedUnitNumber
    symbol: TokenSymbol
  }
}

export interface GetLiquidationDetailsParams {
  collaterals: TokenWithValue[]
  borrows: TokenWithValue[]
  marketInfo: MarketInfo
  liquidationThreshold: Percentage
}

export function getLiquidationDetails({
  collaterals,
  borrows,
  marketInfo,
  liquidationThreshold,
}: GetLiquidationDetailsParams): LiquidationDetails | undefined {
  const { defaultAssetToBorrow } =
    getChainConfigEntry(marketInfo.chainId).markets ?? raise('Markets config is not defined on this chain')

  if (borrows.length !== 1 || borrows[0]!.token.symbol !== defaultAssetToBorrow) {
    return undefined
  }
  const borrowInUSD = borrows[0]!.value.times(marketInfo.findOneTokenBySymbol(defaultAssetToBorrow).unitPriceUsd)

  const collateralEModeIds = collaterals.map(
    (collateral) => marketInfo.findOneReserveBySymbol(collateral.token.symbol).eModeCategory?.id,
  )
  const allCollateralsETHCorrelated = collateralEModeIds.every(
    (id) => eModeCategoryIdToName[id as keyof typeof eModeCategoryIdToName] === 'ETH Correlated',
  )
  const WETHPrice = marketInfo.findTokenBySymbol(TokenSymbol('WETH'))?.unitPriceUsd
  if (allCollateralsETHCorrelated && WETHPrice) {
    const totalCollateralInWETH = collaterals.reduce((sum, collateral) => {
      const collateralPrice = marketInfo.findOneTokenBySymbol(collateral.token.symbol).unitPriceUsd
      return sum.plus(collateral.value.times(collateralPrice).div(WETHPrice))
    }, NormalizedUnitNumber.zero)
    const liquidationPrice = calculateLiquidationPrice({
      borrowInUSD,
      depositAmount: totalCollateralInWETH,
      liquidationThreshold,
    })

    return {
      liquidationPrice,
      tokenWithPrice: {
        priceInUSD: NormalizedUnitNumber(WETHPrice),
        symbol: TokenSymbol('ETH'),
      },
    }
  }

  if (collaterals.length !== 1) {
    return undefined
  }

  const collateral = collaterals[0]!
  const collateralPrice = collateral.token.unitPriceUsd

  const liquidationPrice = calculateLiquidationPrice({
    borrowInUSD,
    depositAmount: collateral.value,
    liquidationThreshold,
  })

  return {
    liquidationPrice,
    tokenWithPrice: {
      priceInUSD: NormalizedUnitNumber(collateralPrice),
      symbol: collateral.token.symbol,
    },
  }
}

interface CalculateLiquidationPriceArguments {
  borrowInUSD: NormalizedUnitNumber
  depositAmount: NormalizedUnitNumber
  liquidationThreshold: Percentage
}

function calculateLiquidationPrice({
  borrowInUSD,
  depositAmount,
  liquidationThreshold,
}: CalculateLiquidationPriceArguments): NormalizedUnitNumber {
  const denominator = depositAmount.times(NormalizedUnitNumber(liquidationThreshold))
  if (denominator.isZero()) {
    return NormalizedUnitNumber.zero
  }

  return borrowInUSD.times(denominator)
}
