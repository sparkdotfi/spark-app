import { Path, paths } from '@/config/paths'
import { ongoingCampaignsResponseSchema } from '@/domain/spark-rewards/ongoingCampaignsQueryOptions'
import { Page } from '@playwright/test'
import { TestnetClient } from '@sparkdotfi/common-testnets'
import { assert, CheckedAddress, assertNever, extractUrlFromClient } from '@sparkdotfi/common-universal'
import { generatePath } from 'react-router-dom'
import { Address, Chain, Hash, parseEther, parseUnits } from 'viem'
import { z } from 'zod'
import { AssetsInTests, TOKENS_ON_FORK } from './constants'
import { getTestnetContext } from './getTestnetContext'
import { injectFlags, injectNetworkConfiguration, injectWalletConfiguration, overrideRoutes } from './injectSetup'
import { SetSpkStakingBaDataParams, setSpkStakingBaData } from './setSpkStakingBaData'
import { SetupSparkRewardsParams, setupSparkRewards } from './setupSparkRewards'
import { generateAccount } from './utils'

export type InjectableWallet = { address: Address } | { privateKey: string }

type PathParams<K extends Path> = Parameters<typeof generatePath<(typeof paths)[K]>>[1]
export function buildUrl<T extends Path>(key: T, pathParams?: PathParams<T>): string {
  return `http://localhost:4000${generatePath(paths[key], pathParams)}`
}

export type AssetBalances = Partial<Record<AssetsInTests, number>>
export type ConnectionType = 'not-connected' | 'connected-random' | 'connected-pkey' | 'connected-address'
export type AccountOptions<T extends ConnectionType> = T extends 'not-connected'
  ? {
      type: T
    }
  : (T extends 'connected-random'
      ? {}
      : T extends 'connected-pkey'
        ? {
            privateKey: Hash
          }
        : T extends 'connected-address'
          ? {
              address: Address
            }
          : never) & {
      type: T
      atomicBatchSupported?: boolean
      assetBalances?: Partial<Record<AssetsInTests, number>>
      sparkRewards?: SetupSparkRewardsParams['rewardsConfig']
      spkStaking?: Pick<SetSpkStakingBaDataParams, 'stats' | 'walletData'>
    }

export interface BlockchainOptions {
  chain: Chain
  blockNumber: bigint
}

export interface SparkRewardsConfig {
  ongoingCampaigns: z.input<typeof ongoingCampaignsResponseSchema>
}

export interface SetupOptions<K extends Path, T extends ConnectionType> {
  blockchain: BlockchainOptions
  initialPage: K
  initialPageParams?: PathParams<K>
  account: AccountOptions<T>
  skipInjectingNetwork?: boolean
  balanceOverrides?: Record<Address, Partial<Record<AssetsInTests, number>>>
  sparkRewards?: SparkRewardsConfig
}

export type ProgressSimulation = (seconds: number) => Promise<void>
export interface TestnetController {
  client: TestnetClient
  progressSimulation: ProgressSimulation
  progressSimulationAndMine: ProgressSimulation
  autoProgressSimulationController: AutoSimulationProgressController
}

export type TestContext<T extends ConnectionType = 'not-connected'> = (T extends 'not-connected'
  ? {}
  : { account: Address }) & {
  testnetController: TestnetController
  page: Page
}

// should be called at the beginning of any test
export async function setup<K extends Path, T extends ConnectionType>(
  page: Page,
  options: SetupOptions<K, T>,
): Promise<TestContext<T>> {
  const { client: testnetClient, initialSnapshotId } = await getTestnetContext(options.blockchain)
  await testnetClient.revert(initialSnapshotId)

  if (options.balanceOverrides) {
    for (const [address, balances] of Object.entries(options.balanceOverrides)) {
      await injectFunds(testnetClient, address as Address, balances)
    }
  }

  const autoProgressSimulationController = await injectPageSetup({ page, testnetClient, options })
  const address = await setupAccount({ page, testnetClient, options: options.account })

  if (options.sparkRewards) {
    await setupSparkRewardsOngoingCampaigns(page, options.sparkRewards)
  }

  async function progressSimulation(seconds: number): Promise<void> {
    const { timestamp: currentTimestamp } = await testnetClient.getBlock()

    const progressedTimestamp = currentTimestamp + BigInt(seconds)
    await testnetClient.setNextBlockTimestamp(progressedTimestamp)
    await page.clock.setFixedTime(Number(currentTimestamp) * 1000)
  }

  async function progressSimulationAndMine(seconds: number): Promise<void> {
    await progressSimulation(seconds)
    await testnetClient.mineBlocks(1n)
    await progressSimulation(1)
  }

  // @note: Set next block to be mined timestamp to be 5 seconds more.
  await progressSimulation(5)

  const testnetController: TestnetController = {
    client: testnetClient,
    progressSimulation,
    progressSimulationAndMine,
    autoProgressSimulationController,
  }

  const testContext = {
    page,
    account: address,
    testnetController,
  }

  if (options.account.type !== 'not-connected' && options.account.sparkRewards && address) {
    await setupSparkRewards({
      testContext,
      account: CheckedAddress(address),
      rewardsConfig: options.account.sparkRewards,
    })
  }

  if (options.account.type !== 'not-connected' && options.account.spkStaking && address) {
    await setSpkStakingBaData({
      page,
      testnetClient,
      account: CheckedAddress(address),
      stats: options.account.spkStaking.stats,
      walletData: options.account.spkStaking.walletData,
    })
  }

  await page.goto(buildUrl(options.initialPage, options.initialPageParams))

  return testContext as any
}

async function injectFunds(
  testnetClient: TestnetClient,
  address: Address,
  assetBalances?: AssetBalances,
): Promise<void> {
  if (!assetBalances) {
    return
  }

  const chainId = await testnetClient.getChainId()
  for (const [tokenName, balance] of Object.entries(assetBalances)) {
    const { timestamp } = await testnetClient.getBlock()
    await testnetClient.setNextBlockTimestamp(timestamp + 1n)
    if (tokenName === 'ETH' || tokenName === 'XDAI') {
      await testnetClient.setBalance(address, parseEther(balance.toString()))
    } else {
      await testnetClient.setErc20Balance(
        (TOKENS_ON_FORK as any)[chainId][tokenName].address,
        address,
        parseUnits(balance.toString(), (TOKENS_ON_FORK as any)[chainId][tokenName].decimals),
      )
    }
  }
}

async function setupAccount<T extends ConnectionType>({
  page,
  testnetClient,
  options,
}: {
  page: Page
  testnetClient: TestnetClient
  options: AccountOptions<T>
}): Promise<Address | undefined> {
  switch (options.type) {
    case 'connected-random': {
      const account = generateAccount({ privateKey: undefined })
      await injectWalletConfiguration(page, account, options.atomicBatchSupported)
      await injectFunds(testnetClient, account.address, options.assetBalances)
      return account.address
    }

    case 'connected-pkey': {
      const account = generateAccount({ privateKey: options.privateKey })
      await injectWalletConfiguration(page, account, options.atomicBatchSupported)
      await injectFunds(testnetClient, account.address, options.assetBalances)
      return account.address
    }

    case 'connected-address': {
      await injectWalletConfiguration(page, { address: options.address }, options.atomicBatchSupported)
      return options.address
    }

    case 'not-connected':
      return undefined

    default:
      assertNever(options)
  }
}

async function injectPageSetup({
  page,
  testnetClient,
  options,
}: {
  page: Page
  testnetClient: TestnetClient
  options: SetupOptions<any, any>
}): Promise<AutoSimulationProgressController> {
  const rpcUrl = extractUrlFromClient(testnetClient)

  if (options.skipInjectingNetwork === true) {
    // if explicitly disabled, do not inject network config abort all network requests to RPC providers
    await page.route(/alchemy/, (route) => route.abort())
    await page.route(/rpc.ankr/, (route) => route.abort())
    await page.route(/blockanalitica.com/, (route) => route.abort())
  } else {
    await injectNetworkConfiguration({
      page,
      rpcUrl,
      chainId: options.blockchain.chain.id,
    })
  }

  await injectFlags(page, testnetClient, options.blockchain.chain.id)
  await overrideRoutes(page)

  let autoSimulationProgressDelta: number | undefined
  await page.route(rpcUrl, async (route) => {
    const body = await route.request().postDataJSON()
    if (body.jsonrpc === '2.0' && body.method === 'eth_sendTransaction') {
      if (autoSimulationProgressDelta) {
        const { timestamp: currentTimestamp } = await testnetClient.getBlock()

        const progressedTimestamp = currentTimestamp + BigInt(autoSimulationProgressDelta)
        await testnetClient.setNextBlockTimestamp(progressedTimestamp)
      }
    }
    return route.continue()
  })

  const autoProgressSimulationController: AutoSimulationProgressController = {
    enable: (deltaSeconds: number) => {
      assert(deltaSeconds > 0, 'deltaSeconds should be greater than 0')
      autoSimulationProgressDelta = deltaSeconds
    },
    disable: () => {
      autoSimulationProgressDelta = undefined
    },
  }

  const { timestamp } = await testnetClient.getBlock()
  await page.clock.setFixedTime(Number(timestamp) * 1000)

  return autoProgressSimulationController
}

export interface AutoSimulationProgressController {
  enable: (deltaSeconds: number) => void
  disable: () => void
}

async function setupSparkRewardsOngoingCampaigns(page: Page, options: SparkRewardsConfig): Promise<void> {
  await page.route(`${process.env.VITE_SPARK2_API_URL}/rewards/campaigns/`, async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify(options.ongoingCampaigns),
    })
  })
}
