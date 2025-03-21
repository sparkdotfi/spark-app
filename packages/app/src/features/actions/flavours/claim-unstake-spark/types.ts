import { Token } from '@/domain/types/Token'

export interface ClaimUnstakeSparkObjective {
  type: 'claimUnstakeSpark'
  spk: Token
  epochs: number[]
}

export interface ClaimUnstakeSparkAction {
  type: 'claimUnstakeSpark'
  spk: Token
  epochs: number[]
}
