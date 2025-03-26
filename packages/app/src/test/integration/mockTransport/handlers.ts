import { isDeepStrictEqual } from 'node:util'
import { Hex } from '@sparkdotfi/common-universal'
import {
  Abi,
  AbiEvent,
  Address,
  ContractFunctionName,
  DecodeEventLogReturnType,
  EncodeFunctionDataParameters,
  EncodeFunctionResultParameters,
  encodeAbiParameters,
  encodeEventTopics,
  encodeFunctionData,
  encodeFunctionResult,
  isAddressEqual,
  numberToHex,
  toHex,
} from 'viem'
import { TestTrigger } from '../trigger'
import { RpcHandler } from './types'
import { cleanObject, encodeRpcQuantity, encodeRpcUnformattedData, getEmptyTxData, getEmptyTxReceipt } from './utils'

function blockNumberCall(block: number | bigint): RpcHandler {
  return (method) => {
    if (method === 'eth_blockNumber') {
      return encodeRpcQuantity(block)
    }
    return undefined
  }
}

function blockCall(overrides: { timestamp?: number }): RpcHandler {
  return (method) => {
    if (method === 'eth_getBlockByNumber' || method === 'eth_getBlockByHash') {
      return {
        number: '0x1b4',
        difficulty: '0x4ea3f27bc',
        extraData: '0x476574682f4c5649562f76312e302e302f6c696e75782f676f312e342e32',
        gasLimit: '0x1388',
        gasUsed: '0x0',
        hash: '0xdc0818cf78f21a8e70579cb46a43643f78291264dda342ae31049421c82d21ae',
        logsBloom:
          '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        miner: '0xbb7b8287f3f0a933474a79eae42cbca977791171',
        mixHash: '0x4fffe9ae21f1c9e15207b1f472d5bbdd68c9595d461666602f2be20daf5e7843',
        nonce: '0x689056015818adbe',
        parentHash: '0xe99e022112df268087ea7eafaf4790497fd21dbeeb6bd7a1721df161a6657a54',
        receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        sha3Uncles: '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
        size: '0x220',
        stateRoot: '0xddc8b0234c2e0cad087c8b389aa7ef01f7d79b2570bccb77ce48648aa61c904d',
        totalDifficulty: '0x78ed983323d',
        transactions: [],
        transactionsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
        uncles: [],
        timestamp: numberToHex(overrides.timestamp ?? 1438271100),
      }
    }
    return undefined
  }
}

function chainIdCall(opts: { chainId: number }): RpcHandler {
  return (method) => {
    if (method === 'eth_chainId') {
      return encodeRpcQuantity(opts.chainId)
    }
    return undefined
  }
}

function balanceCall(opts: { balance: bigint; address: string }): RpcHandler {
  return (method, [addr]) => {
    if (method === 'eth_getBalance' && addr === opts.address) {
      return encodeRpcQuantity(opts.balance)
    }
    return undefined
  }
}

function cleanParams(params: any): any {
  const { gas, ...striped } = params
  return cleanObject(striped)
}

function contractCall<TAbi extends Abi | readonly unknown[], TFunctionName extends ContractFunctionName<TAbi>>(
  opts: EncodeFunctionDataParameters<TAbi, TFunctionName> & {
    result: NonNullable<EncodeFunctionResultParameters<TAbi, TFunctionName>['result']> | undefined // forcing to specify result
  } & { to?: string; from?: string; value?: bigint },
): RpcHandler {
  return (method, [params]) => {
    if (method !== 'eth_call' && method !== 'eth_estimateGas') {
      return undefined
    }

    const actualExpected = {
      to: opts.to,
      from: opts.from,
      data: encodeFunctionData({
        abi: opts.abi,
        functionName: opts.functionName,
        args: opts.args ?? [],
      } as any),
      value: opts.value !== undefined ? encodeRpcQuantity(opts.value) : undefined,
    }

    if (!isDeepStrictEqual(cleanParams(params), cleanObject(actualExpected))) {
      return undefined
    }

    if (method === 'eth_estimateGas') {
      return encodeRpcQuantity(100_000n)
    }

    return encodeFunctionResult({
      abi: opts.abi,
      functionName: opts.functionName,
      result: opts.result,
    } as any)
  }
}

function contractCallError<
  TAbi extends Abi | readonly unknown[],
  TFunctionName extends ContractFunctionName<TAbi> | undefined = undefined,
>(
  opts: EncodeFunctionDataParameters<TAbi, TFunctionName> & { to?: string; from?: string; errorMessage: string },
): RpcHandler {
  return (method, [params]) => {
    if (method !== 'eth_call') {
      return undefined
    }

    const actualExpected = {
      to: opts.to,
      from: opts.from,
      data: encodeFunctionData({
        abi: opts.abi,
        functionName: opts.functionName,
        args: opts.args ?? [],
      } as any),
    }

    if (!isDeepStrictEqual(cleanObject(params), cleanObject(actualExpected))) {
      return undefined
    }

    throw new MockError(opts.errorMessage)
  }
}

export interface GetLogsCallOptions<TAbiEvent extends AbiEvent> {
  address: Address
  event: TAbiEvent
  args: DecodeEventLogReturnType<[TAbiEvent]>['args']
  blockNumber: bigint
  transactionHash: string
}
function getLogsCall<TAbiEvent extends AbiEvent>({
  address,
  event,
  args,
  blockNumber,
  transactionHash,
}: GetLogsCallOptions<TAbiEvent>): RpcHandler {
  return (method, [params]) => {
    if (method !== 'eth_getLogs') {
      return undefined
    }

    if (!isAddressEqual(params.address, address)) {
      return undefined
    }

    const topics = encodeEventTopics({
      abi: [event] as any,
      eventName: event.name,
    })

    const data = encodeAbiParameters(
      event.inputs,
      event.inputs.map((input) => (args as any)[input.name!]),
    )

    return [
      {
        address,
        topics,
        data,
        blockNumber: toHex(blockNumber),
        transactionHash,
        // the rest of the parameters is not important for us
        transactionIndex: getEmptyTxReceipt().transactionIndex,
        blockHash: getEmptyTxReceipt().blockHash,
        logIndex: '0x1',
        removed: false,
      },
    ]
  }
}

function mineTransaction(opts: { blockNumber?: number; txHash?: string } = {}): RpcHandler {
  const blockNumber = opts.blockNumber ?? 0
  const txHash = opts.txHash ?? '0xdeadbeef'

  return (method: string, params: any) => {
    if (method === 'eth_sendTransaction') {
      return encodeRpcUnformattedData(txHash)
    }

    if (method === 'eth_getTransactionByHash') {
      return {
        ...getEmptyTxData(),
        blockNumber: encodeRpcQuantity(blockNumber),
        transactionHash: txHash,
      }
    }

    if (method === 'eth_getTransactionReceipt') {
      return {
        ...getEmptyTxReceipt(),
        blockNumber: encodeRpcQuantity(blockNumber),
        transactionHash: txHash,
      }
    }

    // finally block number is checked
    return blockNumberCall(blockNumber)(method, params)
  }
}

function mineRevertedTransaction(opts: { blockNumber?: number; txHash?: string } = {}): RpcHandler {
  const blockNumber = opts.blockNumber ?? 0
  const txHash = opts.txHash ?? '0xdeadbeef'

  return (method: string, params: any) => {
    if (method === 'eth_sendTransaction') {
      return encodeRpcUnformattedData(txHash)
    }

    if (method === 'eth_getTransactionByHash') {
      return {
        ...getEmptyTxData(),
        blockNumber: encodeRpcQuantity(blockNumber),
        txHash,
      }
    }

    if (method === 'eth_getTransactionReceipt') {
      // @note: this is a hack to make wagmi treat this as a reverted transaction not submission error
      throw new Error('tx reverted')
    }

    // finally block number is checked
    return blockNumberCall(blockNumber)(method, params)
  }
}

function rejectSubmittedTransaction(opts: { blockNumber?: number; txHash?: string } = {}): RpcHandler {
  const blockNumber = opts.blockNumber ?? 0

  return (method: string, params: any) => {
    if (method === 'eth_sendTransaction') {
      throw new Error('user rejected')
    }

    // finally block number is checked
    return blockNumberCall(blockNumber)(method, params)
  }
}

function mineBatchTransaction(opts: { blockNumber?: number; sendCallsId?: Hex } = {}): RpcHandler {
  const blockNumber = opts.blockNumber ?? 0
  const sendCallsId = Hex('0x1') ?? opts.sendCallsId

  return (method: string) => {
    if (method === 'wallet_sendCalls') {
      return sendCallsId
    }

    if (method === 'wallet_getCallsStatus') {
      const txReceipt = {
        ...getEmptyTxReceipt(),
        blockNumber: encodeRpcQuantity(blockNumber),
        transactionHash: Hex('0xdeadbeef'),
      }
      return {
        status: 'CONFIRMED',
        receipts: [txReceipt, txReceipt],
      }
    }
  }
}

function rejectSubmittedBatchTransaction(): RpcHandler {
  return (method: string) => {
    if (method === 'wallet_sendCalls') {
      throw new Error('wallet rejected sendCalls')
    }
    return undefined
  }
}

function rejectSubmittedBatchTransactionStatusCheck(
  opts: { blockNumber?: number; sendCallsId?: Hex } = {},
): RpcHandler {
  const sendCallsId = Hex('0x1') ?? opts.sendCallsId

  return (method: string) => {
    if (method === 'wallet_sendCalls') {
      return sendCallsId
    }

    if (method === 'wallet_getCallsStatus') {
      throw new Error('Failed to get calls status')
    }
  }
}

function mineBatchTransactionWithRejectedSubtransaction(
  opts: { blockNumber?: number; sendCallsId?: Hex; txHash?: string } = {},
): RpcHandler {
  const blockNumber = opts.blockNumber ?? 0
  const sendCallsId = Hex('0x1') ?? opts.sendCallsId

  return (method: string) => {
    if (method === 'wallet_sendCalls') {
      return sendCallsId
    }

    if (method === 'wallet_getCallsStatus') {
      const txReceipt = {
        ...getEmptyTxReceipt(),
        blockNumber: encodeRpcQuantity(blockNumber),
        transactionHash: Hex('0xdeadbeef'),
      }
      return {
        status: 'CONFIRMED',
        receipts: [txReceipt, { ...txReceipt, status: '0x0' }],
      }
    }
  }
}

export class MockError extends Error {
  public readonly code: number
  public readonly data: string

  constructor(public readonly message: string) {
    super(message)

    this.code = 3
    this.data = encodeFunctionData({
      abi: [
        {
          name: 'Error',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [{ internalType: 'string', name: 'reason', type: 'string' }],
          outputs: [],
        },
      ],
      functionName: 'Error',
      args: [message],
    })
  }
}

function triggerHandler(handler: RpcHandler, trigger: TestTrigger): RpcHandler {
  return (method, params) => {
    const response = handler(method, params)

    if (response === undefined) {
      return undefined
    }

    return trigger.then(() => response)
  }
}

function forceCallErrorHandler(callHandler: RpcHandler, errorMsg: string): RpcHandler {
  return (method, params) => {
    const response = callHandler(method, params)

    if (response === undefined) {
      return undefined
    }

    throw new MockError(errorMsg)
  }
}

export const handlers = {
  blockNumberCall,
  blockCall,
  chainIdCall,
  balanceCall,
  contractCall,
  getLogsCall,
  contractCallError,
  mineTransaction,
  mineRevertedTransaction,
  rejectSubmittedTransaction,
  mineBatchTransaction,
  rejectSubmittedBatchTransaction,
  rejectSubmittedBatchTransactionStatusCheck,
  mineBatchTransactionWithRejectedSubtransaction,
  triggerHandler,
  forceCallErrorHandler,
}

export interface CreateBlockNumberCallHandlerResult {
  handler: RpcHandler
  incrementBlockNumber: () => void
}
export function createBlockNumberCallHandler(initialBlockNumber: bigint): CreateBlockNumberCallHandlerResult {
  let blockNumber = initialBlockNumber

  function incrementBlockNumber(): void {
    blockNumber++
  }

  // eslint-disable-next-line func-style
  const handler: RpcHandler = (method, params) => {
    return blockNumberCall(blockNumber)(method, params)
  }

  return { handler, incrementBlockNumber }
}

export interface CreateGetLogsHandlerResult {
  handler: RpcHandler
  setEnabled: (enabled: boolean) => void
}
export function createGetLogsHandler(opts: GetLogsCallOptions<AbiEvent>): CreateGetLogsHandlerResult {
  let enabled = false

  function setEnabled(value: boolean): void {
    enabled = value
  }

  // eslint-disable-next-line func-style
  const handler: RpcHandler = (method, params) => {
    if (!enabled) {
      if (method === 'eth_getLogs') {
        return []
      }

      return undefined
    }

    return getLogsCall(opts)(method, params)
  }

  return { handler, setEnabled }
}

export interface CreateUpdatableHandlerOptions {
  initialHandler: RpcHandler
}

export interface CreateUpdatableHandlerResult {
  handler: RpcHandler
  update: (newHandled: RpcHandler) => void
}

export function createUpdatableHandler(opts: CreateUpdatableHandlerOptions): CreateUpdatableHandlerResult {
  const { initialHandler } = opts
  let currentHandler = initialHandler

  function update(newHandler: RpcHandler): void {
    currentHandler = newHandler
  }

  // eslint-disable-next-line func-style
  const handler: RpcHandler = (method, params) => {
    return currentHandler(method, params)
  }

  return { handler, update }
}
