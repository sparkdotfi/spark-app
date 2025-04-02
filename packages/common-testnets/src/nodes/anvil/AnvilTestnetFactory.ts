import { assert } from '@sparkdotfi/common-universal'
import getPort from 'get-port'
import { http, createPublicClient } from 'viem'
import { arbitrum, base, gnosis, mainnet } from 'viem/chains'
import { TestnetClient } from '../../TestnetClient.js'
import {
  CreateClientFromUrlParams,
  CreateNetworkParams,
  TestnetCreateResult,
  TestnetFactory,
} from '../../TestnetFactory.js'
import { getAnvilClient } from './AnvilClient.js'
import { Anvil } from './instance/Anvil.js'

// Set TESTNETS_ANVIL_NO_STORAGE_CACHING or TESTNETS_ANVIL_VERBOSE env variables to configure Anvil server
export class AnvilTestnetFactory implements TestnetFactory {
  constructor(private readonly opts: { alchemyApiKey: string }) {}

  async create(args: CreateNetworkParams): Promise<TestnetCreateResult> {
    const { originChain, forkChainId, blockNumber } = args

    const forkUrl = originChainIdToForkUrl(originChain.id, this.opts.alchemyApiKey)
    // if forkChainId is specified, anvil requires blockNumber to be specified as well
    const forkBlockNumber = await (async () => {
      if (blockNumber) {
        return blockNumber
      }

      const publicClient = createPublicClient({ transport: http(forkUrl) })
      return publicClient.getBlockNumber()
    })()
    const port = await getPort({ port: 8545 })

    const anvil = new Anvil({
      forkUrl,
      autoImpersonate: true,
      forkBlockNumber,
      forkChainId,
      port,
      gasPrice: 0,
      blockBaseFeePerGas: 0,
    })

    await anvil.start()

    const rpcUrl = `http://${anvil.config.host}:${anvil.config.port}`

    assert(anvil.status === 'running', `Anvil failed to start: ${anvil.status}`)

    const client = getAnvilClient({
      rpcUrl,
      originChain,
      forkChainId,
      onBlock: args.onBlock ?? (async () => {}),
    })

    const lastBlockTimestamp = (await client.getBlock()).timestamp
    await client.setNextBlockTimestamp(lastBlockTimestamp + 1n) // mineBlocks does not respect interval for the first block
    await client.mineBlocks(2n)

    // eslint-disable-next-line
    const cleanup = async () => {
      await anvil.stop()
    }

    return {
      client,
      rpcUrl,
      cleanup,
    }
  }

  createClientFromUrl(args: CreateClientFromUrlParams): TestnetClient {
    return getAnvilClient({ ...args, onBlock: args.onBlock ?? (async () => {}) })
  }
}

function originChainIdToForkUrl(originChainId: number, alchemyApiKey: string): string {
  switch (originChainId) {
    case mainnet.id:
      return `https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    case base.id:
      return `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    case gnosis.id:
      return `https://gnosis-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    case arbitrum.id:
      return `https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`
    default:
      throw new Error(`Unsupported origin chain id: ${originChainId}`)
  }
}
