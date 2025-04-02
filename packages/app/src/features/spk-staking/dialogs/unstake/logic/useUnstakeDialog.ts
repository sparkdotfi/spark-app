import { TokenWithBalance } from '@/domain/common/types'
import { useChainConfigEntry } from '@/domain/hooks/useChainConfigEntry'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { Token } from '@/domain/types/Token'
import { UnstakeSpkObjective } from '@/features/actions/flavours/unstake-spk/types'
import { Objective } from '@/features/actions/logic/types'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { useDebouncedFormValues } from '@/features/dialogs/common/logic/transfer-from-user/form'
import { FormFieldsForDialog, PageState, PageStatus } from '@/features/dialogs/common/types'
import { useSpkStakingData } from '@/features/spk-staking/logic/useSpkStakingData'
import { zodResolver } from '@hookform/resolvers/zod'
import { assert, CheckedAddress, NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { useAccount, useChainId, useConfig } from 'wagmi'
import { TxOverview, createTxOverview } from './createTxOverview'
import { getFormFieldsForUnstakeDialog } from './getFormFieldsForUnstakeDialog'
import { getUnstakeDialogFormValidator } from './validation'

export interface UseUnstakeDialogResult {
  selectableAssets: TokenWithBalance[]
  assetsFields: FormFieldsForDialog
  form: UseFormReturn<AssetInputSchema>
  objectives: Objective[]
  spk: Token
  staked: NormalizedUnitNumber
  pageStatus: PageStatus
  txOverview: TxOverview
}

export function useUnstakeDialog(): UseUnstakeDialogResult {
  const [pageStatus, setPageStatus] = useState<PageState>('form')
  const chainId = useChainId()
  const account = useAccount().address
  const wagmiConfig = useConfig()

  const { sparkToken: sparkTokenFeatureConfig } = useChainConfigEntry()
  assert(sparkTokenFeatureConfig, 'Spark token config should be defined')
  const { tokenRepository } = useTokenRepositoryForFeature({ featureGroup: 'sparkToken' })
  const spkWithBalance = tokenRepository.findOneTokenWithBalanceBySymbol(sparkTokenFeatureConfig.spkSymbol)

  const { spkStakingData } = useSpkStakingData({
    chainId,
    account: account && CheckedAddress(account),
    wagmiConfig,
    tokenRepository,
  })

  const form = useForm<AssetInputSchema>({
    resolver: zodResolver(getUnstakeDialogFormValidator({ stakedAmount: spkStakingData.amountStaked })),
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

  const objectives: UnstakeSpkObjective[] = [
    {
      type: 'unstakeSpk',
      spk: spkWithBalance.token,
      amount: formValues.value,
      accountActiveShares: spkWithBalance.token.toBaseUnit(spkStakingData.amountStaked),
      unstakeAll: formValues.isMaxSelected,
    },
  ]

  const txOverview = createTxOverview({
    apy: spkStakingData.generalStats.apr,
    amountStaked: spkStakingData.amountStaked,
    nextEpochEnd: Number(spkStakingData.nextEpochEnd),
    formValues,
  })

  const actionsEnabled = formValues.value.gt(0) && isFormValid && !isDebouncing

  const assetsFields = getFormFieldsForUnstakeDialog({
    form,
    tokenRepository,
    stakedAmount: spkStakingData.amountStaked,
  })

  return {
    spk: spkWithBalance.token,
    staked: formValues.value,
    selectableAssets: [spkWithBalance],
    assetsFields,
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
