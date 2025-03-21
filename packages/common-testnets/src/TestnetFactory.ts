import { Chain } from 'viem'
import { TestnetClient } from './TestnetClient.js'

export interface TestnetCreateResult {
  client: TestnetClient
  rpcUrl: string
  publicRpcUrl?: string // url that it's safe to leak as "cheat" methods like setting balances are disabled. Not all testnets supports this so it's optional
  cleanup: () => Promise<void>
}
/**
 * The created testnet will have a small, though known beforehand, difference in both the final block number
 * and its timestamp compared to the requested block. This is due to necessary normalization
 * steps that ensure compatibility with different client implementations.
 */
export interface TestnetFactory {
  create(args: CreateNetworkParams): Promise<TestnetCreateResult>
  createClientFromUrl(args: CreateClientFromUrlParams): TestnetClient
}

export interface CreateNetworkParams {
  id: string
  displayName?: string
  originChain: Chain
  forkChainId: number
  blockNumber?: bigint
  onBlock?: OnBlockHandler /* @note: called only when interacting directly via TestnetClient  */
}

export interface CreateClientFromUrlParams {
  rpcUrl: string
  originChain: Chain
  forkChainId: number
  onBlock?: OnBlockHandler
}

/**
 * @internal
 */
export type CreateClientFromUrlParamsInternal = Required<CreateClientFromUrlParams>

export type OnBlockHandler = (ctx: {
  forkChainId: number
}) => Promise<void>
