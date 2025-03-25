import { assert, Hash } from '@sparkdotfi/common-universal'
import { http, Address, Hex, createTestClient, numberToHex, publicActions, walletActions } from 'viem'
import { dealActions } from 'viem-deal'
import { TestnetClient } from '../../TestnetClient.js'
import { CreateClientFromUrlParamsInternal } from '../../TestnetFactory.js'
import { extendWithTestnetHelpers } from '../extendWithTestnetHelpers.js'

export function getAnvilClient(args: CreateClientFromUrlParamsInternal): TestnetClient {
  return createTestClient({
    chain: { ...args.originChain, id: args.forkChainId },
    mode: 'anvil',
    transport: http(args.rpcUrl),
    cacheTime: 0, // do not cache block numbers
  })
    .extend(publicActions)
    .extend(dealActions)
    .extend((c) => {
      return {
        async setErc20Balance(tkn: Address, usr: Address, amt: bigint): Promise<void> {
          return await c.deal({
            erc20: tkn.toLowerCase() as any,
            account: usr.toLowerCase() as any,
            amount: amt,
          })
        },
        async setBalance(usr: Address, amt: bigint): Promise<void> {
          return c.request({
            method: 'anvil_setBalance',
            params: [usr.toString(), `0x${amt.toString(16)}`],
          } as any)
        },
        async setStorageAt(addr: Address, slot: Hash, value: string) {
          await c.request({
            method: 'anvil_setStorageAt',
            params: [addr.toString(), slot, value],
          } as any)
        },
        async snapshot(): Promise<string> {
          return c.request({
            method: 'evm_snapshot',
            params: [],
          } as any)
        },
        async revert(snapshotId: string) {
          const result = await c.request({
            method: 'evm_revert',
            params: [snapshotId],
          } as any)

          assert(result === true, 'revert failed')

          // anvil snapshots are "burned" after revert so we need to create a new one
          return await c.snapshot()
        },
        async mineBlocks(blocks: bigint) {
          await c.request({
            method: 'anvil_mine',
            params: [numberToHex(blocks), numberToHex(1)],
          })
        },
        async setNextBlockTimestamp(timestamp: bigint) {
          await c.request({
            method: 'evm_setNextBlockTimestamp',
            params: [numberToHex(timestamp)],
          })
        },
        async setCode(addr: Address, code: Hex): Promise<void> {
          await c.request({
            method: 'anvil_setCode',
            params: [addr.toString(), code],
          } as any)
        },
        async setNextBlockBaseFee(baseFee: bigint) {
          await c.request({
            method: 'anvil_setNextBlockBaseFeePerGas',
            params: [numberToHex(baseFee)],
          })
        },
      }
    })
    .extend(walletActions)
    .extend(extendWithTestnetHelpers(args))
}
