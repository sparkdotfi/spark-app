import { NativeAssetInfo } from '@/config/chain/types'
import { TokenWithBalance } from '@/domain/common/types'
import { AaveData } from '@/domain/market-info/aave-data-layer/query'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { updatePositionSummary } from '@/domain/market-info/updatePositionSummary'
import {
  borrowValidationIssueToMessage,
  getValidateBorrowArgs,
  validateBorrow,
} from '@/domain/market-validators/validateBorrow'
import { depositValidationIssueToMessage, validateDeposit } from '@/domain/market-validators/validateDeposit'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { MarketWalletInfo } from '@/domain/wallet/useMarketWalletInfo'
import { NormalizedNumber, parseBigNumber } from '@sparkdotfi/common-universal'
import { z } from 'zod'
import { ExistingPosition } from '../types'
import { mapFormTokensToReserves } from './mapFormTokensToReserves'
import { normalizeFormValues } from './normalization'

const BaseAssetInputSchema = z.object({
  symbol: z.string().transform(TokenSymbol),
  value: z.string().refine(() => true), // @note makes types consistent between input schemas and allows empty strings
})

export const AssetInputSchema = BaseAssetInputSchema.extend({
  value: z
    .string()
    .min(1, { message: 'Value is required' }) // @todo improve error messages
    .refine(
      (data) => {
        const value = Number.parseFloat(data)
        return !Number.isNaN(value) && value > 0
      },
      {
        message: 'Value must be greater than zero',
      },
    ),
})

export type AssetInputSchema = z.infer<typeof AssetInputSchema>

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function getDepositFieldsValidator(
  walletInfo: MarketWalletInfo,
  alreadyDeposited: ExistingPosition,
  markets: MarketInfo,
) {
  const schema = alreadyDeposited.totalValueUSD.gt(0) ? BaseAssetInputSchema : AssetInputSchema
  return z.array(
    schema.superRefine((field, ctx) => {
      const value = NormalizedNumber(parseBigNumber(field.value, 0))
      const balance = walletInfo.findWalletBalanceForSymbol(field.symbol)
      const supplyingReserve = markets.findOneReserveBySymbol(field.symbol)

      const issue = validateDeposit({
        value,
        asset: {
          status: supplyingReserve.status,
          totalLiquidity: supplyingReserve.totalLiquidity,
          supplyCap: supplyingReserve.supplyCap,
        },
        user: { balance, alreadyDepositedValueUSD: alreadyDeposited.totalValueUSD },
      })
      if (issue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: depositValidationIssueToMessage[issue],
          path: ['value'],
        })
      }
    }),
  )
}

export interface GetEasyBorrowFormValidatorOptions {
  walletInfo: MarketWalletInfo
  marketInfo: MarketInfo
  formAssets: TokenWithBalance[]
  aaveData: AaveData
  guestMode: boolean
  alreadyDeposited: ExistingPosition
  nativeAssetInfo: NativeAssetInfo
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getEasyBorrowFormValidator({
  walletInfo,
  marketInfo,
  formAssets,
  aaveData,
  guestMode,
  alreadyDeposited,
  nativeAssetInfo,
}: GetEasyBorrowFormValidatorOptions) {
  return z
    .object({
      assetsToBorrow: z.array(AssetInputSchema),
      assetsToDeposit: guestMode
        ? z.array(AssetInputSchema)
        : getDepositFieldsValidator(walletInfo, alreadyDeposited, marketInfo),
    })
    .superRefine((data, ctx) => {
      const formValues = normalizeFormValues(data, formAssets)
      const { borrows, deposits } = mapFormTokensToReserves({
        formValues,
        marketInfo,
      })
      const updatedUserSummary = updatePositionSummary({
        borrows,
        deposits,
        marketInfo,
        aaveData,
        nativeAssetInfo,
      })
      const value = borrows[0]!.value
      const reserve = borrows[0]!.reserve

      const validationIssue = validateBorrow(getValidateBorrowArgs(value, reserve, marketInfo, updatedUserSummary))
      if (validationIssue) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: borrowValidationIssueToMessage[validationIssue],
          path: ['assetsToBorrow.0.value'],
        })
      }
    })
}

export type EasyBorrowFormSchema = z.infer<ReturnType<typeof getEasyBorrowFormValidator>>
