import { Hash } from '@sparkdotfi/common-universal'
import {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  Hex,
  PartialBy,
  PublicActions,
  WaitForTransactionReceiptReturnType,
  WalletClient,
  WriteContractParameters,
} from 'viem'

export interface TestnetClient extends WalletClient, PublicActions, TestnetClientHelperActions {
  setErc20Balance(tkn: Address, usr: Address, amount: bigint): Promise<void>
  setBalance(usr: Address, amount: bigint): Promise<void>
  setStorageAt(addr: Address, slot: Hash, value: string): Promise<void>
  setCode(addr: Address, code: Hex): Promise<void>
  snapshot(): Promise<string>
  revert(snapshotId: string): Promise<string> // @note: returns new snapshot id (may be the same as the input)
  mineBlocks(blocks: bigint): Promise<void>
  setNextBlockTimestamp(timestamp: bigint): Promise<void>
  setNextBlockBaseFee(baseFee: bigint): Promise<void>
}

export type TestnetClientHelperActions = {
  baselineSnapshot(): Promise<void> // @note: baseline snapshot can be created only once, useful to easily revert to a known state. Helper on top of the snapshot method
  revertToBaseline(): Promise<void> // @note: revert to the baseline snapshot, helper on top of the revert method
  hasBaselineSnapshot(): boolean

  assertWriteContract: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'payable' | 'nonpayable'>,
    args extends ContractFunctionArgs<abi, 'payable' | 'nonpayable', functionName>,
  >(
    args: PartialBy<WriteContractParameters<abi, functionName, args, undefined>, 'chain'>, // avoids requiring chain parameter
  ) => Promise<WaitForTransactionReceiptReturnType>

  assertSendTransaction: (
    args: PartialBy<Parameters<WalletClient['sendTransaction']>[0], 'chain'>,
  ) => Promise<WaitForTransactionReceiptReturnType>
}
