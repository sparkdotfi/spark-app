import { EModeCategoryId } from '@/domain/e-mode/types'
import {
  BorrowEligibilityStatus,
  CollateralEligibilityStatus,
  SupplyAvailabilityStatus,
} from '@/domain/market-info/reserve-status'
import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { CapAutomatorConfig } from '@/domain/cap-automator/types'
import { MarketSparkRewards } from '@/domain/spark-rewards/types'
import { InterestYieldChartProps } from './components/charts/interest-yield/InterestYieldChart'

export interface DssAutoline {
  maxDebtCeiling: NormalizedUnitNumber
  gap: NormalizedUnitNumber
  increaseCooldown: number
  lastUpdateBlock: number
  lastIncreaseTimestamp: number
}

export type CollateralStatusInfo = (
  | {
      status: Extract<CollateralEligibilityStatus, 'only-in-isolation-mode'>
      isolationModeInfo: {
        debt: NormalizedUnitNumber
        debtCeiling: NormalizedUnitNumber
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
    totalSupplied: NormalizedUnitNumber
    supplyCap?: NormalizedUnitNumber
    instantlyAvailableToSupply?: NormalizedUnitNumber
    apy: Percentage | undefined
    capAutomatorInfo?: CapAutomatorConfig
    sparkRewards: MarketSparkRewards[]
  }
  collateral: CollateralStatusInfo
  borrow: {
    hasSparkAirdrop: boolean
    status: BorrowEligibilityStatus
    totalBorrowed: NormalizedUnitNumber
    borrowLiquidity: NormalizedUnitNumber
    limitedByBorrowCap: boolean
    borrowCap?: NormalizedUnitNumber
    apy: Percentage | undefined
    reserveFactor: Percentage
    chartProps: InterestYieldChartProps
    capAutomatorInfo?: CapAutomatorConfig
    sparkRewards: MarketSparkRewards[]
  }
  lend?: {
    status: 'yes' // only for dai
    token: Token
    totalLent: NormalizedUnitNumber
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
        marketSize: NormalizedUnitNumber
        borrowed: NormalizedUnitNumber
        available: NormalizedUnitNumber
        utilizationRate: Percentage
      }
    | {
        type: 'dai'
        marketSize: NormalizedUnitNumber
        borrowed: NormalizedUnitNumber
        instantlyAvailable: NormalizedUnitNumber
        skyCapacity: NormalizedUnitNumber
        totalAvailable: NormalizedUnitNumber
        utilizationRate: Percentage
        dssAutoline: DssAutoline
      }
}

export interface WalletOverview {
  guestMode: boolean
  token: Token
  tokenBalance: NormalizedUnitNumber
  lend?: {
    available: NormalizedUnitNumber
    token: Token
  }
  deposit: {
    available: NormalizedUnitNumber
    token: Token
  }
  borrow: {
    eligibility: BorrowEligibilityStatus
    available: NormalizedUnitNumber
    token: Token
  }
}
