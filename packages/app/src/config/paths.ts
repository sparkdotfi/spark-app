import { ChainConfigEntry } from './chain/types'

export const paths = {
  easyBorrow: '/borrow',
  myPortfolio: '/my-portfolio',
  markets: '/markets',
  savings: '/',
  farms: '/farms',
  marketDetails: '/markets/:chainId/:asset',
  farmDetails: '/farms/:chainId/:address',
  sparkRewards: '/rewards',
  spkStaking: '/spk/staking',
} as const

export type Path = keyof typeof paths

export const pathGroups = {
  borrow: ['easyBorrow', 'myPortfolio', 'markets', 'marketDetails'],
  savings: ['savings'],
  farms: ['farms', 'farmDetails'],
  sparkRewards: ['sparkRewards'],
  sparkToken: ['spkStaking'],
} satisfies Record<'borrow' | 'savings' | 'farms' | 'sparkRewards' | 'sparkToken', Path[]>

export type PathGroup = keyof typeof pathGroups

export function getSupportedPages(chainConfigEntry: ChainConfigEntry): Path[] {
  return [
    ...(chainConfigEntry.markets ? pathGroups.borrow : []),
    ...(chainConfigEntry.savings ? pathGroups.savings : []),
    ...(chainConfigEntry.farms ? pathGroups.farms : []),
    ...(import.meta.env.VITE_DEV_SPARK_REWARDS === '1' ? pathGroups.sparkRewards : []),
    ...(import.meta.env.VITE_DEV_SPARK_TOKEN === '1' && chainConfigEntry.sparkToken ? pathGroups.sparkToken : []),
  ]
}
