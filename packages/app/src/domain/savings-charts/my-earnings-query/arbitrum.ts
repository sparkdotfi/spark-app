import { queryOptions } from '@tanstack/react-query'

import { CheckedAddress } from '@sparkdotfi/common-universal'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { arbitrum } from 'viem/chains'
import { Psm3MyEarningsDataResponseSchema, psm3SavingsMyEarningsQueryOptions } from './psm3-savings'
import { MyEarningsResult } from './types'

function susdsSelectQuery(data: Psm3MyEarningsDataResponseSchema): MyEarningsResult {
  return data.map(({ date, balance }) => ({ date, balance: balance ?? NormalizedUnitNumber(0) }))
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function arbitrumSusdsMyEarningsQueryOptions(wallet: CheckedAddress) {
  return queryOptions({
    ...psm3SavingsMyEarningsQueryOptions(wallet, arbitrum.id),
    select: susdsSelectQuery,
  })
}

function arbitrumSusdcSelectQuery(data: Psm3MyEarningsDataResponseSchema): MyEarningsResult {
  return data.map(({ date, susdcBalance }) => ({ date, balance: susdcBalance ?? NormalizedUnitNumber(0) }))
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function arbitrumSusdcMyEarningsQueryOptions(wallet: CheckedAddress) {
  return queryOptions({
    ...psm3SavingsMyEarningsQueryOptions(wallet, arbitrum.id),
    select: arbitrumSusdcSelectQuery,
  })
}
