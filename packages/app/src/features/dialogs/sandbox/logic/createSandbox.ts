import { apiUrl } from '@/config/consts'
import { AppConfig } from '@/config/feature-flags'
import { trackEvent } from '@/domain/analytics/mixpanel'
import { createTenderlyFork } from '@/domain/sandbox/createTenderlyFork'
import { getTenderlyClient } from '@/features/dialogs/sandbox/tenderly/TenderlyClient'
import { CheckedAddress, UnixTime, raise } from '@sparkdotfi/common-universal'
import { Address, Chain, parseEther, parseUnits } from 'viem'
import { Config } from 'wagmi'
import { mainnet } from 'wagmi/chains'

export async function createSandbox(opts: {
  originChainId: number
  forkChainId: number
  userAddress: Address
  wagmiConfig: Config
  mintBalances: NonNullable<AppConfig['sandbox']>['mintBalances']
}): Promise<string> {
  const { rpcUrl: forkUrl } = await createTenderlyFork({
    namePrefix: 'sandbox',
    originChainId: opts.originChainId,
    forkChainId: opts.forkChainId,
    apiUrl: `${apiUrl}/sandbox/create`,
  })
  const testnetClient = getTenderlyClient({
    rpcUrl: forkUrl,
    originChain: chainIdToChain[opts.originChainId] ?? raise('Only mainnet is supported as origin chain'),
    forkChainId: opts.forkChainId,
  })
  await testnetClient.setBalance(opts.userAddress, parseEther(opts.mintBalances.etherAmt.toString()))

  await Promise.all(
    Object.values(opts.mintBalances.tokens).map(async (token) => {
      const units = parseUnits(opts.mintBalances.tokenAmt.toString(), token.decimals)
      await testnetClient.setErc20Balance(token.address, opts.userAddress, units)
    }),
  )

  if (import.meta.env.MODE === 'development' || import.meta.env.MODE === 'staging') {
    const { setupSparkRewards } = await import('./setupSparkRewards')
    await setupSparkRewards({
      testnetClient,
      account: CheckedAddress(opts.userAddress),
      wagmiConfig: opts.wagmiConfig,
      sandboxChainId: opts.forkChainId,
    })
  }

  trackEvent('sandbox-created')

  return forkUrl
}

/**
 * @returns string concatenated prefix and timestamp
 */
export function getChainIdWithPrefix(prefix: number, timestamp: UnixTime): number {
  return Number.parseInt(prefix.toString() + timestamp.toString())
}

const chainIdToChain: Record<number, Chain> = {
  [mainnet.id]: mainnet,
}
