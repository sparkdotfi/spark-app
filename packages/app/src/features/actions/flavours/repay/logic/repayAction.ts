import { poolAbi } from '@/config/abis/poolAbi'
import { InterestRate } from '@/config/consts'
import { lendingPoolConfig, wethGatewayConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { aaveDataLayerQueryKey } from '@/domain/market-info/aave-data-layer/query'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { CheckedAddress, UnixTime, toBigInt } from '@sparkdotfi/common-universal'
import { ActionConfig, ActionContext } from '../../../logic/types'
import { RepayAction } from '../types'

export function createRepayActionConfig(action: RepayAction, context: ActionContext): ActionConfig {
  const { account, chainId, permitStore } = context
  const lendingPool = getContractAddress(lendingPoolConfig.address, chainId)
  const wethGateway = getContractAddress(wethGatewayConfig.address, chainId)

  return {
    getWriteConfig: () => {
      const useAToken = action.useAToken
      const token = action.reserve.token

      const interestRateMode = BigInt(InterestRate.Variable)
      const value = toBigInt(token.toBaseUnit(action.value))
      const permit = permitStore?.find(token)

      if (useAToken) {
        return ensureConfigTypes({
          address: lendingPool,
          abi: poolAbi,
          functionName: 'repayWithATokens',
          args: [token.address, value, interestRateMode],
        })
      }

      if (permit) {
        return ensureConfigTypes({
          address: lendingPool,
          abi: poolAbi,
          functionName: 'repayWithPermit',
          args: [
            token.address,
            value,
            interestRateMode,
            account,
            UnixTime.fromDate(permit.deadline),
            Number(permit.signature.v),
            permit.signature.r,
            permit.signature.s,
          ],
        })
      }

      if (token.address === CheckedAddress.EEEE()) {
        return ensureConfigTypes({
          address: wethGateway,
          abi: wethGatewayConfig.abi,
          functionName: 'repayETH',
          args: [lendingPool, value, interestRateMode, account],
          value,
        })
      }

      return ensureConfigTypes({
        address: lendingPool,
        abi: poolAbi,
        functionName: 'repay',
        args: [token.address, value, interestRateMode, account],
      })
    },

    invalidates: () => [
      getBalancesQueryKeyPrefix({ chainId, account }),
      aaveDataLayerQueryKey({ chainId, account }),
      allowanceQueryKey({ token: action.reserve.token.address, spender: lendingPool, account, chainId }),
    ],
  }
}
