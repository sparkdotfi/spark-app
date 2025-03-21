import { getEnv } from '@marsfoundation/common-nodejs/env'
import { HttpClient } from '@marsfoundation/common-universal/http-client'
import { Logger } from '@marsfoundation/common-universal/logger'
import { TestnetFactory } from '../TestnetFactory.js'
import { AnvilTestnetFactory } from '../nodes/anvil/index.js'
import { TenderlyTestnetFactory } from '../nodes/tenderly/index.js'

export function createTestnetFactoriesForE2ETests(): TestnetFactory[] {
  const env = getEnv()

  const tenderly = new TenderlyTestnetFactory(
    {
      apiKey: env.string('TENDERLY_API_KEY'),
      account: env.string('TENDERLY_ACCOUNT'),
      project: env.string('TENDERLY_PROJECT'),
    },
    new HttpClient(Logger.SILENT),
  )

  const anvil = new AnvilTestnetFactory({ alchemyApiKey: env.string('TEST_E2E_ALCHEMY_API_KEY') })

  // useful for local development with a single testnet factory
  const localFactory = env.optionalStringOf('LOCAL_FACTORY', ['anvil', 'tenderly'])
  if (localFactory === 'anvil') {
    return [anvil]
  }
  if (localFactory === 'tenderly') {
    return [tenderly]
  }

  return [tenderly, anvil]
}
