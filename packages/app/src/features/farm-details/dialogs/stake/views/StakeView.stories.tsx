import { farmAddresses } from '@/config/chain/constants'
import { FarmsInfo } from '@/domain/farms/farmsInfo'
import { Farm } from '@/domain/farms/types'
import { PotSavingsConverter } from '@/domain/savings-converters/PotSavingsConverter'
import { SavingsAccountRepository } from '@/domain/savings-converters/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { mainnet } from 'viem/chains'
import { StakeView } from './StakeView'

const dai = tokens.DAI
const sdai = tokens.sDAI
const usds = tokens.USDS
const susds = tokens.sUSDS
const usdc = tokens.USDC
const mockTokenRepository = new TokenRepository(
  [
    { token: dai, balance: NormalizedNumber(100) },
    { token: sdai, balance: NormalizedNumber(100) },
    { token: usds, balance: NormalizedNumber(100) },
    { token: susds, balance: NormalizedNumber(100) },
    { token: usdc, balance: NormalizedNumber(100) },
  ],
  {
    DAI: dai.symbol,
    sDAI: sdai.symbol,
    USDS: usds.symbol,
    sUSDS: susds.symbol,
  },
)

const timestamp = 1000
const mockSavingsDaiInfo = new PotSavingsConverter({
  potParams: {
    dsr: bigNumberify('1000001103127689513476993127'), // 10% / day
    rho: bigNumberify(timestamp),
    chi: bigNumberify('1000000000000000000000000000'), // 1
  },
  currentTimestamp: timestamp + 24 * 60 * 60,
})

const mockSavingsUsdsInfo = new PotSavingsConverter({
  potParams: {
    dsr: bigNumberify('1200001103127689513476993127'), // 12% / day
    rho: bigNumberify(timestamp),
    chi: bigNumberify('1000000000000000000000000000'), // 1
  },
  currentTimestamp: timestamp + 24 * 60 * 60,
})

const mockSavingsAccounts = new SavingsAccountRepository([
  {
    converter: mockSavingsDaiInfo,
    savingsToken: sdai,
    underlyingToken: dai,
  },
  {
    converter: mockSavingsUsdsInfo,
    savingsToken: susds,
    underlyingToken: usds,
  },
])

const farm: Farm = {
  address: farmAddresses[mainnet.id].skyUsds,
  apy: Percentage(0.05),
  name: 'SKY Farm',
  rewardType: 'token',
  rewardToken: tokens.SKY,
  stakingToken: tokens.USDS,
  entryAssetsGroup: {
    type: 'stablecoins',
    name: 'Stablecoins',
    assets: [tokens.DAI.symbol, tokens.USDC.symbol],
  },
  rewardRate: NormalizedNumber(100),
  earnedTimestamp: timestamp,
  periodFinish: timestamp * 5,
  totalSupply: NormalizedNumber(123456),
  totalRewarded: NormalizedNumber(12345),
  depositors: 1111,
  earned: NormalizedNumber(52),
  staked: NormalizedNumber(100),
}

const mockedFarmsInfo = new FarmsInfo([farm])

const meta: Meta<typeof StakeView> = {
  title: 'Features/FarmDetails/Dialogs/Views/Stake',
  component: (args) => {
    const form = useForm() as any
    return <StakeView {...args} form={form} />
  },
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    farm,
    selectableAssets: [
      {
        token: tokens.USDS,
        balance: NormalizedNumber(50000),
      },
      {
        token: tokens.DAI,
        balance: NormalizedNumber(1),
      },
      {
        token: tokens.sDAI,
        balance: NormalizedNumber(1),
      },
    ],
    assetsFields: {
      selectedAsset: {
        token: tokens.USDS,
        balance: NormalizedNumber(50000),
        value: '2000',
      },
      maxValue: NormalizedNumber(50000),
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'stake',
        token: tokens.USDS,
        amount: NormalizedNumber(100),
        farm: farm.address,
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    txOverview: {
      status: 'success',
      showEstimatedRewards: true,
      apy: Percentage(0.05),
      stakingToken: tokens.USDS,
      rewardToken: tokens.SKY,
      rewardsPerYear: NormalizedNumber(542),
      routeToStakingToken: [
        { token: tokens.USDC, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
        { token: tokens.USDS, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
      ],
    },
    actionsContext: {
      tokenRepository: mockTokenRepository,
      farmsInfo: mockedFarmsInfo,
      savingsAccounts: mockSavingsAccounts,
    },
    sacrificesYield: false,
  },
}

export default meta
type Story = StoryObj<typeof StakeView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const SacrificeYield: Story = {
  args: {
    sacrificesYield: true,
    assetsFields: {
      selectedAsset: {
        token: tokens.sDAI,
        balance: NormalizedNumber(50000),
        value: '2000',
      },
      maxValue: NormalizedNumber(50000),
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'stake',
        token: tokens.sDAI,
        amount: NormalizedNumber(100),
        farm: farm.address,
      },
    ],
    txOverview: {
      status: 'success',
      apy: Percentage(0.05),
      showEstimatedRewards: true,
      stakingToken: tokens.USDS,
      rewardToken: tokens.SKY,
      rewardsPerYear: NormalizedNumber(542),
      routeToStakingToken: [
        { token: tokens.sDAI, value: NormalizedNumber(1180.74), usdValue: NormalizedNumber(1300.74) },
        { token: tokens.USDS, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
      ],
    },
  },
}
export const SacrificeYieldMobile = getMobileStory(SacrificeYield)
export const SacrificeYieldTablet = getTabletStory(SacrificeYield)

export const DesktopZeroApy: Story = {
  args: {
    txOverview: {
      status: 'success',
      apy: Percentage(0),
      showEstimatedRewards: true,
      stakingToken: tokens.USDS,
      rewardToken: tokens.SKY,
      rewardsPerYear: NormalizedNumber(542),
      routeToStakingToken: [
        { token: tokens.USDC, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
        { token: tokens.USDS, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
      ],
    },
  },
}
