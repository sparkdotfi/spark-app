import { Percentage } from '@sparkdotfi/common-universal'
import { Token } from '../types/Token'
import { TokenSymbol } from '../types/TokenSymbol'
import type { AaveData, AaveUserReserve } from './aave-data-layer/query'

export interface IncentivesData {
  deposit: Incentive[]
  borrow: Incentive[]
}

export interface Incentive {
  token: Token
  APR: Percentage
}

type ReserveIncentiveResponse = NonNullable<AaveData['formattedReserves'][number]['aIncentivesData']>[number]
export function getIncentivesData(
  reserve: AaveUserReserve,
  findOneTokenBySymbol: (symbol: TokenSymbol) => Token,
): IncentivesData {
  function formatIncentive(incentive: ReserveIncentiveResponse): Incentive {
    const token = findOneTokenBySymbol(TokenSymbol(incentive.rewardTokenSymbol))

    return {
      token,
      APR: Percentage(incentive.incentiveAPR),
    }
  }

  return {
    deposit: (reserve.aIncentivesData ?? []).map(formatIncentive).filter(notZeroIncentive),
    // Spark doesn't support stable borrows, so it's safe to assume that the only incentive for borrow is the variable borrow
    borrow: (reserve.vIncentivesData ?? []).map(formatIncentive).filter(notZeroIncentive),
  }
}

function notZeroIncentive(incentive: Incentive): boolean {
  return !incentive.APR.isZero()
}
