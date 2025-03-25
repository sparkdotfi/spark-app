import { randomHexId } from '@/utils/random'
import { getEnv } from '@sparkdotfi/common-nodejs/env'
import { TenderlyTestnetFactory, TestnetClient } from '@sparkdotfi/common-testnets'
import { HttpClient } from '@sparkdotfi/common-universal/http-client'
import { Logger } from '@sparkdotfi/common-universal/logger'
import { Chain } from 'viem'

interface TestnetContext {
  client: TestnetClient
  initialSnapshotId: string
  cleanup: () => Promise<void>
}

const testnetCache = new Map<string, TestnetContext>()
for (const eventType of ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM']) {
  process.on(eventType, async () => {
    const keys = Array.from(testnetCache.keys())
    return Promise.all(
      keys.map(async (key) => {
        const context = testnetCache.get(key)!
        testnetCache.delete(key)
        return context.cleanup()
      }),
    )
  })
}

export async function getTestnetContext({
  chain,
  blockNumber,
}: { chain: Chain; blockNumber: bigint }): Promise<TestnetContext> {
  const key = `${chain.id}-${blockNumber.toString()}`
  if (testnetCache.has(key)) {
    return testnetCache.get(key)!
  }

  const env = getEnv()
  const factory = new TenderlyTestnetFactory(
    {
      account: env.string('TENDERLY_ACCOUNT'),
      project: env.string('TENDERLY_PROJECT'),
      apiKey: env.string('TENDERLY_API_KEY'),
    },
    new HttpClient(Logger.SILENT),
  )

  const testnetId = randomHexId()
  const { client, cleanup } = await factory.create({
    id: `test-e2e-${testnetId}`,
    displayName: `Spark E2E Testnet ${testnetId}`,
    originChain: chain,
    forkChainId: chain.id,
    blockNumber,
  })

  const initialSnapshotId = await client.snapshot()

  const context: TestnetContext = {
    client,
    initialSnapshotId,
    cleanup,
  }

  testnetCache.set(key, context)

  return context
}
