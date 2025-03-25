import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { Percentage } from '@sparkdotfi/common-universal'

export type AccountType = 'susds' | 'susdc' | 'sdai'

export type PsmSupplier = 'sky' | 'spark'

export interface AccountMetadata {
  description: string
  descriptionDocsLink: string
  apyExplainer: string
  apyExplainerDocsLink: string
}

export interface AccountSparkRewardsSummary {
  totalApy: Percentage
  rewards: {
    rewardTokenSymbol: TokenSymbol
    longDescription: string
  }[]
}
