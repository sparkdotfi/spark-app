import { formatGwei } from 'viem'

import { toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedNumber } from '@sparkdotfi/common-universal'

export function formatGasPrice(gasPrice: NormalizedNumber): string {
  const formattedGwei = formatGwei(toBigInt(gasPrice.toBaseUnit(18)))
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  })
  return formatter.format(Number(formattedGwei))
}
