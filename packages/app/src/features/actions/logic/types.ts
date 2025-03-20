import { FarmsInfo } from '@/domain/farms/farmsInfo'
import { WalletType } from '@/domain/hooks/useWalletType'
import { WriteErrorKind } from '@/domain/hooks/useWrite'
import { MarketInfo } from '@/domain/market-info/marketInfo'
import { SavingsAccountRepository } from '@/domain/savings-converters/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { QueryKey, UseQueryOptions, UseQueryResult } from '@tanstack/react-query'
import { Address, ContractFunctionParameters, TransactionReceipt } from 'viem'
import { Config } from 'wagmi'
import { ApproveDelegationAction } from '../flavours/approve-delegation/types'
import { ApproveAction } from '../flavours/approve/types'
import { BorrowAction, BorrowObjective } from '../flavours/borrow/types'
import { ClaimFarmRewardsAction, ClaimFarmRewardsObjective } from '../flavours/claim-farm-rewards/types'
import { ClaimMarketRewardsAction, ClaimMarketRewardsObjective } from '../flavours/claim-market-rewards/types'
import { ClaimSparkRewardsAction, ClaimSparkRewardsObjective } from '../flavours/claim-spark-rewards/types'
import { ConvertStablesObjective } from '../flavours/convert-stables/types'
import { DepositToSavingsAction, DepositToSavingsObjective } from '../flavours/deposit-to-savings/types'
import { DepositAction, DepositObjective } from '../flavours/deposit/types'
import { DowngradeAction, DowngradeObjective } from '../flavours/downgrade/types'
import { PermitAction } from '../flavours/permit/types'
import { PsmConvertAction } from '../flavours/psm-convert/types'
import { RepayAction, RepayObjective } from '../flavours/repay/types'
import { SetUseAsCollateralAction, SetUseAsCollateralObjective } from '../flavours/set-use-as-collateral/types'
import { SetUserEModeAction, SetUserEModeObjective } from '../flavours/set-user-e-mode/logic/types'
import { StakeSparkAction, StakeSparkObjective } from '../flavours/stake-spark/types'
import { StakeAction, StakeObjective } from '../flavours/stake/types'
import { UnstakeSparkAction, UnstakeSparkObjective } from '../flavours/unstake-spark/types'
import { UnstakeAction, UnstakeObjective } from '../flavours/unstake/types'
import { UpgradeAction, UpgradeObjective } from '../flavours/upgrade/types'
import { WithdrawFromSavingsAction, WithdrawFromSavingsObjective } from '../flavours/withdraw-from-savings/types'
import { WithdrawAction, WithdrawObjective } from '../flavours/withdraw/types'
import { PermitStore } from './permits'
import { BatchWriteErrorKind } from './useBatchWrite'

/**
 * Objective is an input to action component. It is a high level description of what user wants to do.
 * Single objective usually maps to multiple actions. For example: DepositObjective maps to Approve/Permit and Deposit actions.
 */
export type Objective =
  | DepositObjective
  | BorrowObjective
  | WithdrawObjective
  | RepayObjective
  | SetUseAsCollateralObjective
  | SetUserEModeObjective
  | ClaimMarketRewardsObjective
  | WithdrawFromSavingsObjective
  | DepositToSavingsObjective
  | UpgradeObjective
  | DowngradeObjective
  | StakeObjective
  | UnstakeObjective
  | ClaimFarmRewardsObjective
  | ConvertStablesObjective
  | ClaimSparkRewardsObjective
  | StakeSparkObjective
  | UnstakeSparkObjective
export type ObjectiveType = Objective['type']

export type Action =
  | ApproveAction
  | PermitAction
  | DepositAction
  | ApproveDelegationAction
  | BorrowAction
  | WithdrawAction
  | RepayAction
  | SetUseAsCollateralAction
  | SetUserEModeAction
  | ClaimMarketRewardsAction
  | WithdrawFromSavingsAction
  | DepositToSavingsAction
  | UpgradeAction
  | DowngradeAction
  | StakeAction
  | UnstakeAction
  | PsmConvertAction
  | ClaimFarmRewardsAction
  | ClaimSparkRewardsAction
  | StakeSparkAction
  | UnstakeSparkAction
export type ActionType = Action['type']

type BaseActionHandlerState<ErrorKind extends string> =
  | { status: 'disabled' }
  | { status: 'ready' }
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'error'; errorKind?: ErrorKind; message: string }

export type ActionHandlerState = BaseActionHandlerState<'initial-params' | WriteErrorKind | 'tx-verify'>
export type BatchActionHandlerState = BaseActionHandlerState<BatchWriteErrorKind>

export interface ActionHandler {
  action: Action
  state: ActionHandlerState
  onAction: () => void
}

export interface BatchActionHandler {
  actions: Action[]
  state: BatchActionHandlerState
  onAction: () => void
}

export interface ActionContext extends InjectedActionsContext {
  txReceipts: [Action, TransactionReceipt][]
  wagmiConfig: Config
  account: Address
  chainId: number
  permitStore?: PermitStore
}

export type InitialParamsBase = { canBeSkipped: boolean }
export type VerifyTransactionResultBase = { success: boolean }

type InitialParamsQueryOptions = UseQueryOptions<any, Error, InitialParamsBase, QueryKey>
export type InitialParamsQueryResult = UseQueryResult<InitialParamsBase>
type VerifyTransactionQueryOptions = UseQueryOptions<any, Error, VerifyTransactionResultBase, QueryKey>
export type VerifyTransactionResult = UseQueryResult<VerifyTransactionResultBase>
export type GetWriteConfigResult = ContractFunctionParameters

export interface ActionConfig {
  initialParamsQueryOptions?: () => InitialParamsQueryOptions
  getWriteConfig: (initialParams?: InitialParamsQueryResult) => GetWriteConfigResult
  verifyTransactionQueryOptions?: () => VerifyTransactionQueryOptions
  invalidates: () => QueryKey[]
  beforeWriteCheck?: () => void
  onSuccessfulAction?: () => void
}

export interface InjectedActionsContext {
  marketInfo?: MarketInfo
  tokenRepository?: TokenRepository
  farmsInfo?: FarmsInfo
  savingsAccounts?: SavingsAccountRepository
  walletType?: WalletType
}
