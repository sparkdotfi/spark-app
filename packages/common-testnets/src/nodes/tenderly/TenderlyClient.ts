import { Hash } from '@sparkdotfi/common-universal'
import { http, Address, Hex, createTestClient, numberToHex, publicActions, walletActions } from 'viem'
import { TestnetClient } from '../../TestnetClient.js'
import { CreateClientFromUrlParamsInternal } from '../../TestnetFactory.js'
import { extendWithTestnetHelpers } from '../extendWithTestnetHelpers.js'

export function getTenderlyClient(args: CreateClientFromUrlParamsInternal): TestnetClient {
  return createTestClient({
    chain: { ...args.originChain, id: args.forkChainId },
    mode: 'anvil',
    transport: http(args.rpcUrl),
    cacheTime: 0, // do not cache block numbers
  })
    .extend((c) => {
      return {
        async setErc20Balance(tkn: Address, usr: Address, amt: bigint): Promise<void> {
          return c.request({
            method: 'tenderly_setErc20Balance',
            params: [tkn.toString(), usr.toString(), numberToHex(amt)],
          } as any)
        },
        async setBalance(usr: Address, amt: bigint): Promise<void> {
          return c.request({
            method: 'tenderly_setBalance',
            params: [usr.toString(), numberToHex(amt)],
          } as any)
        },
        async setStorageAt(addr: Address, slot: Hash, value: string) {
          await c.request({
            method: 'tenderly_setStorageAt',
            params: [addr.toString(), slot, value],
          } as any)

          await args.onBlock({ forkChainId: args.forkChainId })
        },
        async snapshot(): Promise<string> {
          return c.request({
            method: 'evm_snapshot',
            params: [],
          } as any)
        },
        async revert(snapshotId: string) {
          await c.request({
            method: 'evm_revert',
            params: [snapshotId],
          } as any)
          // tenderly doesn't burn the snapshots id so we can reuse it
          return snapshotId
        },
        async mineBlocks(blocks: bigint) {
          await c.request({
            method: 'evm_increaseBlocks',
            params: [numberToHex(blocks)],
          } as any)
        },
        async setNextBlockTimestamp(timestamp: bigint) {
          await c.request({
            method: 'tenderly_setNextBlockTimestamp',
            params: [numberToHex(timestamp)],
          } as any)
        },
        async setCode(addr: Address, code: Hex): Promise<void> {
          await c.request({
            method: 'tenderly_setCode',
            params: [addr.toString(), code],
          } as any)
        },
        async setNextBlockBaseFee(_: bigint) {
          throw new Error('Method not supported')
        },
      }
    })
    .extend(walletActions)
    .extend(publicActions)
    .extend(extendWithTestnetHelpers(args))
}
