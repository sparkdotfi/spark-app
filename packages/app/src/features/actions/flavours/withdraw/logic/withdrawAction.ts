import { poolAbi } from '@/config/abis/poolAbi'
import { lendingPoolConfig, wethGatewayConfig } from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { aaveDataLayerQueryKey } from '@/domain/market-info/aave-data-layer/query'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { CheckedAddress, toBigInt } from '@sparkdotfi/common-universal'
import { raise } from '@sparkdotfi/common-universal'
import { ActionConfig, ActionContext } from '../../../logic/types'
import { WithdrawAction } from '../types'

export function createWithdrawActionConfig(action: WithdrawAction, context: ActionContext): ActionConfig {
  const { account, chainId } = context

  const wethGatewayAddress = getContractAddress(wethGatewayConfig.address, chainId)
  const lendingPoolAddress = getContractAddress(lendingPoolConfig.address, chainId)
  const withdrawTokenAddress = action.token.address

  const marketInfo = context.marketInfo ?? raise('Market info is required for withdraw action')
  const reserve = marketInfo.findOneReserveByToken(action.token)
  const aTokenAddress = reserve.aToken.address

  return {
    getWriteConfig: () => {
      const withdrawAmount = toBigInt(action.token.toBaseUnit(action.value))

      if (withdrawTokenAddress === CheckedAddress.EEEE()) {
        return ensureConfigTypes({
          address: wethGatewayAddress,
          abi: wethGatewayConfig.abi,
          functionName: 'withdrawETH',
          args: [lendingPoolAddress, withdrawAmount, account],
        })
      }

      return ensureConfigTypes({
        abi: poolAbi,
        address: lendingPoolAddress,
        functionName: 'withdraw',
        args: [withdrawTokenAddress, withdrawAmount, account],
      })
    },

    invalidates: () => [
      allowanceQueryKey({ token: aTokenAddress, spender: wethGatewayAddress, account, chainId }),
      getBalancesQueryKeyPrefix({ chainId, account }),
      aaveDataLayerQueryKey({ chainId, account }),
    ],
  }
}
