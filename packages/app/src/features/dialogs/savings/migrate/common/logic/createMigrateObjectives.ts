import { Token } from '@/domain/types/Token'
import { Objective } from '@/features/actions/logic/types'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export interface CreateUpgradeObjectivesParams {
  type: 'upgrade' | 'downgrade'
  fromToken: Token
  toToken: Token
  amount: NormalizedNumber
}

export function createMigrateObjectives({
  type,
  fromToken,
  toToken,
  amount,
}: CreateUpgradeObjectivesParams): Objective[] {
  return [
    {
      type,
      fromToken,
      toToken,
      amount,
    },
  ]
}
