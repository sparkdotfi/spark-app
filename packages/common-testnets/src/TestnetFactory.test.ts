import { CheckedAddress, Hex } from '@marsfoundation/common-universal'
import { expect } from 'earl'
import { after, before, describe, it } from 'mocha'
import { parseGwei } from 'viem'
import { base, mainnet } from 'viem/chains'
import { TestnetClient } from './TestnetClient.js'
import { createTestnetFactoriesForE2ETests } from './test-utils/index.js'

describe('TestnetFactory', () => {
  const factories = createTestnetFactoriesForE2ETests()

  for (const factory of factories) {
    describe(factory.constructor.name, () => {
      const expectedChainId = 2137

      describe('With block specified', () => {
        let testnetClient: TestnetClient
        let cleanup: () => Promise<void>
        const blockNumber = 21378357n
        const expectedTimestamp = 1733909123n + 2n

        before(async () => {
          ;({ client: testnetClient, cleanup } = await factory.create({
            id: 'test',
            originChain: mainnet,
            forkChainId: expectedChainId,
            blockNumber,
          }))
        })

        after(async () => {
          await cleanup()
        })

        it('creates a testnet with desired block', async () => {
          const currentBlockNumber = await testnetClient.getBlockNumber()

          expect(currentBlockNumber).toEqual(blockNumber + 2n)
        })

        it('creates a testnet with desired timestamp', async () => {
          const currentBlockNumber = await testnetClient.getBlockNumber()
          const currentBlock = await testnetClient.getBlock({ blockNumber: currentBlockNumber })

          expect(currentBlock.timestamp).toEqual(expectedTimestamp)
        })

        it('creates a testnet with desired chainId', async () => {
          const chainId = await testnetClient.getChainId()

          expect(chainId).toEqual(expectedChainId)
        })

        it('contains tx from a top of the forked blockchain', async () => {
          const receipt = await testnetClient.getTransactionReceipt({
            hash: '0x3c66f14cafc6b806538d97953be5bf4775be4f851448e937a612007c9e207c37',
          })

          expect(receipt).toEqual(
            expect.subset({
              status: 'success',
            }),
          )
        })

        it('does not contain tx from future block', async () => {
          await expect(
            testnetClient.getTransactionReceipt({
              hash: '0x7057abf025862e54cb1c33b4f4d4e6f8793383098abb84e58a85d1f10d14b765',
            }),
          ).toBeRejectedWith('The Transaction may not be processed on a block yet.')
        })
      })

      describe('Without block specified', () => {
        let testnetClient: TestnetClient
        let cleanup: () => Promise<void>

        before(async () => {
          ;({ client: testnetClient, cleanup } = await factory.create({
            id: 'test',
            originChain: mainnet,
            forkChainId: expectedChainId,
          }))
        })
        after(async () => {
          await cleanup()
        })

        it('can fetch block number', async () => {
          const currentBlockNumber = await testnetClient.getBlockNumber()
          expect(currentBlockNumber).toBeGreaterThan(21385842n)
        })
      })

      describe('client', () => {
        let testnetClient: TestnetClient
        let cleanup: () => Promise<void>

        before(async () => {
          ;({ client: testnetClient, cleanup } = await factory.create({
            id: 'test',
            originChain: base,
            forkChainId: expectedChainId,
          }))
        })
        after(async () => {
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
      })
    })
  }
})
