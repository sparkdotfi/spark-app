import { EModeCategoryId } from '@/domain/e-mode/types'
import {
  BorrowEligibilityStatus,
  CollateralEligibilityStatus,
  SupplyAvailabilityStatus,
} from '@/domain/market-info/reserve-status'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

import { CapAutomatorConfig } from '@/domain/cap-automator/types'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { InterestYieldChartProps } from './components/charts/interest-yield/InterestYieldChart'

export interface DssAutoline {
  maxDebtCeiling: NormalizedNumber
  gap: NormalizedNumber
  increaseCooldown: number
  lastUpdateBlock: number
  lastIncreaseTimestamp: number
}

export type CollateralStatusInfo = (
  | {
      status: Extract<CollateralEligibilityStatus, 'only-in-isolation-mode'>
      isolationModeInfo: {
        debt: NormalizedNumber
        debtCeiling: NormalizedNumber
      }
    }
  | {
      status: Exclude<CollateralEligibilityStatus, 'only-in-isolation-mode'>
    }
) & {
  token: Token
  maxLtv: Percentage
  liquidationThreshold: Percentage
  liquidationPenalty: Percentage
}
export interface MarketOverview {
  supply?: {
    hasSparkAirdrop: boolean
    status: SupplyAvailabilityStatus
    totalSupplied: NormalizedNumber
    supplyCap?: NormalizedNumber
    instantlyAvailableToSupply?: NormalizedNumber
    apy: Percentage | undefined
    capAutomatorInfo?: CapAutomatorConfig
    sparkRewards: MarketSparkRewards[]
  }
  collateral: CollateralStatusInfo
  borrow: {
    hasSparkAirdrop: boolean
    status: BorrowEligibilityStatus
    totalBorrowed: NormalizedNumber
    borrowLiquidity: NormalizedNumber
    limitedByBorrowCap: boolean
    borrowCap?: NormalizedNumber
    apy: Percentage | undefined
    reserveFactor: Percentage
    chartProps: InterestYieldChartProps
    capAutomatorInfo?: CapAutomatorConfig
    sparkRewards: MarketSparkRewards[]
  }
  lend?: {
    status: 'yes' // only for dai
    token: Token
    totalLent: NormalizedNumber
    apy: Percentage | undefined
    sparkRewards: MarketSparkRewards[]
  }
  eMode?: {
    maxLtv: Percentage
    liquidationThreshold: Percentage
    liquidationPenalty: Percentage
    categoryId: EModeCategoryId
    eModeCategoryTokens: TokenSymbol[]
    token?: Token
  }
  summary:
    | {
        type: 'default'
        marketSize: NormalizedNumber
        borrowed: NormalizedNumber
        available: NormalizedNumber
        utilizationRate: Percentage
      }
    | {
        type: 'dai'
        marketSize: NormalizedNumber
        borrowed: NormalizedNumber
        instantlyAvailable: NormalizedNumber
        skyCapacity: NormalizedNumber
        totalAvailable: NormalizedNumber
        utilizationRate: Percentage
        dssAutoline: DssAutoline
      }
}

export interface WalletOverview {
  guestMode: boolean
  token: Token
  tokenBalance: NormalizedNumber
  lend?: {
    available: NormalizedNumber
    token: Token
  }
  deposit: {
    available: NormalizedNumber
    token: Token
  }
  borrow: {
    eligibility: BorrowEligibilityStatus
    available: NormalizedNumber
    token: Token
  }
}
