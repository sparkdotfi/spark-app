import { SPARK_UI_REFERRAL_CODE_BIGINT } from '@/config/consts'
import {
  migrationActionsConfig,
  psm3Abi,
  psm3Address,
  psmActionsConfig,
  savingsXDaiAdapterAbi,
  savingsXDaiAdapterAddress,
  usdcVaultAbi,
  usdsPsmActionsConfig,
} from '@/config/contracts-generated'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { assertWithdraw } from '@/domain/savings/assertWithdraw'
import { Token } from '@/domain/types/Token'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { ActionConfig, ActionContext, GetWriteConfigResult } from '@/features/actions/logic/types'
import { calculateGemConversionFactor } from '@/features/actions/utils/savings'
import { BaseUnitNumber, toBigInt } from '@sparkdotfi/common-universal'
import { assert, CheckedAddress, NormalizedNumber, assertNever, raise } from '@sparkdotfi/common-universal'
import { QueryKey } from '@tanstack/react-query'
import { Address, erc4626Abi } from 'viem'
import { gnosis } from 'viem/chains'
import { WithdrawFromSavingsAction } from '../types'
import { calculateGemMinAmountOut } from './calculateGemMinAmountOut'
import { formatMaxAmountInForPsm3 } from './formatMaxAmountInForPsm3'
import { getSavingsWithdrawActionPath } from './getSavingsWithdrawActionPath'

export function createWithdrawFromSavingsActionConfig(
  action: WithdrawFromSavingsAction,
  context: ActionContext,
): ActionConfig {
  const { account, chainId } = context
  const tokenRepository = context.tokenRepository ?? raise('Tokens info is required for deposit to savings action')
  const actionPath = getSavingsWithdrawActionPath({
    token: action.token,
    savingsToken: action.savingsToken,
    tokenRepository,
    chainId,
  })

  return {
    getWriteConfig: () => {
      const { token, savingsToken, isRedeem, mode, receiver: _receiver } = action
      const receiver = mode === 'send' ? _receiver! : account

      const argsAmount = isRedeem
        ? toBigInt(savingsToken.toBaseUnit(action.amount))
        : toBigInt(token.toBaseUnit(action.amount))

      switch (actionPath) {
        case 'susds-to-usds':
        case 'sdai-to-dai':
          return ensureConfigTypes({
            address: savingsToken.address,
            abi: erc4626Abi,
            functionName: isRedeem ? 'redeem' : 'withdraw',
            args: [argsAmount, receiver, account],
          })

        case 'sdai-to-sexy-dai':
          return ensureConfigTypes({
            address: savingsXDaiAdapterAddress[gnosis.id],
            abi: savingsXDaiAdapterAbi,
            functionName: isRedeem ? 'redeemXDAI' : 'withdrawXDAI',
            args: [argsAmount, receiver],
          })

        case 'sdai-to-usds':
          return ensureConfigTypes({
            address: getContractAddress(migrationActionsConfig.address, chainId),
            abi: migrationActionsConfig.abi,
            functionName: isRedeem ? 'migrateSDAISharesToUSDS' : 'migrateSDAIAssetsToUSDS',
            args: [receiver, argsAmount],
          })

        case 'sdai-to-usdc': {
          assert(context.savingsAccounts, 'Savings accounts repository is required for sdai to usdc')
          const { converter } = context.savingsAccounts.findOneBySavingsToken(savingsToken)

          return getUsdcWithdrawConfig({
            psmActionsAddress: getContractAddress(psmActionsConfig.address, chainId),
            converter,
            isRedeem,
            actionAmount: action.amount,
            token,
            savingsToken,
            receiver,
            argsAmount,
          })
        }
        case 'susds-to-usdc': {
          assert(context.savingsAccounts, 'Savings accounts repository is required for sdai to usdc')
          const { converter } = context.savingsAccounts.findOneBySavingsToken(savingsToken)

          return getUsdcWithdrawConfig({
            psmActionsAddress: getContractAddress(usdsPsmActionsConfig.address, chainId),
            converter,
            isRedeem,
            actionAmount: action.amount,
            token,
            savingsToken,
            receiver,
            argsAmount,
          })
        }

        case 'base-susds-to-usds':
        case 'base-susds-to-usdc':
        case 'arbitrum-susds-to-usds':
        case 'arbitrum-susds-to-usdc': {
          assert(
            context.savingsAccounts,
            'Savings accounts repository is required for psm withdraw from savings action',
          )
          const { converter } = context.savingsAccounts.findOneBySavingsToken(savingsToken)

          // @note We don't need to use savings prediction here, because
          // the savings token value increases with time.

          if (isRedeem) {
            const minAssetsAmount = converter.convertToAssets({ shares: action.amount })

            const minAmountOut = calculateGemMinAmountOut({
              gemDecimals: token.decimals,
              assetsTokenDecimals: savingsToken.decimals,
              assetsAmount: toBigInt(savingsToken.toBaseUnit(minAssetsAmount)),
            })

            return ensureConfigTypes({
              address: getContractAddress(psm3Address, chainId),
              abi: psm3Abi,
              functionName: 'swapExactIn',
              args: [
                savingsToken.address,
                token.address,
                argsAmount,
                minAmountOut,
                receiver,
                SPARK_UI_REFERRAL_CODE_BIGINT,
              ],
            })
          }

          const maxSharesAmount = converter.convertToShares({
            assets: action.amount,
          })
          const maxAmountIn = formatMaxAmountInForPsm3({
            susds: savingsToken,
            susdsAmount: maxSharesAmount,
            assetOut: token,
          })

          return ensureConfigTypes({
            address: getContractAddress(psm3Address, chainId),
            abi: psm3Abi,
            functionName: 'swapExactOut',
            args: [
              savingsToken.address,
              token.address,
              argsAmount,
              maxAmountIn,
              receiver,
              SPARK_UI_REFERRAL_CODE_BIGINT,
            ],
          })
        }

        case 'susdc-to-usdc': {
          assert(context.savingsAccounts, 'Savings accounts repository is required for usdc vault withdrawal')
          const { converter } = context.savingsAccounts.findOneBySavingsToken(savingsToken)
          if (isRedeem) {
            // @note: Assumes no psm fees
            const minAssetsOut = action.token.toBaseUnit(converter.convertToAssets({ shares: action.amount }))

            return ensureConfigTypes({
              address: savingsToken.address,
              abi: usdcVaultAbi,
              functionName: 'redeem',
              args: [argsAmount, receiver, account, toBigInt(minAssetsOut)],
            })
          }

          // @note: Assumes no psm fees
          const maxSharesIn = action.savingsToken.toBaseUnit(
            converter.convertToShares({
              assets: action.amount,
            }),
          )

          return ensureConfigTypes({
            address: savingsToken.address,
            abi: usdcVaultAbi,
            functionName: 'withdraw',
            args: [argsAmount, receiver, account, toBigInt(maxSharesIn)],
          })
        }

        case 'base-susdc-to-usdc':
        case 'arbitrum-susdc-to-usdc': {
          assert(context.savingsAccounts, 'Savings accounts repository is required for usdc vault withdrawal')
          const { converter } = context.savingsAccounts.findOneBySavingsToken(savingsToken)

          if (isRedeem) {
            // @note: Assumes no psm fees
            const minAssetsOut = action.token.toBaseUnit(converter.convertToAssets({ shares: action.amount }))

            return ensureConfigTypes({
              address: savingsToken.address,
              abi: usdcVaultAbi,
              functionName: 'redeem',
              args: [argsAmount, receiver, account, toBigInt(minAssetsOut)],
            })
          }

          // @note: Assumes no psm fees
          const maxShares = formatMaxAmountInForPsm3({
            susds: action.savingsToken,
            susdsAmount: converter.convertToShares({
              assets: action.amount,
            }),
            assetOut: token,
          })

          return ensureConfigTypes({
            address: savingsToken.address,
            abi: usdcVaultAbi,
            functionName: 'withdraw',
            args: [argsAmount, receiver, account, maxShares],
          })
        }

        default:
          assertNever(actionPath)
      }
    },

    invalidates: () => {
      const balancesQueryKeyPrefix = getBalancesQueryKeyPrefix({ chainId, account })
      function getAllowanceQueryKey(spender: CheckedAddress): QueryKey {
        return allowanceQueryKey({
          token: action.savingsToken.address,
          spender,
          account,
          chainId,
        })
      }

      switch (actionPath) {
        case 'sdai-to-dai':
        case 'susds-to-usds':
        case 'susdc-to-usdc':
        case 'base-susdc-to-usdc':
        case 'arbitrum-susdc-to-usdc':
          return [balancesQueryKeyPrefix]
        case 'sdai-to-sexy-dai':
          return [balancesQueryKeyPrefix, getAllowanceQueryKey(CheckedAddress(savingsXDaiAdapterAddress[gnosis.id]))]
        case 'sdai-to-usds':
          return [
            balancesQueryKeyPrefix,
            getAllowanceQueryKey(getContractAddress(migrationActionsConfig.address, chainId)),
          ]
        case 'sdai-to-usdc':
          return [balancesQueryKeyPrefix, getAllowanceQueryKey(getContractAddress(psmActionsConfig.address, chainId))]
        case 'susds-to-usdc':
          return [
            balancesQueryKeyPrefix,
            getAllowanceQueryKey(getContractAddress(usdsPsmActionsConfig.address, chainId)),
          ]
        case 'base-susds-to-usdc':
        case 'base-susds-to-usds':
        case 'arbitrum-susds-to-usdc':
        case 'arbitrum-susds-to-usds':
          return [balancesQueryKeyPrefix, getAllowanceQueryKey(getContractAddress(psm3Address, chainId))]
        default:
          assertNever(actionPath)
      }
    },

    beforeWriteCheck: () => {
      const reserveAddresses = tokenRepository.all().map(({ token }) => token.address)
      assertWithdraw({
        mode: action.mode,
        receiver: action.receiver,
        owner: account,
        tokenAddresses: reserveAddresses,
      })
    },
  }
}

interface GetUsdcWithdrawConfigParams {
  psmActionsAddress: CheckedAddress
  converter: SavingsConverter
  isRedeem: boolean
  actionAmount: NormalizedNumber
  token: Token
  savingsToken: Token
  receiver: Address
  argsAmount: bigint
}

function getUsdcWithdrawConfig({
  psmActionsAddress,
  converter,
  isRedeem,
  actionAmount,
  token,
  savingsToken,
  receiver,
  argsAmount,
}: GetUsdcWithdrawConfigParams): GetWriteConfigResult {
  if (isRedeem) {
    const assetsAmount = converter.convertToAssets({ shares: actionAmount })
    const gemMinAmountOut = calculateGemMinAmountOut({
      gemDecimals: token.decimals,
      assetsTokenDecimals: savingsToken.decimals,
      assetsAmount: toBigInt(savingsToken.toBaseUnit(assetsAmount)),
    })

    return ensureConfigTypes({
      address: psmActionsAddress,
      abi: psmActionsConfig.abi,
      functionName: 'redeemAndSwap',
      args: [receiver, argsAmount, gemMinAmountOut],
    })
  }

  const gemConversionFactor = calculateGemConversionFactor({
    gemDecimals: token.decimals,
    assetsTokenDecimals: savingsToken.decimals,
  })
  const assetsMaxAmountIn = toBigInt(BaseUnitNumber(token.toBaseUnit(actionAmount).times(gemConversionFactor)))

  return ensureConfigTypes({
    address: psmActionsAddress,
    abi: psmActionsConfig.abi,
    functionName: 'withdrawAndSwap',
    args: [receiver, argsAmount, assetsMaxAmountIn],
  })
}
