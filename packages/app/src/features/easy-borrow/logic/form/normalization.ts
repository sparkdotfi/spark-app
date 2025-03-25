import { TokenWithBalance, TokenWithValue } from '@/domain/common/types'
import { NormalizedUnitNumber, raise } from '@sparkdotfi/common-universal'
import { EasyBorrowFormNormalizedData } from '../types'
import type { AssetInputSchema, EasyBorrowFormSchema } from './validation'

export function normalizeFormValues(
  values: EasyBorrowFormSchema,
  formAssets: TokenWithBalance[],
): EasyBorrowFormNormalizedData {
  function normalizeAsset(asset: AssetInputSchema): TokenWithValue {
    const { token } = formAssets.find(({ token }) => token.symbol === asset.symbol) ?? raise('Asset not found')
    return {
      token,
      value: NormalizedUnitNumber(asset.value === '' ? '0' : asset.value),
    }
  }

  return {
    borrows: values.assetsToBorrow.map(normalizeAsset),
    deposits: values.assetsToDeposit.map(normalizeAsset),
  }
}
