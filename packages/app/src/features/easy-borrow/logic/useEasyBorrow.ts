import { getChainConfigEntry } from '@/config/chain'
import { TokenWithValue } from '@/domain/common/types'
import { useConditionalFreeze } from '@/domain/hooks/useConditionalFreeze'
import { usePageChainId } from '@/domain/hooks/usePageChainId'
import { RiskAcknowledgementInfo } from '@/domain/liquidation-risk-warning/types'
import { useLiquidationRiskWarning } from '@/domain/liquidation-risk-warning/useLiquidationRiskWarning'
import { useAaveDataLayer } from '@/domain/market-info/aave-data-layer/useAaveDataLayer'
import { EPOCH_LENGTH } from '@/domain/market-info/consts'
import { LiquidationDetails } from '@/domain/market-info/getLiquidationDetails'
import { UserPositionSummary } from '@/domain/market-info/marketInfo'
import { updatePositionSummary } from '@/domain/market-info/updatePositionSummary'
import { useMarketInfo } from '@/domain/market-info/useMarketInfo'
import { useOpenDialog } from '@/domain/state/dialogs'
import { useTokenRepositoryForFeature } from '@/domain/token-repository/useTokenRepositoryForFeature'
import { useMarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { InjectedActionsContext, Objective } from '@/features/actions/logic/types'
import { sandboxDialogConfig } from '@/features/dialogs/sandbox/SandboxDialog'
import { zodResolver } from '@hookform/resolvers/zod'
import { assert, Percentage, raise } from '@sparkdotfi/common-universal'
import { useCallback, useEffect, useState } from 'react'
import { UseFormReturn, useForm } from 'react-hook-form'
import { useAccount } from 'wagmi'
import { getBorrowableAssets, getDepositableAssets, imputeNativeAsset, sortByDecreasingBalances } from './assets'
import {
  FormFieldsForAssetClass,
  getDefaultFormValues,
  setDesiredLoanToValue,
  useFormFieldsForAssetClass,
} from './form/form'
import { mapFormTokensToReserves } from './form/mapFormTokensToReserves'
import { normalizeFormValues } from './form/normalization'
import { EasyBorrowFormSchema, getEasyBorrowFormValidator } from './form/validation'
import { ExistingPosition, PageState, PageStatus } from './types'
import { useCreateObjectives } from './useCreateObjectives'
import { useLiquidationDetails } from './useLiquidationDetails'

export interface BorrowDetails {
  borrowRate: Percentage
}

export interface UseEasyBorrowResults {
  pageStatus: PageStatus
  form: UseFormReturn<EasyBorrowFormSchema>
  updatedPositionSummary: UserPositionSummary
  assetsToBorrowFields: FormFieldsForAssetClass
  assetsToDepositFields: FormFieldsForAssetClass
  setDesiredLoanToValue: (desiredLtv: Percentage) => void
  actions: Objective[]
  tokensToBorrow: TokenWithValue[]
  tokensToDeposit: TokenWithValue[]
  alreadyDeposited: ExistingPosition
  alreadyBorrowed: ExistingPosition
  liquidationDetails?: LiquidationDetails
  riskAcknowledgement: RiskAcknowledgementInfo
  borrowDetails: BorrowDetails
  guestMode: boolean
  openSandboxModal: () => void
  focusOnActionsPanel: (node: HTMLDivElement | null) => void
  actionsContext: InjectedActionsContext
}

export function useEasyBorrow(): UseEasyBorrowResults {
  const account = useAccount()
  const { chainId } = usePageChainId()
  const guestMode = !account.address
  const openDialog = useOpenDialog()
  const { aaveData } = useAaveDataLayer({ chainId })
  const { marketInfo } = useMarketInfo({ chainId })
  const { marketInfo: marketInfoIn1Epoch } = useMarketInfo({ timeAdvance: EPOCH_LENGTH, chainId })
  const { markets } = getChainConfigEntry(marketInfo.chainId)
  const { nativeAssetInfo, defaultAssetToBorrow } = markets ?? {}
  assert(nativeAssetInfo && defaultAssetToBorrow, 'nativeAssetInfo, defaultAssetToBorrow are required for easy borrow')
  const { tokenRepository } = useTokenRepositoryForFeature({ chainId, featureGroup: 'borrow' })
  const walletInfo = useMarketWalletInfo({ chainId })

  const [pageStatus, setPageStatus] = useState<PageState>('form')

  const userPositions = imputeNativeAsset(marketInfo, nativeAssetInfo)
  const alreadyDeposited = useConditionalFreeze(
    {
      tokens: userPositions
        .filter((position) => position.collateralBalance.gt(0))
        .filter((position) => position.reserve.usageAsCollateralEnabledOnUser)
        .map((position) => position.reserve.token),
      totalValueUSD: marketInfo.userPositionSummary.totalCollateralUSD,
    },
    pageStatus === 'confirmation',
  )
  const alreadyBorrowed = useConditionalFreeze(
    {
      tokens: userPositions
        .filter((position) => position.borrowBalance.gt(0))
        .map((position) => position.reserve.token),
      totalValueUSD: marketInfo.userPositionSummary.totalBorrowsUSD,
    },
    pageStatus === 'confirmation',
  )

  const depositableAssets = sortByDecreasingBalances(getDepositableAssets(userPositions, walletInfo))
  const borrowableAssets = getBorrowableAssets(marketInfo.reserves, walletInfo, chainId)
  const formAssets = [...depositableAssets, ...borrowableAssets]

  assert(depositableAssets.length > 0, 'No depositable assets')
  assert(borrowableAssets.length > 0, 'No borrowable assets')

  const easyBorrowForm = useForm<EasyBorrowFormSchema>({
    resolver: zodResolver(
      getEasyBorrowFormValidator({
        walletInfo,
        marketInfo,
        aaveData,
        formAssets,
        guestMode,
        alreadyDeposited,
        nativeAssetInfo,
      }),
    ),
    defaultValues: getDefaultFormValues(borrowableAssets, depositableAssets),
    mode: 'onChange',
  })
  const assetsToDepositFields = useFormFieldsForAssetClass({
    form: easyBorrowForm,
    marketInfo: marketInfoIn1Epoch, // because we calculate max values based on the future state
    assets: depositableAssets,
    walletInfo,
    type: 'deposit',
  })
  const assetsToBorrowFields = useFormFieldsForAssetClass({
    form: easyBorrowForm,
    marketInfo,
    assets: borrowableAssets,
    walletInfo,
    type: 'borrow',
  })
  const assetsToDepositFieldsFrozen = useConditionalFreeze(assetsToDepositFields, pageStatus === 'confirmation')
  const assetsToBorrowFieldsFrozen = useConditionalFreeze(assetsToBorrowFields, pageStatus === 'confirmation')

  const rawFormValues = easyBorrowForm.watch()
  const formValues = normalizeFormValues(rawFormValues, formAssets)
  const tokensToBorrow = formValues.borrows
  const tokensToDeposit = formValues.deposits.filter(({ value }) => value.gt(0))

  const actions = useCreateObjectives(formValues)

  const formValuesAsUnderlyingReserves = mapFormTokensToReserves({
    formValues,
    marketInfo,
  })
  const updatedUserSummary = useConditionalFreeze(
    updatePositionSummary({
      ...formValuesAsUnderlyingReserves,
      marketInfo,
      aaveData,
      nativeAssetInfo,
    }),
    pageStatus === 'confirmation',
  )

  const liquidationDetails = useLiquidationDetails({
    marketInfo,
    tokensToDeposit,
    tokensToBorrow: formValuesAsUnderlyingReserves.borrows.map((borrow) => ({
      token: borrow.reserve.token,
      value: borrow.value,
    })),
    liquidationThreshold: updatedUserSummary.currentLiquidationThreshold,
    freeze: pageStatus === 'confirmation',
  })

  const borrowDetails = {
    borrowRate: marketInfo.findOneReserveBySymbol(defaultAssetToBorrow).variableBorrowApy ?? raise('No borrow rate'),
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies:
  useEffect(
    function revalidateFormOnNetworkChange() {
      easyBorrowForm.trigger().catch(console.error)
    },
    [account.chainId],
  )

  const focusOnActionsPanel = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return
    }
    node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  function openSandboxModal(): void {
    openDialog(sandboxDialogConfig, { mode: 'ephemeral' } as const)
  }

  const { riskAcknowledgement, disableActionsByRisk } = useLiquidationRiskWarning({
    type: 'liquidation-warning-borrow',
    isFormValid: easyBorrowForm.formState.isValid,
    currentHealthFactor: marketInfo.userPositionSummary.healthFactor,
    updatedHealthFactor: updatedUserSummary.healthFactor,
  })

  return {
    form: easyBorrowForm,
    updatedPositionSummary: updatedUserSummary,
    assetsToDepositFields: assetsToDepositFieldsFrozen,
    assetsToBorrowFields: assetsToBorrowFieldsFrozen,
    setDesiredLoanToValue(desiredLtv: Percentage) {
      setDesiredLoanToValue({
        control: easyBorrowForm,
        formValues: formValuesAsUnderlyingReserves,
        userPositionSummary: updatedUserSummary,
        desiredLtv,
      })
    },
    pageStatus: {
      actionsEnabled: !disableActionsByRisk,
      state: pageStatus,
      onProceedToForm: () => setPageStatus('form'),
      goToSuccessScreen: () => setPageStatus('success'),
      submitForm: () => setPageStatus('confirmation'),
    },
    actions,
    tokensToBorrow,
    tokensToDeposit,
    alreadyDeposited,
    alreadyBorrowed,
    liquidationDetails,
    borrowDetails,
    guestMode,
    openSandboxModal,
    focusOnActionsPanel,
    riskAcknowledgement,
    actionsContext: {
      marketInfo,
      tokenRepository,
    },
  }
}
