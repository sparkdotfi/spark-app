import { farmAddresses } from '@/config/chain/constants'
import { FarmsInfo } from '@/domain/farms/farmsInfo'
import { Farm } from '@/domain/farms/types'
import { PotSavingsConverter } from '@/domain/savings-converters/PotSavingsConverter'
import { SavingsAccountRepository } from '@/domain/savings-converters/types'
import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { AssetInputSchema } from '@/features/dialogs/common/logic/form'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { bigNumberify } from '@sparkdotfi/common-universal'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { mainnet } from 'viem/chains'
import { UnstakeView } from './UnstakeView'

const dai = tokens.DAI
const sdai = tokens.sDAI
const usds = tokens.USDS
const susds = tokens.sUSDS
const usdc = tokens.USDC
const mockTokenRepository = new TokenRepository(
  [
    { token: dai, balance: NormalizedUnitNumber(100) },
    { token: sdai, balance: NormalizedUnitNumber(100) },
    { token: usds, balance: NormalizedUnitNumber(100) },
    { token: susds, balance: NormalizedUnitNumber(100) },
    { token: usdc, balance: NormalizedUnitNumber(100) },
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
  rewardToken: tokens.SKY,
  stakingToken: tokens.USDS,
  entryAssetsGroup: {
    type: 'stablecoins',
    name: 'Stablecoins',
    assets: [tokens.DAI.symbol, tokens.USDC.symbol],
  },
  rewardRate: NormalizedUnitNumber(100),
  earnedTimestamp: timestamp,
  periodFinish: timestamp * 5,
  totalSupply: NormalizedUnitNumber(123456),
  totalRewarded: NormalizedUnitNumber(12345),
  depositors: 1111,
  earned: NormalizedUnitNumber(52),
  staked: NormalizedUnitNumber(100),
  rewardType: 'token',
}

const mockedFarmsInfo = new FarmsInfo([farm])

const meta: Meta<typeof UnstakeView> = {
  title: 'Features/FarmDetails/Dialogs/Views/Unstake',
  component: (args) => {
    const form = useForm<AssetInputSchema>({
      defaultValues: {
        symbol: args.assetsFields.selectedAsset.token.symbol,
        value: args.assetsFields.selectedAsset.value,
        isMaxSelected: args.assetsFields.selectedAsset.value === args.assetsFields.maxValue?.toFixed(),
      },
    })
    return <UnstakeView {...args} form={form} />
  },
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    farm,
    selectableAssets: [
      {
        token: tokens.USDS,
        balance: NormalizedUnitNumber(50_000),
      },
      {
        token: tokens.DAI,
        balance: NormalizedUnitNumber(1),
      },
      {
        token: tokens.sDAI,
        balance: NormalizedUnitNumber(1),
      },
    ],
    assetsFields: {
      selectedAsset: {
        token: tokens.USDS,
        balance: NormalizedUnitNumber(50_000),
        value: '2000',
      },
      maxValue: NormalizedUnitNumber(50_000),
      maxSelectedFieldName: 'isMaxSelected',
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'unstake',
        token: tokens.USDS,
        amount: NormalizedUnitNumber(100),
        farm: farm.address,
        exit: false,
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    txOverview: {
      status: 'success',
      stakingToken: tokens.USDS,
      rewardToken: tokens.SKY,
      isExiting: false,
      earnedRewards: NormalizedUnitNumber(2311.34),
      routeToOutcomeToken: [
        { token: tokens.USDS, value: NormalizedUnitNumber(1300.74), usdValue: NormalizedUnitNumber(1300.74) },
        { token: tokens.USDC, value: NormalizedUnitNumber(1300.74), usdValue: NormalizedUnitNumber(1300.74) },
      ],
    },
    exitFarmSwitchInfo: {
      showSwitch: false,
      onSwitch: () => {},
      checked: false,
      reward: {
        token: tokens.SKY,
        value: NormalizedUnitNumber(2311.34),
      },
    },
    actionsContext: {
      tokenRepository: mockTokenRepository,
      savingsAccounts: mockSavingsAccounts,
      farmsInfo: mockedFarmsInfo,
    },
  },
}

export default meta
type Story = StoryObj<typeof UnstakeView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const WithExitFarmSwitch: Story = {
  args: {
    exitFarmSwitchInfo: {
      showSwitch: true,
      onSwitch: () => {},
      checked: true,
      reward: {
        token: tokens.SKY,
        value: NormalizedUnitNumber(2311.34),
      },
    },
    objectives: [
      {
        type: 'unstake',
        token: tokens.USDS,
        amount: NormalizedUnitNumber(100),
        farm: farm.address,
        exit: true,
      },
    ],
    assetsFields: {
      selectedAsset: {
        token: tokens.USDS,
        balance: NormalizedUnitNumber(50_000),
        value: '50000',
      },
      maxValue: NormalizedUnitNumber(50_000),
      maxSelectedFieldName: 'isMaxSelected',
      changeAsset: () => {},
    },
    txOverview: {
      status: 'success',
      stakingToken: tokens.USDS,
      rewardToken: tokens.SKY,
      isExiting: true,
      earnedRewards: NormalizedUnitNumber(2311.34),
      routeToOutcomeToken: [
        { token: tokens.USDS, value: NormalizedUnitNumber(1300.74), usdValue: NormalizedUnitNumber(1300.74) },
        { token: tokens.USDC, value: NormalizedUnitNumber(1300.74), usdValue: NormalizedUnitNumber(1300.74) },
      ],
    },
  },
}
export const WithExitFarmSwitchMobile = getMobileStory(WithExitFarmSwitch)
export const WithExitFarmSwitchTablet = getTabletStory(WithExitFarmSwitch)
export const WithExitFarmSwitchZeroApy: Story = {
  args: {
    exitFarmSwitchInfo: {
      showSwitch: true,
      onSwitch: () => {},
      checked: true,
      reward: {
        token: tokens.SKY.clone({ unitPriceUsd: NormalizedUnitNumber.ZERO }),
        value: NormalizedUnitNumber(2311.34),
      },
    },
  },
}

export const WithExitFarmSwitchUnchecked: Story = {
  args: {
    exitFarmSwitchInfo: {
      showSwitch: true,
      onSwitch: () => {},
      checked: false,
      reward: {
        token: tokens.SKY,
        value: NormalizedUnitNumber(2311.34),
      },
    },
    assetsFields: {
      selectedAsset: {
        token: tokens.USDS,
        balance: NormalizedUnitNumber(50_000),
        value: '50000',
      },
      maxValue: NormalizedUnitNumber(50_000),
      maxSelectedFieldName: 'isMaxSelected',
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'unstake',
        token: tokens.USDS,
        amount: NormalizedUnitNumber(100),
        farm: farm.address,
        exit: false,
      },
    ],
  },
}
export const WithExitFarmSwitchUncheckedMobile = getMobileStory(WithExitFarmSwitch)
export const WithExitFarmSwitchUncheckedTablet = getTabletStory(WithExitFarmSwitch)

export const NoApiData: Story = {
  args: {
    farm: {
      ...farm,
      apy: undefined,
      totalRewarded: undefined,
      depositors: undefined,
      rewardToken: tokens.SKY.clone({ unitPriceUsd: NormalizedUnitNumber.ZERO }),
    },
  },
}
export const NoApiDataMobile = getMobileStory(NoApiData)
export const NoApiDataTablet = getTabletStory(NoApiData)

export const NoApiDataMaxValue: Story = {
  args: {
    farm: {
      ...farm,
      apy: undefined,
      totalRewarded: undefined,
      depositors: undefined,
      rewardToken: tokens.SKY.clone({ unitPriceUsd: NormalizedUnitNumber.ZERO }),
    },
    exitFarmSwitchInfo: {
      showSwitch: true,
      onSwitch: () => {},
      checked: false,
      reward: {
        token: tokens.SKY.clone({ unitPriceUsd: NormalizedUnitNumber.ZERO }),
        value: NormalizedUnitNumber(2311.34),
      },
    },
    txOverview: {
      status: 'success',
      stakingToken: tokens.USDS,
      rewardToken: tokens.SKY.clone({ unitPriceUsd: NormalizedUnitNumber.ZERO }),
      isExiting: false,
      earnedRewards: NormalizedUnitNumber(2311.34),
      routeToOutcomeToken: [
        { token: tokens.USDS, value: NormalizedUnitNumber(1300.74), usdValue: NormalizedUnitNumber(1300.74) },
        { token: tokens.USDC, value: NormalizedUnitNumber(1300.74), usdValue: NormalizedUnitNumber(1300.74) },
      ],
    },
    assetsFields: {
      selectedAsset: {
        token: tokens.USDS,
        balance: NormalizedUnitNumber(50_000),
        value: '50000',
      },
      maxValue: NormalizedUnitNumber(50_000),
      maxSelectedFieldName: 'isMaxSelected',
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'unstake',
        token: tokens.USDS,
        amount: NormalizedUnitNumber(100),
        farm: farm.address,
        exit: false,
      },
    ],
  },
}
export const NoApiDataMaxValueMobile = getMobileStory(NoApiDataMaxValue)
export const NoApiDataMaxValueTablet = getTabletStory(NoApiDataMaxValue)
