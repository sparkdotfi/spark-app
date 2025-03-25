import { CheckedAddress, Hex } from '@sparkdotfi/common-universal'
import { expect } from 'earl'
import { describe, it } from 'mocha'
import { parseGwei } from 'viem'
import { base } from 'viem/chains'
import { TestnetClient } from './TestnetClient.js'
import { createTestnetFactoriesForE2ETests } from './test-utils/index.js'

describe('TestnetClient', () => {
  const factories = createTestnetFactoriesForE2ETests()

  for (const factory of factories) {
    describe(`${factory.constructor.name} client`, () => {
      const expectedChainId = 2137
      let testnetClient: TestnetClient
      let cleanup: () => Promise<void>

      beforeEach(async () => {
        ;({ client: testnetClient, cleanup } = await factory.create({
          id: 'test',
          originChain: base,
          forkChainId: expectedChainId,
        }))
      })

      afterEach(async () => {
        await cleanup()
      })

      it('has correct chain id', async () => {
        expect(await testnetClient.getChainId()).toEqual(expectedChainId)

        expect(testnetClient.chain).toEqual({ ...base, id: expectedChainId })
      })

      it('setCode works correctly', async () => {
        const randomContract = CheckedAddress.random('contract')
        const newBytecode = Hex('0x123456')

        await testnetClient.setCode(randomContract, newBytecode)

        const actualCode = await testnetClient.getCode({ address: randomContract })
        expect(actualCode).toEqual(newBytecode)
      })

      it('sets next block base fee correctly', async () => {
        const baseFee = parseGwei('100')
        if (factory.constructor.name === 'TenderlyTestnetFactory') {
          await expect(testnetClient.setNextBlockBaseFee(baseFee)).toBeRejectedWith('Method not supported')
          return
        }

        await testnetClient.setNextBlockBaseFee(baseFee)
        await testnetClient.mineBlocks(1n)

        const nextBlock = await testnetClient.getBlock()
        const nextBaseFee = nextBlock.baseFeePerGas
        expect(nextBaseFee).toEqual(baseFee)
      })

      describe('baseline snapshots', () => {
        it('can create and revert to baseline snapshot', async () => {
          await testnetClient.baselineSnapshot()
          const currentBlockNumber = await testnetClient.getBlockNumber()
          await testnetClient.mineBlocks(1n)
          expect(await testnetClient.getBlockNumber()).toEqual(currentBlockNumber + 1n)

          await testnetClient.revertToBaseline()
          expect(await testnetClient.getBlockNumber()).toEqual(currentBlockNumber)
        })

        it('hasBaseline works', async () => {
          expect(testnetClient.hasBaselineSnapshot()).toEqual(false)

          await testnetClient.baselineSnapshot()
          expect(testnetClient.hasBaselineSnapshot()).toEqual(true)
        })
      })
    })
  }
})
