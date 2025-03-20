import { susdsAbi } from '@/config/abis/susdsAbi'
import { SPARK_UI_REFERRAL_CODE, SPARK_UI_REFERRAL_CODE_BIGINT } from '@/config/consts'
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
import { trackEvent } from '@/domain/analytics/mixpanel'
import { getContractAddress } from '@/domain/hooks/useContractAddress'
import { ensureConfigTypes } from '@/domain/hooks/useWrite'
import { EPOCH_LENGTH } from '@/domain/market-info/consts'
import { SavingsConverter } from '@/domain/savings-converters/types'
import { Token } from '@/domain/types/Token'
import { getBalancesQueryKeyPrefix } from '@/domain/wallet/getBalancesQueryKeyPrefix'
import { allowanceQueryKey } from '@/features/actions/flavours/approve/logic/query'
import { ActionConfig, ActionContext, GetWriteConfigResult } from '@/features/actions/logic/types'
import { calculateGemConversionFactor } from '@/features/actions/utils/savings'
import { BaseUnitNumber, toBigInt } from '@marsfoundation/common-universal'
import { assert, CheckedAddress, NormalizedUnitNumber, assertNever, raise } from '@marsfoundation/common-universal'
import { QueryKey } from '@tanstack/react-query'
import { Address, erc4626Abi } from 'viem'
import { gnosis } from 'viem/chains'
import { DepositToSavingsAction } from '../types'
import { formatMinAmountOutForPsm3 } from './formatMinAmountOutForPsm3'
import { getSavingsDepositActionPath } from './getSavingsDepositActionPath'

export function createDepositToSavingsActionConfig(
  action: DepositToSavingsAction,
  context: ActionContext,
): ActionConfig {
  const { account, chainId } = context
  const tokenRepository = context.tokenRepository ?? raise('Tokens info is required for deposit to savings action')
  const actionPath = getSavingsDepositActionPath({
    token: action.token,
    savingsToken: action.savingsToken,
    tokenRepository,
    chainId,
  })

  return {
    getWriteConfig: () => {
      const { token, savingsToken } = action
      const assetsAmount = toBigInt(token.toBaseUnit(action.value))

      switch (actionPath) {
        case 'usds-to-susds':
          return ensureConfigTypes({
            address: savingsToken.address,
            abi: susdsAbi,
            functionName: 'deposit',
            args: [assetsAmount, account, SPARK_UI_REFERRAL_CODE],
          })
        case 'dai-to-sdai':
          return ensureConfigTypes({
            address: savingsToken.address,
            abi: erc4626Abi,
            functionName: 'deposit',
            args: [assetsAmount, account],
          })

        case 'usdc-to-susdc': {
          assert(
            context.savingsAccounts,
            'Savings account repository info is required for usdc deposit to savings action',
          )
          const savingsConverter = context.savingsAccounts.findOneBySavingsToken(savingsToken).converter

          const minAmountOut = toBigInt(
            savingsToken.toBaseUnit(
              calculateMinSharesAmountOut({
                savingsConverter,
                savingsToken,
                amountIn: action.value,
              }),
            ),
          )

          return ensureConfigTypes({
            address: savingsToken.address,
            abi: usdcVaultAbi,
            functionName: 'deposit',
            args: [assetsAmount, account, minAmountOut, SPARK_UI_REFERRAL_CODE],
          })
        }

        case 'base-usdc-to-susdc':
        case 'arbitrum-usdc-to-susdc': {
          assert(
            context.savingsAccounts,
            'Savings account repository info is required for usdc deposit to savings action',
          )
          const savingsConverter = context.savingsAccounts.findOneBySavingsToken(savingsToken).converter

          const minAmountOut = calculateMinSharesAmountOut({
            savingsConverter,
            savingsToken,
            amountIn: action.value,
          })
          const minAmountOutFormatted = formatMinAmountOutForPsm3({
            susds: savingsToken,
            susdsAmount: minAmountOut,
            assetIn: token,
          })

          return ensureConfigTypes({
            address: savingsToken.address,
            abi: usdcVaultAbi,
            functionName: 'deposit',
            args: [assetsAmount, account, minAmountOutFormatted, SPARK_UI_REFERRAL_CODE],
          })
        }

        case 'dai-to-susds':
          return ensureConfigTypes({
            address: getContractAddress(migrationActionsConfig.address, chainId),
            abi: migrationActionsConfig.abi,
            functionName: 'migrateDAIToSUSDS',
            args: [account, assetsAmount],
          })

        case 'usdc-to-susds':
          return getUsdcDepositConfig({
            psmActionsAddress: getContractAddress(usdsPsmActionsConfig.address, chainId),
            token,
            savingsToken,
            actionValue: action.value,
            account,
            assetsAmount,
          })

        case 'usdc-to-sdai':
          return getUsdcDepositConfig({
            psmActionsAddress: getContractAddress(psmActionsConfig.address, chainId),
            token,
            savingsToken,
            actionValue: action.value,
            account,
            assetsAmount,
          })

        case 'sexy-dai-to-sdai':
          return ensureConfigTypes({
            address: savingsXDaiAdapterAddress[gnosis.id],
            abi: savingsXDaiAdapterAbi,
            functionName: 'depositXDAI',
            args: [account],
            value: assetsAmount,
          })

        case 'base-usds-to-susds':
        case 'base-usdc-to-susds':
        case 'arbitrum-usds-to-susds':
        case 'arbitrum-usdc-to-susds': {
          assert(
            context.savingsAccounts,
            'Savings accounts repository is required for psm withdraw from savings action',
          )
          const savingsConverter = context.savingsAccounts.findOneBySavingsToken(savingsToken).converter

          const minAmountOut = calculateMinSharesAmountOut({
            savingsConverter,
            savingsToken,
            amountIn: action.value,
          })

          const minAmountOutFormatted = formatMinAmountOutForPsm3({
            susds: savingsToken,
            susdsAmount: minAmountOut,
            assetIn: token,
          })

          return ensureConfigTypes({
            address: getContractAddress(psm3Address, chainId),
            abi: psm3Abi,
            functionName: 'swapExactIn',
            args: [
              token.address,
              savingsToken.address,
              assetsAmount,
              minAmountOutFormatted,
              account,
              SPARK_UI_REFERRAL_CODE_BIGINT,
            ],
          })
        }

        default:
          assertNever(actionPath)
      }
    },

    invalidates: () => {
      const balancesQueryKeyPrefix = getBalancesQueryKeyPrefix({ chainId, account })
      function getAllowanceQueryKey(spender: CheckedAddress): QueryKey {
        return allowanceQueryKey({ token: action.token.address, spender, account, chainId })
      }

      switch (actionPath) {
        case 'sexy-dai-to-sdai':
          return [balancesQueryKeyPrefix]
        case 'usdc-to-sdai':
          return [balancesQueryKeyPrefix, getAllowanceQueryKey(getContractAddress(psmActionsConfig.address, chainId))]
        case 'usdc-to-susds':
          return [
            balancesQueryKeyPrefix,
            getAllowanceQueryKey(getContractAddress(usdsPsmActionsConfig.address, chainId)),
          ]
        case 'dai-to-susds':
          return [
            balancesQueryKeyPrefix,
            getAllowanceQueryKey(getContractAddress(migrationActionsConfig.address, chainId)),
          ]
        case 'dai-to-sdai':
        case 'usds-to-susds':
        case 'usdc-to-susdc':
        case 'base-usdc-to-susdc':
        case 'arbitrum-usdc-to-susdc':
          return [balancesQueryKeyPrefix, getAllowanceQueryKey(action.savingsToken.address)]

        case 'base-usds-to-susds':
        case 'base-usdc-to-susds':
        case 'arbitrum-usds-to-susds':
        case 'arbitrum-usdc-to-susds':
          return [balancesQueryKeyPrefix, getAllowanceQueryKey(getContractAddress(psm3Address, chainId))]

        default:
          assertNever(actionPath)
      }
    },

    onSuccessfulAction: () => {
      trackEvent(actionPath, {
        walletType: context.walletType,
        savingsToken: action.savingsToken.symbol,
        underlyingToken: action.token.symbol,
        amount: action.value.toNumber(),
        chainId,
      })
    },
  }
}

interface GetUsdcDepositConfigParams {
  psmActionsAddress: CheckedAddress
  token: Token
  savingsToken: Token
  actionValue: NormalizedUnitNumber
  account: Address
  assetsAmount: bigint
}

function getUsdcDepositConfig({
  psmActionsAddress,
  token,
  savingsToken,
  actionValue,
  account,
  assetsAmount,
}: GetUsdcDepositConfigParams): GetWriteConfigResult {
  const gemConversionFactor = calculateGemConversionFactor({
    gemDecimals: token.decimals,
    assetsTokenDecimals: savingsToken.decimals,
  })
  const assetsMinAmountOut = toBigInt(BaseUnitNumber(token.toBaseUnit(actionValue).multipliedBy(gemConversionFactor)))

  return ensureConfigTypes({
    address: psmActionsAddress,
    abi: psmActionsConfig.abi,
    functionName: 'swapAndDeposit',
    args: [account, assetsAmount, assetsMinAmountOut],
  })
}

interface CalculateMinSharesAmountOutParams {
  savingsConverter: SavingsConverter
  savingsToken: Token
  amountIn: NormalizedUnitNumber
}
function calculateMinSharesAmountOut({
  savingsConverter,
  amountIn,
}: CalculateMinSharesAmountOutParams): NormalizedUnitNumber {
  const currentTimestamp = savingsConverter.currentTimestamp
  // We don't know when the block with transaction will be mined so
  // we calculate the minimal amount of sUSDS to receive as the amount
  // the user would receive in 1 epoch (30 minutes)
  const minimalSharesAmount = savingsConverter.predictSharesAmount({
    assets: amountIn, // we pass NormalizedUnitNumber, so decimals don't matter
    timestamp: currentTimestamp + EPOCH_LENGTH,
  })

  return minimalSharesAmount
}
