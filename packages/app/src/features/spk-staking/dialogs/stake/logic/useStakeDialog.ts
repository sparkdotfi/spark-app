import { TokenWithBalance } from '@/domain/common/types'
import { useChainConfigEntry } from '@/domain/hooks/useChainConfigEntry'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { Token } from '@/domain/types/Token'
import { StakeSpkObjective } from '@/features/actions/flavours/stake-spk/types'
import { Objective } from '@/features/actions/logic/types'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import {
  getFieldsForTransferFromUserForm,
  useDebouncedFormValues,
} from '@/features/dialogs/common/logic/transfer-from-user/form'
import { getTransferFromUserFormValidator } from '@/features/dialogs/common/logic/transfer-from-user/validation'
import { FormFieldsForDialog, PageState, PageStatus } from '@/features/dialogs/common/types'
import { SpkStakingEpochs } from '@/features/spk-staking/types'
import { useTimestamp } from '@/utils/useTimestamp'
import { zodResolver } from '@hookform/resolvers/zod'
import { assert, NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { TxOverview, createTxOverview } from './createTxOverview'
import { validationIssueToMessage } from './validation'

export interface UseStakeDialogResult {
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  spk: Token
  staked: NormalizedUnitNumber
  pageStatus: PageStatus
  txOverview: TxOverview
}

export interface UseStakeDialogParams {
  apy: Percentage
  spkStakingEpochs: SpkStakingEpochs
}

export function useStakeDialog({ apy, spkStakingEpochs }: UseStakeDialogParams): UseStakeDialogResult {
  const { timestamp } = useTimestamp()
  const [pageStatus, setPageStatus] = useState<PageState>('form')
  const { sparkToken: sparkTokenFeatureConfig } = useChainConfigEntry()
  assert(sparkTokenFeatureConfig, 'Spark token config should be defined')
  const { tokenRepository } = useTokenRepositoryForFeature({ featureGroup: 'sparkToken' })

  const spkWithBalance = tokenRepository.findOneTokenWithBalanceBySymbol(sparkTokenFeatureConfig.spkSymbol)
  const usds = tokenRepository.findOneTokenBySymbol(sparkTokenFeatureConfig.usdsSymbol)

  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(getTransferFromUserFormValidator(tokenRepository, validationIssueToMessage)),
    defaultValues: {
      symbol: spkWithBalance.token.symbol,
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

  const objectives: StakeSpkObjective[] = [
    {
      type: 'stakeSpk',
      spk: spkWithBalance.token,
      amount: formValues.value,
    },
  ]

  const txOverview = createTxOverview({
    apy,
    usds,
    timestamp,
    spkStakingEpochs,
    formValues,
  })

  const actionsEnabled = formValues.value.gt(0) && isFormValid && !isDebouncing

  return {
    spk: spkWithBalance.token,
    staked: formValues.value,
    selectableAssets: [spkWithBalance],
    assetsFields: getFieldsForTransferFromUserForm({ form, tokenRepository }),
    form,
    objectives,
    txOverview,
    pageStatus: {
      state: pageStatus,
      actionsEnabled,
      goToSuccessScreen: () => setPageStatus('success'),
    },
  }
}
