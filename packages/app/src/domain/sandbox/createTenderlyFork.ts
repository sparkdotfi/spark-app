import { z } from 'zod'

import { randomHexId } from '@/utils/random'
import { HttpClient } from '@sparkdotfi/common-universal/http-client'
import { Logger } from '@sparkdotfi/common-universal/logger'

const createForkResponseSchema = z.object({
  simulation_fork: z.object({
    rpc_url: z.string(),
  }),
})

export interface CreateTenderlyForkArgs {
  apiUrl: string
  originChainId: number
  forkChainId: number
  namePrefix: string
  blockNumber?: bigint
  headers?: Record<string, string>
}

export interface CreateTenderlyForkResult {
  rpcUrl: string
}

export async function createTenderlyFork({
  apiUrl,
  originChainId,
  forkChainId,
  namePrefix,
  blockNumber,
}: CreateTenderlyForkArgs): Promise<CreateTenderlyForkResult> {
  const httpClient = new HttpClient(Logger.BROWSER)
  const response = await httpClient.post(
    apiUrl,
    {
      network_id: originChainId,
      block_number: blockNumber ? Number(blockNumber) : undefined,
      chain_config: { chain_id: forkChainId },
      alias: `${namePrefix}_${randomHexId()}`,
    },
    createForkResponseSchema,
  )

  return { rpcUrl: response.simulation_fork.rpc_url }
}
