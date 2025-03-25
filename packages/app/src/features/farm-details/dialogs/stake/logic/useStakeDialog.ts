import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { Farm } from '@/domain/farms/types'
import { useFarmsInfo } from '@/domain/farms/useFarmsInfo'
import { useSavingsAccountRepository } from '@/domain/savings/useSavingsAccountRepository'
import { Token } from '@/domain/types/Token'
import { StakeObjective } from '@/features/actions/flavours/stake/types'
import { InjectedActionsContext, Objective } from '@/features/actions/logic/types'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import {
  getFieldsForTransferFromUserForm,
  useDebouncedFormValues,
} from '@/features/dialogs/common/logic/transfer-from-user/form'
import { getTransferFromUserFormValidator } from '@/features/dialogs/common/logic/transfer-from-user/validation'
import { FormFieldsForDialog, PageState, PageStatus } from '@/features/dialogs/common/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { assert, NormalizedUnitNumber, raise } from '@sparkdotfi/common-universal'
import { useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { useChainId } from 'wagmi'
import { TxOverview, createTxOverview } from './createTxOverview'
import { useFarmEntryTokens } from './useFarmEntryTokens'
import { validationIssueToMessage } from './validation'

export interface UseStakeDialogParams {
  farm: Farm
  initialToken: Token
}

export interface UseStakeDialogResult {
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  stakedToken: TokenWithValue
  sacrificesYield: boolean
  pageStatus: PageStatus
  txOverview: TxOverview
  actionsContext: InjectedActionsContext
}

export function useStakeDialog({ farm, initialToken }: UseStakeDialogParams): UseStakeDialogResult {
  const chainId = useChainId()
  const [pageStatus, setPageStatus] = useState<PageState>('form')
  const { farmsInfo } = useFarmsInfo({ chainId })
  const { tokenRepository, entryTokens } = useFarmEntryTokens(farm)
  assert(entryTokens[0], 'There should be at least one entry token')
  const savingsAccounts = useSavingsAccountRepository({ chainId })

  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(getTransferFromUserFormValidator(tokenRepository, validationIssueToMessage)),
    defaultValues: {
      symbol: initialToken.symbol,
      value: '',
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

  const objectives: StakeObjective[] = [
    {
      type: 'stake',
      amount: formValues.value,
      token: formValues.token,
      farm: farm.address,
    },
  ]

  const txOverview = createTxOverview({
    farm,
    formValues,
  })

  const sacrificesYield =
    formValues.token.symbol === tokenRepository.sDAI?.symbol ||
    formValues.token.symbol === tokenRepository.sUSDS?.symbol

  const stakingTokenRouteItem =
    txOverview.status === 'success'
      ? (txOverview.routeToStakingToken.at(-1) ?? raise('Route should be defined'))
      : undefined
  const stakedToken = {
    token: farm.stakingToken,
    value: stakingTokenRouteItem?.value ?? NormalizedUnitNumber(0),
  }

  const actionsEnabled = formValues.value.gt(0) && isFormValid && !isDebouncing

  return {
    selectableAssets: entryTokens,
    assetsFields: getFieldsForTransferFromUserForm({ form, tokenRepository }),
    form,
    objectives,
    stakedToken,
    sacrificesYield,
    txOverview,
    pageStatus: {
      state: pageStatus,
      actionsEnabled,
      goToSuccessScreen: () => setPageStatus('success'),
    },
    actionsContext: {
      tokenRepository,
      farmsInfo,
      savingsAccounts,
    },
  }
}
