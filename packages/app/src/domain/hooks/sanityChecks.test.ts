import { testAddresses } from '@/test/integration/constants'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { zeroAddress } from 'viem'
import { gnosis, mainnet } from 'viem/chains'
import { sanityCheckTx } from './sanityChecks'

describe(sanityCheckTx.name, () => {
  it('throws when address is on a black list', () => {
    expect(() => sanityCheckTx({ address: CheckedAddress.EEEE(), value: 0n }, mainnet.id)).toThrow('Cannot interact')
    expect(() => sanityCheckTx({ address: zeroAddress, value: 0n }, mainnet.id)).toThrow('Cannot interact')
  })

  it('throws when sending native asset to non-gateway contract', () => {
    expect(() => sanityCheckTx({ address: testAddresses.alice, value: 1n }, mainnet.id)).toThrow(
      'Sending the native asset ',
    )
    expect(() => sanityCheckTx({ address: testAddresses.alice, value: 1n }, gnosis.id)).not.toThrow()
  })
})
