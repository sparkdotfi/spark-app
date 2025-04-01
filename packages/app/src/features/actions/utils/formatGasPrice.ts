import { formatGwei } from 'viem'

import { toBigInt } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

export function formatGasPrice(gasPrice: NormalizedUnitNumber): string {
  const formattedGwei = formatGwei(toBigInt(gasPrice.toBaseUnit(18)))
  const formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  })
  return formatter.format(Number(formattedGwei))
}
