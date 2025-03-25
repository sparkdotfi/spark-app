import { TokenWithBalance } from '@/domain/common/types'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { Token } from '@/domain/types/Token'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { AccountSparkRewardsSummary } from '../types'
import { STEP_IN_MS, SavingsOverview, makeSavingsOverview } from './makeSavingsOverview'
import { calculateOneYearProjection } from './projections'
import { InterestData } from './useSavings'

export interface GetInterestDataParams {
  savingsConverter: SavingsConverter
  savingsToken: Token
  savingsTokenBalance: NormalizedUnitNumber
  underlyingToken: Token
  sparkRewardsSummary: AccountSparkRewardsSummary
  timestamp: number
}

export type MakeSavingsTokenDetailsResult = InterestData | undefined

export function getInterestData({
  savingsConverter,
  savingsToken,
  savingsTokenBalance,
  underlyingToken,
  sparkRewardsSummary,
  timestamp,
}: GetInterestDataParams): InterestData {
  const oneYearProjection = calculateOneYearProjection({
    timestamp,
    shares: savingsTokenBalance,
    savingsConverter,
  })

  const balanceRefreshIntervalInMs = savingsConverter.supportsRealTimeInterestAccrual ? STEP_IN_MS : undefined
  const calculateUnderlyingTokenBalance = calculateSavingsBalanceFactory(savingsConverter, {
    token: savingsToken,
    balance: savingsTokenBalance,
  })

  const { depositedAssets: currentUnderlyingTokenBalance } = calculateUnderlyingTokenBalance(timestamp * 1000)
  const sparkRewardsOneYearProjection = NormalizedUnitNumber(
    underlyingToken.toUSD(currentUnderlyingTokenBalance).times(sparkRewardsSummary.totalApy),
  )

  return {
    APY: savingsConverter.apy,
    oneYearProjection,
    sparkRewardsOneYearProjection,
    calculateUnderlyingTokenBalance,
    balanceRefreshIntervalInMs,
  }
}

function calculateSavingsBalanceFactory(savingsConverter: SavingsConverter, savingsTokenWithBalance: TokenWithBalance) {
  return function calculateSavingsBalance(timestampInMs: number): SavingsOverview {
    return makeSavingsOverview({
      timestampInMs,
      savingsTokenWithBalance,
      savingsConverter,
    })
  }
}
