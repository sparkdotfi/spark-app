import { SavingsConverter } from '@/domain/savings-converters/types'
import { EnsName } from '@/domain/types/EnsName'
import { Token } from '@/domain/types/Token'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'

export interface Reward {
  token: Token
  amount: NormalizedNumber
}

export interface SupportedChain {
  id: number
  name: string
}

export interface ConnectedWalletInfo {
  dropdownTriggerInfo: WalletDropdownTriggerInfo
  dropdownContentInfo: WalletDropdownContentInfo
}

export interface WalletDropdownTriggerInfo {
  mode: 'sandbox' | 'connected'
  avatar: string
  address: CheckedAddress
  ensName?: EnsName
}

export interface WalletDropdownContentInfo {
  walletIcon: string
  address: CheckedAddress
  onDisconnect: () => void
  blockExplorerAddressLink: string | undefined
}

export interface SavingsConverterQueryResults {
  data: SavingsConverter | null | undefined
  isLoading: boolean
}

export type Airdrop = {
  tokenReward: NormalizedNumber
  tokenRatePerSecond: NormalizedNumber
  timestampInMs: number
  tokenRatePrecision: number
  refreshIntervalInMs: number
}
export interface AirdropInfo {
  airdrop: Airdrop | undefined
  isLoading: boolean
  isError: boolean
}

export interface RewardsInfo {
  rewards: Reward[]
  totalClaimableReward: NormalizedNumber
  onClaim: () => void
}

export interface SparkRewardsSummary {
  totalUsdAmount?: NormalizedNumber
}
