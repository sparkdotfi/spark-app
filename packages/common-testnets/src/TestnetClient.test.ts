import { CheckedAddress, Hash, Hex } from '@marsfoundation/common-universal'
import { expect, mockFn } from 'earl'
import { describe, it } from 'mocha'
import { parseGwei } from 'viem'
import { base } from 'viem/chains'
import { OnTransactionHandler } from './TestnetFactory.js'
import { createTestnetFactoriesForE2ETests } from './test-utils/index.js'

describe('TestnetClient', () => {
  const factories = createTestnetFactoriesForE2ETests()

  for (const factory of factories) {
    describe(`${factory.constructor.name} client`, () => {
      it('has correct chain id', async () => {
        await using testnet = await factory.create(defaults)

        expect(await testnet.client.getChainId()).toEqual(expectedChainId)
        expect(testnet.client.chain).toEqual({ ...base, id: expectedChainId })
      })

      it('setCode works correctly', async () => {
        await using testnet = await factory.create(defaults)
        const randomContract = CheckedAddress.random('contract')
        const newBytecode = Hex('0x123456')

        await testnet.client.setCode(randomContract, newBytecode)

        const actualCode = await testnet.client.getCode({ address: randomContract })
        expect(actualCode).toEqual(newBytecode)
      })

      it('sets next block base fee correctly', async () => {
        await using testnet = await factory.create(defaults)

        const baseFee = parseGwei('100')
        if (factory.constructor.name === 'TenderlyTestnetFactory') {
          await expect(testnet.client.setNextBlockBaseFee(baseFee)).toBeRejectedWith('Method not supported')
          return
        }

        await testnet.client.setNextBlockBaseFee(baseFee)
        await testnet.client.mineBlocks(1n)

        const nextBlock = await testnet.client.getBlock()
        const nextBaseFee = nextBlock.baseFeePerGas
        expect(nextBaseFee).toEqual(baseFee)
      })

      describe('baseline snapshots', () => {
        it('can create and revert to baseline snapshot', async () => {
          await using testnet = await factory.create(defaults)

          await testnet.client.baselineSnapshot()
          const currentBlockNumber = await testnet.client.getBlockNumber()
          await testnet.client.mineBlocks(1n)
          expect(await testnet.client.getBlockNumber()).toEqual(currentBlockNumber + 1n)

          await testnet.client.revertToBaseline()
          expect(await testnet.client.getBlockNumber()).toEqual(currentBlockNumber)
        })

        it('hasBaseline works', async () => {
          await using testnet = await factory.create(defaults)

          expect(testnet.client.hasBaselineSnapshot()).toEqual(false)

          await testnet.client.baselineSnapshot()
          expect(testnet.client.hasBaselineSnapshot()).toEqual(true)
        })
      })

      describe('setStorage', () => {
        it('sets storage', async () => {
          await using testnet = await factory.create(defaults)

          const account = CheckedAddress.random()
          const storageSlot = Hash.random('slot')

          await testnet.client.setStorageAt(
            account,
            storageSlot,
            '0x000000000000000000000000000000000000000000000000000000000000002a',
          )

          const value = await testnet.client.getStorageAt({ address: account, slot: storageSlot })
          expect(value).toEqual('0x000000000000000000000000000000000000000000000000000000000000002a')
        })

        // @note: tenderly always mines a new block so be consistent, anvil does too
        it('mines a new block', async () => {
          await using testnet = await factory.create(defaults)

          const startingBlock = await testnet.client.getBlockNumber()
          const account = CheckedAddress.random()
          const storageSlot = Hash.random('slot')

          await testnet.client.setStorageAt(
            account,
            storageSlot,
            '0x000000000000000000000000000000000000000000000000000000000000002a',
          )

          const actualBlock = await testnet.client.getBlockNumber()
          expect(actualBlock).toEqual(startingBlock + 1n)
        })

        it('calls post tx hook', async () => {
          const onTransaction = mockFn<OnTransactionHandler>(async () => {})
          await using testnet = await factory.create({ ...defaults, onTransaction })

          const account = CheckedAddress.random()
          const storageSlot = Hash.random('slot')

          await testnet.client.setStorageAt(
            account,
            storageSlot,
            '0x000000000000000000000000000000000000000000000000000000000000002a',
          )

          expect(onTransaction).toHaveBeenOnlyCalledWith({
            forkChainId: expectedChainId,
          })
        })
      })
    })
  }
})

const expectedChainId = 2137
const defaults = {
  id: 'test',
  originChain: base,
  forkChainId: expectedChainId,
}
