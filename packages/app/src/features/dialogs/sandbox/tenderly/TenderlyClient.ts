import { assert } from '@sparkdotfi/common-universal'
import {
  http,
  Address,
  Chain,
  PartialBy,
  PublicActions,
  WaitForTransactionReceiptReturnType,
  WalletClient,
  createClient,
  numberToHex,
  publicActions,
  walletActions,
} from 'viem'

interface TenderlyClientParams {
  rpcUrl: string
  originChain: Chain
  forkChainId: number
}

type TestnetActions = {
  setErc20Balance(tkn: Address, usr: Address, amount: bigint): Promise<void>
  setBalance(usr: Address, amount: bigint): Promise<void>
  assertSendTransaction: (
    args: PartialBy<Parameters<WalletClient['sendTransaction']>[0], 'chain'>,
  ) => Promise<WaitForTransactionReceiptReturnType>
}

export type TestnetClient = PublicActions & WalletClient & TestnetActions

// Simplified version of @sparkdotfi/common-testnets, as importing it would increase bundle size
export function getTenderlyClient(params: TenderlyClientParams): TestnetClient {
  return createClient({
    chain: { ...params.originChain, id: params.forkChainId },
    transport: http(params.rpcUrl),
    cacheTime: 0, // do not cache block numbers
  })
    .extend(walletActions)
    .extend(publicActions)
    .extend((c): TestnetActions => {
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
        async assertSendTransaction(args) {
          const txHash = await c.sendTransaction(args as any)

          const receipt = await c.waitForTransactionReceipt({
            hash: txHash,
          })

          assert(receipt.status === 'success', `Transaction failed: ${txHash}`)
          return receipt
        },
      }
    })
}
