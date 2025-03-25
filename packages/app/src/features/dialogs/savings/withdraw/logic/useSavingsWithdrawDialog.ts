import { getChainConfigEntry } from '@/config/chain'
import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { useConditionalFreeze } from '@/domain/hooks/useConditionalFreeze'
import { useSavingsAccountRepository } from '@/domain/savings/useSavingsAccountRepository'
import { useSavingsTimestamps } from '@/domain/savings/useSavingsTimestamps'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { InjectedActionsContext, Objective } from '@/features/actions/logic/types'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { useDebouncedFormValues } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { FormFieldsForDialog, PageState, PageStatus } from '@/features/dialogs/common/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { raise } from '@sparkdotfi/common-universal'
import { useEffect, useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { useChainId } from 'wagmi'
import { SavingsDialogTxOverview } from '../../common/types'
import { Mode, SendModeExtension } from '../types'
import { createObjectives } from './createObjectives'
import { createTxOverview } from './createTxOverview'
import { getFormFieldsForWithdrawDialog } from './getFormFieldsForWithdrawDialog'
import { useSendModeExtension } from './useSendModeExtension'
import { useWithdrawFromSavingsValidator } from './useWithdrawFromSavingsValidator'

export interface UseSavingsWithdrawDialogParams {
  mode: Mode
  savingsToken: Token
}

export interface UseSavingsWithdrawDialogResults {
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  tokenToWithdraw: TokenWithValue
  pageStatus: PageStatus
  txOverview: SavingsDialogTxOverview
  actionsContext: InjectedActionsContext
  underlyingToken: Token
  sendModeExtension?: SendModeExtension
}

export function useSavingsWithdrawDialog({
  mode,
  savingsToken,
}: UseSavingsWithdrawDialogParams): UseSavingsWithdrawDialogResults {
  const chainId = useChainId()
  const { uiTimestamp, simulationTimestamp, refresh, isFetching } = useSavingsTimestamps({ chainId })

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    refresh()
  }, [refresh, chainId])

  const savingsAccounts = useSavingsAccountRepository({ chainId, timestamp: uiTimestamp })
  const simulationSavingsAccounts = useSavingsAccountRepository({ chainId, timestamp: simulationTimestamp })

  const chainConfig = getChainConfigEntry(chainId)
  const { tokenRepository } = useTokenRepositoryForFeature({ chainId, featureGroup: 'savings' })
  const selectedAccountConfig =
    chainConfig.savings?.accounts?.find((account) => account.savingsToken === savingsToken.symbol) ??
    raise('Savings account is not found')
  const selectedAccount = savingsAccounts.findOneBySavingsToken(savingsToken)
  const supportedStablecoins = selectedAccountConfig.supportedStablecoins.map((symbol) =>
    tokenRepository.findOneTokenWithBalanceBySymbol(symbol),
  )
  const [pageState, setPageState] = useState<PageState>('form')
  const sendModeExtension = useSendModeExtension({ mode, tokenRepository })
  const savingsTokenWithBalance = tokenRepository.findOneTokenWithBalanceBySymbol(savingsToken.symbol)

  const validator = useWithdrawFromSavingsValidator({
    chainId,
    tokenRepository,
    savingsToken: savingsTokenWithBalance.token,
    savingsTokenBalance: savingsTokenWithBalance.balance,
    savingsConverter: selectedAccount.converter,
  })
  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(validator),
    defaultValues: {
      symbol: selectedAccount.underlyingToken.symbol,
      value: '',
      isMaxSelected: false,
    },
    mode: 'onChange',
  })

  const {
    debouncedFormValues: formValues,
    isDebouncing,
    isFormValid,
  } = useDebouncedFormValues({
    form,
    tokenRepository,
  })

  const objectives = createObjectives({
    formValues,
    receiver: sendModeExtension?.receiver,
    mode,
    savingsTokenWithBalance,
  })
  const txOverview = createTxOverview({
    formValues,
    savingsTokenBalance: savingsTokenWithBalance.balance,
    savingsAccount: savingsAccounts.findOneBySavingsToken(savingsTokenWithBalance.token),
  })

  const tokenToWithdraw = useConditionalFreeze<TokenWithValue>(
    {
      token: formValues.token,
      value: txOverview.status === 'success' ? txOverview.outTokenAmount : formValues.value,
    },
    pageState === 'success',
  )

  const actionsEnabled =
    ((formValues.value.gt(0) && isFormValid) || formValues.isMaxSelected) &&
    !isDebouncing &&
    (sendModeExtension?.enableActions ?? true) &&
    !isFetching

  return {
    selectableAssets: filterInputTokens({ inputTokens: supportedStablecoins, savingsToken, tokenRepository }),
    assetsFields: getFormFieldsForWithdrawDialog({
      form,
      tokenRepository,
      savingsConverter: selectedAccount.converter,
      savingsTokenBalance: savingsTokenWithBalance.balance,
    }),
    form,
    objectives,
    tokenToWithdraw,
    pageStatus: {
      state: pageState,
      actionsEnabled,
      goToSuccessScreen: () => setPageState('success'),
    },
    txOverview,
    actionsContext: {
      tokenRepository,
      savingsAccounts: simulationSavingsAccounts,
    },
    sendModeExtension,
    underlyingToken: selectedAccount.underlyingToken,
  }
}

interface FilterInputTokensParams {
  inputTokens: TokenWithBalance[]
  savingsToken: Token
  tokenRepository: TokenRepository
}
function filterInputTokens({
  inputTokens,
  savingsToken,
  tokenRepository,
}: FilterInputTokensParams): TokenWithBalance[] {
  if (savingsToken.symbol === TokenSymbol('sDAI')) {
    return inputTokens
  }

  return inputTokens.filter(({ token }) => [tokenRepository.USDS?.symbol, TokenSymbol('USDC')].includes(token.symbol))
}
