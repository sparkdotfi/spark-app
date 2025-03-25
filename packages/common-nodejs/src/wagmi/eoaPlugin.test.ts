import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Plugin } from '@wagmi/cli'
import { expect } from 'earl'
import { zeroAddress } from 'viem'
import { base, mainnet } from 'viem/chains'
import { eoa } from './eoaPlugin.js'

describe(eoa.name, () => {
  const firstAddress = CheckedAddress.random('first')
  const secondAddress = CheckedAddress.random('second')

  it('returns record with single address', async () => {
    const plugin = eoa({
      someEoa: {
        [mainnet.id]: CheckedAddress(zeroAddress),
      },
    })

    const result = await plugin.run?.(testRunConfig)
    const lines = ['export const someEoaAddress = {', `  1: '${zeroAddress}',`, '} as const'].join('\n')
    expect(result?.content).toEqual(lines)
  })

  it('returns multiple records with multiple addresses', async () => {
    const plugin = eoa({
      firstEoa: {
        [mainnet.id]: CheckedAddress(zeroAddress),
        [base.id]: CheckedAddress(firstAddress),
      },
      secondEoa: {
        [mainnet.id]: CheckedAddress(firstAddress),
        [base.id]: CheckedAddress(secondAddress),
      },
    })

    const result = await plugin.run?.(testRunConfig)
    const lines = [
      'export const firstEoaAddress = {',
      `  1: '${zeroAddress}',`,
      `  8453: '${firstAddress}',`,
      '} as const',
      'export const secondEoaAddress = {',
      `  1: '${firstAddress}',`,
      `  8453: '${secondAddress}',`,
      '} as const',
    ].join('\n')
    expect(result?.content).toEqual(lines)
  })

  it('throws if the name is invalid', async () => {
    const plugin = eoa({
      '12345someEoa': {
        [mainnet.id]: CheckedAddress(zeroAddress),
      },
    })

    const promisedResult = plugin.run?.(testRunConfig)
    await expect(async () => promisedResult).toBeRejectedWith('Invalid name: 12345someEoa')
  })
})

const testRunConfig: Parameters<Required<Plugin>['run']>[0] = {
  contracts: [],
  outputs: [],
  isTypeScript: true,
}
