import { TokenWithBalance } from '@/domain/common/types'
import { useSavingsAccountRepository } from '@/domain/savings/useSavingsAccountRepository'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { Token } from '@/domain/types/Token'
import { InjectedActionsContext, Objective } from '@/features/actions/logic/types'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import {
  getFieldsForTransferFromUserForm,
  useDebouncedFormValues,
} from '@/features/dialogs/common/logic/transfer-from-user/form'
import { FormFieldsForDialog, PageState, PageStatus } from '@/features/dialogs/common/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { useChainId } from 'wagmi'
import { MigrateDialogTxOverview } from '../types'
import { createMigrateObjectives } from './createMigrateObjectives'
import { createTxOverview } from './createTxOverview'
import { getMigrateDialogFormValidator } from './validation'

export interface UseMigrateDialogParams {
  type: 'upgrade' | 'downgrade'
  fromToken: Token
  toToken: Token
}

export interface UseMigrateDialogResult {
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  pageStatus: PageStatus
  migrationAmount: NormalizedNumber
  actionsContext: InjectedActionsContext
  txOverview: MigrateDialogTxOverview
}

export function useMigrateDialog({ type, fromToken, toToken }: UseMigrateDialogParams): UseMigrateDialogResult {
  const chainId = useChainId()
  const [pageStatus, setPageStatus] = useState<PageState>('form')
  const { tokenRepository } = useTokenRepositoryForFeature({ chainId, featureGroup: 'savings' })
  const savingsAccounts = useSavingsAccountRepository({ chainId })
  const fromTokenWithBalance = tokenRepository.findOneTokenWithBalanceBySymbol(fromToken.symbol)

  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(getMigrateDialogFormValidator(tokenRepository)),
    defaultValues: {
      symbol: fromToken.symbol,
      value: type === 'downgrade' ? '' : fromTokenWithBalance.balance.toFixed(),
      isMaxSelected: type === 'upgrade',
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

  const objectives = createMigrateObjectives({ type, fromToken, toToken, amount: formValues.value })
  const actionsEnabled = formValues.value.gt(0) && isFormValid && !isDebouncing

  const txOverview = createTxOverview({
    formValues,
    savingsAccounts,
    tokenRepository,
    outputToken: toToken,
  })

  return {
    selectableAssets: [fromTokenWithBalance],
    assetsFields: getFieldsForTransferFromUserForm({ form, tokenRepository }),
    form,
    objectives,
    migrationAmount: formValues.value,
    actionsContext: {
      tokenRepository,
    },
    pageStatus: {
      actionsEnabled,
      state: pageStatus,
      goToSuccessScreen: () => setPageStatus('success'),
    },
    txOverview,
  }
}
