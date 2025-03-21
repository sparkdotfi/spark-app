import { JSONStringifyRich } from '@/utils/object'
import { assertNever } from '@marsfoundation/common-universal'
import { Objective } from './types'

export function stringifyObjectivesDeep(objectives: Objective[]): string {
  return JSONStringifyRich(objectives)
}

export function stringifyObjectivesToStableActions(objectives: Objective[]): string {
  return JSON.stringify(
    objectives.map((objective) => {
      switch (objective.type) {
        case 'deposit':
        case 'borrow':
          return [objective.type, objective.token.address, objective.value]
        case 'withdraw':
          return [objective.type, objective.reserve.token.address, objective.value]
        case 'repay':
          return [objective.type, objective.reserve.token.address, objective.value, objective.useAToken]
        case 'setUseAsCollateral':
          return [objective.type, objective.useAsCollateral]
        case 'setUserEMode':
          return [objective.type, objective.eModeCategoryId]
        case 'claimMarketRewards':
          return [objective.type, objective.token.address, objective.assets]
        case 'withdrawFromSavings':
          return [objective.type, objective.token.address, objective.amount]
        case 'depositToSavings':
          return [objective.type, objective.token.address, objective.savingsToken.address, objective.value]
        case 'upgrade':
        case 'downgrade':
        case 'unstake':
        case 'stakeSpark':
          return [objective.type, objective.amount]
        case 'unstakeSpark':
          return [objective.type, objective.amount, objective.accountActiveShares, objective.unstakeAll]
        case 'stake':
          return [objective.type, objective.token.address, objective.amount]
        case 'claimFarmRewards':
          return [objective.type, objective.farm]
        case 'claimSparkRewards':
          return [
            objective.type,
            objective.token.address,
            objective.epoch,
            objective.cumulativeAmount,
            objective.merkleRoot,
            objective.merkleProof,
          ]
        case 'convertStables':
          return [objective.type, objective.inToken.symbol, objective.outToken.symbol, objective.amount]
        default:
          assertNever(objective)
      }
    }),
  )
}
