import { assert } from '@sparkdotfi/common-universal'
import { skipToken, useQuery } from '@tanstack/react-query'
import { Address, Client, Hash, parseAbiItem } from 'viem'
import { getLogs, getTransactionReceipt, watchBlockNumber } from 'viem/actions'
import {
  UseWaitForTransactionReceiptParameters,
  UseWaitForTransactionReceiptReturnType,
  useAccount,
  useChainId,
  useClient,
} from 'wagmi'
import { waitForTransactionReceiptQueryKey } from 'wagmi/query'

const executionSuccessEvent = parseAbiItem('event ExecutionSuccess(bytes32 txHash, uint256 payment)')

/**
 * Like `useWaitForTransactionReceipt`, but works with Gnosis Safe "subtransaction" hashes.
 * It will watch events emitted by the sender (Gnosis Safe contract) and look for 'ExecutionSuccess' event with matching subtransaction hash.
 */
export function useWaitForTransactionReceiptGnosisSafe(
  args: UseWaitForTransactionReceiptParameters = {},
): UseWaitForTransactionReceiptReturnType {
  const { address } = useAccount()
  const client = useClient()
  const chainId = useChainId()

  const subTxHash = args.hash
  const enabled = Boolean(subTxHash && address && (args.query?.enabled ?? true))

  return useQuery({
    queryKey: waitForTransactionReceiptGnosisSafeQueryKey(args, chainId),
    queryFn:
      !subTxHash || !client || !address
        ? skipToken
        : waitForTransactionReceiptGnosisSafeQueryFn({ args, subTxHash, client, address }),
    ...(args.query as any),
    enabled,
  }) as UseWaitForTransactionReceiptReturnType
}

export function waitForTransactionReceiptGnosisSafeQueryKey(
  args: UseWaitForTransactionReceiptParameters,
  chainId: number,
): unknown[] {
  return [
    'gnosis-safe',
    ...waitForTransactionReceiptQueryKey({
      ...args,
      chainId,
    }),
  ]
}

interface WaitForTransactionReceiptGnosisSafeQueryFnParams {
  args: UseWaitForTransactionReceiptParameters
  subTxHash: Hash
  client: Client
  address: Address
}
function waitForTransactionReceiptGnosisSafeQueryFn({
  args,
  subTxHash,
  client,
  address,
}: WaitForTransactionReceiptGnosisSafeQueryFnParams) {
  return async function queryFn({ signal }: { signal?: AbortSignal }) {
    const gnosisTxHash = await waitForGnosisTxHash({ subTxHash, client, address, signal })

    return getTransactionReceipt(client, { ...args, hash: gnosisTxHash })
  }
}

interface WaitForGnosisTxHashParams {
  subTxHash: Hash
  client: Client
  address: Address
  signal?: AbortSignal
}
async function waitForGnosisTxHash({ subTxHash, client, address, signal }: WaitForGnosisTxHashParams): Promise<Hash> {
  return new Promise<Hash>((resolve, reject) => {
    const unwatch = watchBlockNumber(client, {
      emitOnBegin: true,
      async onBlockNumber(blockNumber) {
        try {
          const logs = await getLogs(client, {
            address,
            event: executionSuccessEvent,
            fromBlock: blockNumber - 10n,
            toBlock: blockNumber,
          })

          for (const log of logs) {
            if (log.args.txHash === subTxHash) {
              assert(log.transactionHash, 'Transaction hash not found')

              unwatch()
              resolve(log.transactionHash)
              return
            }
          }
        } catch (error) {
          unwatch()
          reject(error)
        }
      },
      async onError(error) {
        unwatch()
        reject(error)
      },
    })

    signal?.addEventListener('abort', () => {
      unwatch()
    })
  })
}
