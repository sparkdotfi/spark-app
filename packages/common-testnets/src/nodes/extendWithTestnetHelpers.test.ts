import { CheckedAddress } from '@sparkdotfi/common-universal'
import { expect, mockFn } from 'earl'
import { encodeFunctionData, erc20Abi, parseEther } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { mainnet } from 'viem/chains'
import { TestnetClient } from '../TestnetClient.js'
import { OnBlockHandler } from '../TestnetFactory.js'
import { createTestnetFactoriesForE2ETests } from '../test-utils/index.js'
import { extendWithTestnetHelpers } from './extendWithTestnetHelpers.js'

describe(extendWithTestnetHelpers.name, () => {
  const factories = createTestnetFactoriesForE2ETests()

  for (const factory of factories.slice(0, 1)) {
    describe(factory.constructor.name, () => {
      let testnetClient: TestnetClient
      let cleanup: () => Promise<void>
      const onBlockSpy = mockFn<OnBlockHandler>(async () => {})

      before(async () => {
        ;({ client: testnetClient, cleanup } = await factory.create({
          id: 'test',
          originChain: mainnet,
          forkChainId: mainnet.id,
          blockNumber: 21439277n,
          onBlock: onBlockSpy,
        }))
        await testnetClient.baselineSnapshot()
      })
      after(async () => {
        await cleanup()
        onBlockSpy.reset()
      })
      beforeEach(async () => {
        await testnetClient.revertToBaseline()
      })

      describe('assertWriteContract', () => {
        it('asserts that contract write was mined, but rejected', async () => {
          const usds = CheckedAddress('0xdc035d45d973e3ec169d2276ddab16f1e407384f')
          const account = privateKeyToAccount(generatePrivateKey())

          await testnetClient.setBalance(account.address, parseEther('1'))

          await expect(() =>
            testnetClient.assertWriteContract({
              address: usds,
              abi: erc20Abi,
              functionName: 'transfer',
              args: [CheckedAddress.random('alice'), 100n],
              account,
              gas: 100_000n,
            }),
          ).toBeRejectedWith('Transaction failed: transfer')
          expect(onBlockSpy).toHaveBeenCalledWith({ forkChainId: mainnet.id })
        })

        it('calls onBlock hook on successful txs', async () => {
          const usds = CheckedAddress('0xdc035d45d973e3ec169d2276ddab16f1e407384f')
          const account = CheckedAddress('0xa3931d71877c0e7a3148cb7eb4463524fec27fbd')

          await testnetClient.setBalance(account, parseEther('1'))

          await testnetClient.assertWriteContract({
            address: usds,
            abi: erc20Abi,
            functionName: 'transfer',
            args: [CheckedAddress.random('alice'), 100n],
            account,
            gas: 100_000n,
          })

          expect(onBlockSpy).toHaveBeenCalledWith({ forkChainId: mainnet.id })
        })
      })

      describe('assertSendTransaction', () => {
        it('asserts that transaction was mined, but rejected', async () => {
          const usds = CheckedAddress('0xdc035d45d973e3ec169d2276ddab16f1e407384f')
          const account = privateKeyToAccount(generatePrivateKey())

          await testnetClient.setBalance(account.address, parseEther('1'))

          await expect(() =>
            testnetClient.assertSendTransaction({
              account,
              to: usds,
              data: encodeFunctionData({
                abi: erc20Abi,
                functionName: 'transfer',
                args: [CheckedAddress.random('alice'), 100n],
              }),
              gas: 100_000n,
            }),
          ).toBeRejectedWith('Transaction failed:')
          expect(onBlockSpy).toHaveBeenCalledWith({ forkChainId: mainnet.id })
        })

        it('calls onBlock hook on successful txs', async () => {
          const usds = CheckedAddress('0xdc035d45d973e3ec169d2276ddab16f1e407384f')
          const account = CheckedAddress('0xa3931d71877c0e7a3148cb7eb4463524fec27fbd')

          await testnetClient.setBalance(account, parseEther('1'))

          await testnetClient.assertSendTransaction({
            account,
            to: usds,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: 'transfer',
              args: [CheckedAddress.random('alice'), 100n],
            }),
            gas: 100_000n,
          })

          expect(onBlockSpy).toHaveBeenCalledWith({ forkChainId: mainnet.id })
        })
      })
    })
  }
})
