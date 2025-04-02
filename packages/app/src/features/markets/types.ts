import { Incentive } from '@/domain/market-info/incentives'
import {
  BorrowEligibilityStatus,
  CollateralEligibilityStatus,
  ReserveStatus,
  SupplyAvailabilityStatus,
} from '@/domain/market-info/reserve-status'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

export interface MarketStatus {
  supplyAvailabilityStatus: SupplyAvailabilityStatus
  collateralEligibilityStatus: CollateralEligibilityStatus
  borrowEligibilityStatus: BorrowEligibilityStatus
}

export interface MarketEntry {
  token: Token
  reserveStatus: ReserveStatus
  totalSupplied: NormalizedNumber
  depositApyDetails: ApyDetails
  totalBorrowed: NormalizedNumber
  borrowApyDetails: ApyDetails
  marketStatus: MarketStatus
}

export interface ApyDetails {
  baseApy: Percentage | undefined
  airdrops?: TokenSymbol[]
  legacyRewards?: Incentive[]
  sparkRewards?: MarketSparkRewards[]
}
