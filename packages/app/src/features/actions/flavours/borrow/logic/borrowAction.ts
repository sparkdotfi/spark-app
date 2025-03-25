import { poolAbi } from '@/config/abis/poolAbi'
import { InterestRate, SPARK_UI_REFERRAL_CODE } from '@/config/consts'
import { lendingPoolConfig, wethGatewayConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { aaveDataLayerQueryKey } from '@/domain/market-info/aave-data-layer/query'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { CheckedAddress, toBigInt } from '@sparkdotfi/common-universal'
import { ActionConfig, ActionContext } from '../../../logic/types'
import { getBorrowAllowanceQueryKey } from '../../approve-delegation/logic/query'
import { BorrowAction } from '../types'

export function createBorrowActionConfig(action: BorrowAction, context: ActionContext): ActionConfig {
  const { account, chainId } = context
  const wethGatewayAddress = getContractAddress(wethGatewayConfig.address, chainId)
  const lendingPoolAddress = getContractAddress(lendingPoolConfig.address, chainId)
  const borrowTokenAddress = action.token.address

  return {
    getWriteConfig: () => {
      const borrowAmount = toBigInt(action.token.toBaseUnit(action.value))
      const interestRateMode = BigInt(InterestRate.Variable)

      if (borrowTokenAddress === CheckedAddress.EEEE()) {
        return ensureConfigTypes({
          abi: wethGatewayConfig.abi,
          address: wethGatewayAddress,
          functionName: 'borrowETH',
          args: [lendingPoolAddress, borrowAmount, interestRateMode, SPARK_UI_REFERRAL_CODE],
        })
      }

      return ensureConfigTypes({
        abi: poolAbi,
        address: lendingPoolAddress,
        functionName: 'borrow',
        args: [borrowTokenAddress, borrowAmount, interestRateMode, SPARK_UI_REFERRAL_CODE, account],
      })
    },

    invalidates: () => [
      getBalancesQueryKeyPrefix({ chainId, account }),
      aaveDataLayerQueryKey({ chainId, account }),
      getBorrowAllowanceQueryKey({
        fromUser: account,
        toUser: wethGatewayAddress,
        chainId,
        debtTokenAddress: borrowTokenAddress,
      }),
    ],
  }
}
