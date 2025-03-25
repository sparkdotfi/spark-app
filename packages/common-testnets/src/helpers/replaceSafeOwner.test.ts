import { CheckedAddress } from '@sparkdotfi/common-universal'
import { expect } from 'earl'
import { mainnet } from 'viem/chains'
import { TestnetClient } from '../TestnetClient.js'
import { createTestnetFactoriesForE2ETests } from '../test-utils/index.js'
import { getSafeOwners, replaceSafeOwner } from './replaceSafeOwner.js'

describe(replaceSafeOwner.name, () => {
  // @note: this test could be run only against a single factory but since we don't have concrete tests for each testnet
  // client, I think this suite does a good job as a smoke test for them
  const factories = createTestnetFactoriesForE2ETests()

  for (const factory of factories) {
    describe(factory.constructor.name, () => {
      const safeAddress = CheckedAddress('0xc1704cccfe023257ea37f781630dc3bd4f44dccb') // L2BEAT safe, 3 owners
      let testnetClient: TestnetClient
      let cleanup: () => Promise<void>

      before(async () => {
        ;({ client: testnetClient, cleanup } = await factory.create({
          id: 'test',
          originChain: mainnet,
          forkChainId: 1,
          blockNumber: 21439277n,
        }))
        await testnetClient.baselineSnapshot()
      })
      after(async () => {
        await cleanup()
      })
      beforeEach(async () => {
        await testnetClient.revertToBaseline()
      })

      it('replaces first owner', async () => {
        const previousOwners = await getSafeOwners({
          client: testnetClient,
          safeAddress,
        })
        const newOwner = CheckedAddress.random('alice')

        await replaceSafeOwner({
          client: testnetClient,
          safeAddress,
          newOwner,
          indexToReplace: 0,
        })

        const owners = await getSafeOwners({
          client: testnetClient,
          safeAddress,
        })
        expect(owners).toEqual([newOwner, previousOwners[1]!, previousOwners[2]!])
      })

      it('replaces middle owner', async () => {
        const previousOwners = await getSafeOwners({
          client: testnetClient,
          safeAddress,
        })
        const newOwner = CheckedAddress.random('alice')

        await replaceSafeOwner({
          client: testnetClient,
          safeAddress,
          newOwner,
          indexToReplace: 1,
        })

        const owners = await getSafeOwners({
          client: testnetClient,
          safeAddress,
        })
        expect(owners).toEqual([previousOwners[0]!, newOwner, previousOwners[2]!])
      })

      it('replaces last owner', async () => {
        const previousOwners = await getSafeOwners({
          client: testnetClient,
          safeAddress,
        })
        const newOwner = CheckedAddress.random('alice')

        await replaceSafeOwner({
          client: testnetClient,
          safeAddress,
          newOwner,
          indexToReplace: 2,
        })

        const owners = await getSafeOwners({
          client: testnetClient,
          safeAddress,
        })
        expect(owners).toEqual([previousOwners[0]!, previousOwners[1]!, newOwner])
      })

      it('throws when attempting to replace not existing owner', async () => {
        await expect(() =>
          replaceSafeOwner({
            client: testnetClient,
            safeAddress,
            newOwner: CheckedAddress.random('alice'),
            indexToReplace: 3,
          }),
        ).toBeRejectedWith('Index to replace is out of bounds. Safe has only 3 owners.')
      })
    })
  }
})
