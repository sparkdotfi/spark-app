import { getDepositMaxValue } from '@/domain/action-max-value-getters/getDepositMaxValue'
import { formFormat } from '@/domain/common/format'
import { ReserveWithValue, TokenWithBalance } from '@/domain/common/types'
import { MarketInfo, UserPositionSummary } from '@/domain/market-info/marketInfo'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { MarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { EasyBorrowFormSchema } from './validation'

export function getDefaultFormValues(
  borrowableAssets: TokenWithBalance[],
  depositableAssets: TokenWithBalance[],
): EasyBorrowFormSchema {
  // @todo apply better algorithm to select default assets, take into account balances etc
  const defaultBorrowableAsset = borrowableAssets[0]!
  const defaultDepositableAsset = depositableAssets[0]!

  return {
    assetsToBorrow: [{ symbol: defaultBorrowableAsset.token.symbol, value: '' }],
    assetsToDeposit: [{ symbol: defaultDepositableAsset.token.symbol, value: '' }],
  }
}

export interface FormFieldsForAssetClass {
  selectedAssets: TokenWithBalance[]
  assets: TokenWithBalance[]
  assetToMaxValue: Record<TokenSymbol, NormalizedNumber>
  changeAsset: (index: number, newSymbol: TokenSymbol) => void
  addAsset: () => void
  removeAsset: (index: number) => void
  maxSelectedFieldName?: string
}

export interface UseFormFieldsForAssetClassArgs {
  form: UseFormReturn<EasyBorrowFormSchema>
  marketInfo: MarketInfo
  assets: TokenWithBalance[]
  walletInfo: MarketWalletInfo
  type: 'borrow' | 'deposit'
}
export function useFormFieldsForAssetClass({
  form,
  marketInfo,
  assets,
  walletInfo,
  type,
}: UseFormFieldsForAssetClassArgs): FormFieldsForAssetClass {
  const { append, remove } = useFieldArray({
    control: form.control,
    name: getFormKeyBasedOnType(type),
  })
  const fields = form.getValues(getFormKeyBasedOnType(type))

  const tokensToPickFrom = assets.filter(({ token }) => !fields.some((f) => f.symbol === token.symbol))

  const selectedAssets = fields.map(
    (field): TokenWithBalance => assets.find(({ token }) => token.symbol === field.symbol)!,
  )

  // eslint-disable-next-line func-style
  const changeAsset = (index: number, newSymbol: TokenSymbol): void => {
    form.setValue(
      `${getFormKeyBasedOnType(type)}.${index}`,
      { symbol: newSymbol, value: '' },
      {
        shouldValidate: false,
      },
    )
  }

  const assetToMaxValue =
    type === 'borrow'
      ? {}
      : selectedAssets.reduce(
          (acc, asset) => {
            const position = marketInfo.findOnePositionBySymbol(asset.token.symbol)
            const maxValue = getDepositMaxValue({
              asset: {
                status: position.reserve.status,
                totalLiquidity: position.reserve.totalLiquidity,
                isNativeAsset: marketInfo.nativeAssetInfo.nativeAssetSymbol === asset.token.symbol,
                supplyCap: position.reserve.supplyCap,
              },
              user: {
                balance: walletInfo.findWalletBalanceForSymbol(asset.token.symbol),
              },
              chain: {
                minRemainingNativeAsset: marketInfo.nativeAssetInfo.minRemainingNativeAssetBalance,
              },
            })
            acc[asset.token.symbol] = maxValue
            return acc
          },
          {} as Record<TokenSymbol, NormalizedNumber>,
        )

  // eslint-disable-next-line func-style
  const addAsset = (): void => {
    if (tokensToPickFrom.length > 0) {
      const { token } = tokensToPickFrom[0]!
      append({ symbol: token.symbol, value: '' })
    }
  }

  return {
    selectedAssets,
    assets,
    assetToMaxValue,
    changeAsset,
    addAsset,
    removeAsset: remove,
    maxSelectedFieldName: type === 'deposit' ? 'isMaxSelected' : undefined,
  }
}

function getFormKeyBasedOnType(type: 'borrow' | 'deposit'): 'assetsToBorrow' | 'assetsToDeposit' {
  return type === 'borrow' ? 'assetsToBorrow' : 'assetsToDeposit'
}

interface SetDesiredLoanToValueProps {
  control: UseFormReturn<EasyBorrowFormSchema>
  formValues: { borrows: ReserveWithValue[] }
  userPositionSummary: UserPositionSummary
  desiredLtv: Percentage
}

export function setDesiredLoanToValue({
  control,
  formValues,
  userPositionSummary,
  desiredLtv,
}: SetDesiredLoanToValueProps): void {
  const borrowedAsset = formValues.borrows[0]!
  const toAdd = userPositionSummary.totalCollateralUSD
    .times(NormalizedNumber(desiredLtv))
    .minus(userPositionSummary.totalBorrowsUSD)
    .div(NormalizedNumber(borrowedAsset.reserve.priceInUSD))

  const current = borrowedAsset.value
  const result = current.plus(toAdd)

  const newBorrowedAssetUnit = BigNumber.max(0, formFormat(result))

  control.setValue('assetsToBorrow.0.value', newBorrowedAssetUnit.toFixed(), {
    shouldValidate: true,
    shouldTouch: true,
  })
}
