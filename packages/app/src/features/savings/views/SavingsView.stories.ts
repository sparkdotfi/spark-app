import { MY_EARNINGS_TIMEFRAMES } from '@/domain/savings-charts/useMyEarningsInfo/common'
import { UseMyEarningsInfoResult } from '@/domain/savings-charts/useMyEarningsInfo/useMyEarningsInfo'
import { SAVINGS_RATE_TIMEFRAMES } from '@/domain/savings-charts/useSavingsRateInfo/common'
import { UseSavingsRateInfoResult } from '@/domain/savings-charts/useSavingsRateInfo/useSavingsRateInfo'
import { links } from '@/ui/constants/links'
import { WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import {
  mockEarningsChartData,
  mockEarningsPredictionsChartData,
} from '../components/savings-charts/fixtures/mockEarningsChartData'
import { mockDsrChartData, mockSsrChartData } from '../components/savings-charts/fixtures/mockSavingsRateChartData'
import { AccountDefinition, InterestData, ShortAccountDefinition } from '../logic/useSavings'
import { SavingsView, SavingsViewProps } from './SavingsView'

const myEarningsInfo = {
  queryResult: {
    data: {
      data: mockEarningsChartData,
      predictions: mockEarningsPredictionsChartData,
    },
    isError: false,
    isPending: false,
    error: null,
  },
  shouldDisplayMyEarnings: true,
  selectedTimeframe: '1M',
  setSelectedTimeframe: () => {},
  availableTimeframes: MY_EARNINGS_TIMEFRAMES,
} satisfies UseMyEarningsInfoResult

const savingsSsrRateInfo = {
  queryResult: {
    data: {
      apy: mockSsrChartData,
    },
    isError: false,
    isPending: false,
    error: null,
  },
  selectedTimeframe: '1M',
  setSelectedTimeframe: () => {},
  availableTimeframes: SAVINGS_RATE_TIMEFRAMES,
} satisfies UseSavingsRateInfoResult

const savingsDsrRateInfo = {
  queryResult: {
    data: {
      apy: mockDsrChartData,
    },
    isError: false,
    isPending: false,
    error: null,
  },
  selectedTimeframe: '1M',
  setSelectedTimeframe: () => {},
  availableTimeframes: SAVINGS_RATE_TIMEFRAMES,
} satisfies UseSavingsRateInfoResult

const chartsData = {
  selectedTimeframe: '1M' as const,
  setSelectedTimeframe: () => {},
  myEarningsInfo,
  savingsRateInfo: savingsSsrRateInfo,
  chartsSupported: true,
}

const migrationInfo = {
  daiSymbol: tokens.DAI.symbol,
  usdsSymbol: tokens.USDS.symbol,
  daiToUsdsUpgradeAvailable: true,
  sdaiToSusdsUpgradeAvailable: true,
  apyImprovement: Percentage(0.01),
  openDaiToUsdsUpgradeDialog: () => {},
  openUsdsToDaiDowngradeDialog: () => {},
  openSDaiToSUsdsUpgradeDialog: () => {},
}

const interestData = {
  APY: Percentage(0.12),
  balanceRefreshIntervalInMs: 50,
  oneYearProjection: NormalizedNumber(1250),
  sparkRewardsOneYearProjection: NormalizedNumber.ZERO,
  calculateUnderlyingTokenBalance: () => ({
    depositedAssets: NormalizedNumber(10365.7654),
    depositedAssetsPrecision: 2,
  }),
} satisfies InterestData

const savingsUsdsAccountDefinition = {
  savingsToken: tokens.sUSDS,
  savingsTokenBalance: NormalizedNumber(10_000),
  underlyingToken: tokens.USDS,
  supportedStablecoins: [
    {
      token: tokens.DAI,
      balance: NormalizedNumber(2245.43),
      blockExplorerLink: '/',
    },
    {
      token: tokens.USDC,
      balance: NormalizedNumber(1002.01),
      blockExplorerLink: '/',
    },
    {
      token: tokens.USDS,
      balance: NormalizedNumber(10_000),
      blockExplorerLink: '/',
    },
  ],
  mostValuableAsset: { token: tokens.USDS, balance: NormalizedNumber(10_000) },
  chartsData,
  showConvertDialogButton: true,
  interestData,
  metadata: {
    description:
      'Deposit your stablecoins into USDS Savings to tap into the Sky Savings Rate, which grants you a predictable APY in USDS.',
    apyExplainer:
      'Current annual interest in the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.susds,
    descriptionDocsLink: links.docs.savings.susds,
  },
  sparkRewardsSummary: {
    totalApy: Percentage(0),
    rewards: [],
  },
} satisfies AccountDefinition

const shortSavingsUsdsAccountDefinition = {
  savingsToken: tokens.sUSDS,
  underlyingToken: tokens.USDS,
  underlyingTokenDeposit: NormalizedNumber(10_365.7654),
} satisfies ShortAccountDefinition

const savingsUsdcAccountDefinition = {
  savingsToken: tokens.sUSDC,
  savingsTokenBalance: NormalizedNumber(10_000),
  underlyingToken: tokens.USDC,
  supportedStablecoins: [
    {
      token: tokens.USDC,
      balance: NormalizedNumber(10_000),
      blockExplorerLink: '/',
    },
  ],
  mostValuableAsset: { token: tokens.USDC, balance: NormalizedNumber(10_000) },
  chartsData,
  showConvertDialogButton: true,
  interestData,
  metadata: {
    description:
      'Deposit your stablecoins into USDC Savings to tap into the Sky Savings Rate, which grants you a predictable APY in USDC.',
    apyExplainer:
      'Current annual interest in the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.susdc,
    descriptionDocsLink: links.docs.savings.susdc,
  },
  sparkRewardsSummary: {
    totalApy: Percentage(0),
    rewards: [],
  },
} satisfies AccountDefinition

const shortSavingsUsdcAccountDefinition = {
  savingsToken: tokens.sUSDC,
  underlyingToken: tokens.USDC,
  underlyingTokenDeposit: NormalizedNumber(10_365.7654),
} satisfies ShortAccountDefinition

const savingsDaiAccountDefinition = {
  savingsToken: tokens.sDAI,
  savingsTokenBalance: NormalizedNumber(20_000),
  underlyingToken: tokens.DAI,
  supportedStablecoins: [
    {
      token: tokens.DAI,
      balance: NormalizedNumber(12_000),
      blockExplorerLink: '/',
    },
    {
      token: tokens.USDS,
      balance: NormalizedNumber(10_000),
      blockExplorerLink: '/',
    },
    {
      token: tokens.USDC,
      balance: NormalizedNumber(1002.01),
      blockExplorerLink: '/',
    },
  ],
  mostValuableAsset: { token: tokens.DAI, balance: NormalizedNumber(12_000) },
  chartsData: {
    ...chartsData,
    savingsRateInfo: savingsDsrRateInfo,
  },
  showConvertDialogButton: true,
  migrationInfo,
  interestData,
  metadata: {
    description:
      'Deposit your stablecoins into DAI Savings to tap into the Sky Savings Rate, which grants you a predictable APY in DAI.',
    apyExplainer:
      'Current annual interest rate for DAI deposited into the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.sdai,
    descriptionDocsLink: links.docs.savings.sdai,
  },
  sparkRewardsSummary: {
    totalApy: Percentage(0),
    rewards: [],
  },
} satisfies AccountDefinition

const shortSavingsDaiAccountDefinition = {
  savingsToken: tokens.sDAI,
  underlyingToken: tokens.DAI,
  underlyingTokenDeposit: NormalizedNumber(22_245.43),
} satisfies ShortAccountDefinition

const savingsViewSusdsArgs = {
  selectedAccount: savingsUsdsAccountDefinition,
  setSelectedAccount: () => {},
  openDepositDialog: () => {},
  openConvertStablesDialog: () => {},
  openSendDialog: () => {},
  openWithdrawDialog: () => {},
  openConnectModal: () => {},
  openSandboxModal: () => {},
  guestMode: false,
  isInSandbox: false,
  allAccounts: [shortSavingsUsdcAccountDefinition, shortSavingsUsdsAccountDefinition, shortSavingsDaiAccountDefinition],
  generalStats: {
    data: {
      tvl: NormalizedNumber(2_320_691_847),
      getLiquidityCap: () => undefined,
      users: 4_967,
    },
    isPending: false,
    isError: false,
    error: null,
  },
  psmSupplier: 'sky',
} satisfies SavingsViewProps

const meta: Meta<typeof SavingsView> = {
  title: 'Features/Savings/Views/SavingsView',
  component: SavingsView,
  decorators: [WithTooltipProvider(), withRouter()],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof SavingsView>

export const Usds: Story = { args: savingsViewSusdsArgs }
export const UsdsMobile = getMobileStory(Usds)
export const UsdsTablet = getTabletStory(Usds)

export const Dai: Story = {
  args: {
    ...savingsViewSusdsArgs,
    selectedAccount: {
      ...savingsDaiAccountDefinition,
      interestData: {
        ...interestData,
        oneYearProjection: NormalizedNumber(2548.827),
        calculateUnderlyingTokenBalance: () => ({
          depositedAssets: NormalizedNumber(22_249.7654),
          depositedAssetsPrecision: 2,
        }),
      },
    },
  } satisfies SavingsViewProps,
}
export const DaiMobile = getMobileStory(Dai)
export const DaiTablet = getTabletStory(Dai)

export const DaiNoDeposit: Story = {
  args: {
    ...savingsViewSusdsArgs,
    selectedAccount: {
      ...savingsDaiAccountDefinition,
      savingsTokenBalance: NormalizedNumber.ZERO,
    },
  } satisfies SavingsViewProps,
}
export const DaiNoDepositMobile = getMobileStory(DaiNoDeposit)
export const DaiNoDepositTablet = getTabletStory(DaiNoDeposit)

export const Usdc: Story = {
  args: {
    ...savingsViewSusdsArgs,
    generalStats: {
      data: {
        tvl: NormalizedNumber(2_320_691_847),
        getLiquidityCap: () => NormalizedNumber(4_234_221_093),
        users: 4_967,
      },
      isPending: false,
      isError: false,
      error: null,
    },
    selectedAccount: savingsUsdcAccountDefinition,
  } satisfies SavingsViewProps,
}
export const UsdcMobile = getMobileStory(Usdc)
export const UsdcTablet = getTabletStory(Usdc)

export const NoDeposit: Story = {
  args: {
    ...savingsViewSusdsArgs,
    allAccounts: [
      shortSavingsUsdcAccountDefinition,
      { ...shortSavingsUsdsAccountDefinition, underlyingTokenDeposit: NormalizedNumber.ZERO },
      shortSavingsDaiAccountDefinition,
    ],
    selectedAccount: {
      ...savingsUsdsAccountDefinition,
      savingsTokenBalance: NormalizedNumber.ZERO,
    },
  } satisfies SavingsViewProps,
}
export const NoDepositMobile = getMobileStory(NoDeposit)
export const NoDepositTablet = getTabletStory(NoDeposit)

export const AllIn: Story = {
  args: {
    ...savingsViewSusdsArgs,
    selectedAccount: {
      ...savingsUsdsAccountDefinition,
      supportedStablecoins: [
        {
          token: tokens.DAI,
          balance: NormalizedNumber.ZERO,
          blockExplorerLink: '/',
        },
        {
          token: tokens.USDS,
          balance: NormalizedNumber.ZERO,
          blockExplorerLink: '/',
        },
        {
          token: tokens.USDC,
          balance: NormalizedNumber.ZERO,
          blockExplorerLink: '/',
        },
      ],
      mostValuableAsset: { token: tokens.USDS, balance: NormalizedNumber.ZERO },
    },
  } satisfies SavingsViewProps,
}
export const AllInMobile = getMobileStory(AllIn)
export const AllInTablet = getTabletStory(AllIn)

export const BigNumbers: Story = {
  args: {
    ...savingsViewSusdsArgs,
    allAccounts: [
      { ...shortSavingsUsdcAccountDefinition, underlyingTokenDeposit: NormalizedNumber(134_395_765) },
      shortSavingsUsdsAccountDefinition,
      shortSavingsDaiAccountDefinition,
    ],
    selectedAccount: {
      ...savingsUsdcAccountDefinition,
      savingsTokenBalance: NormalizedNumber(110_000_000),
      interestData: {
        ...interestData,
        oneYearProjection: NormalizedNumber(6345543.32945601),
        calculateUnderlyingTokenBalance: () => ({
          depositedAssets: NormalizedNumber('134395765.123482934245'),
          depositedAssetsPrecision: 0,
        }),
      },
      supportedStablecoins: [
        {
          token: tokens.DAI,
          balance: NormalizedNumber(232134925.90911123),
          blockExplorerLink: '/',
        },
        {
          token: tokens.USDT,
          balance: NormalizedNumber(601234014.134234),
          blockExplorerLink: '/',
        },
        {
          token: tokens.USDC,
          balance: NormalizedNumber(12312.90345),
          blockExplorerLink: '/',
        },
      ],
      mostValuableAsset: { token: tokens.USDS, balance: NormalizedNumber(601234014.134234) },
    },
  } satisfies SavingsViewProps,
}
export const BigNumbersMobile = getMobileStory(BigNumbers)
export const BigNumbersTablet = getTabletStory(BigNumbers)

export const ChartsNotSupported: Story = {
  args: {
    ...savingsViewSusdsArgs,
    selectedAccount: {
      ...savingsUsdsAccountDefinition,
      chartsData: {
        ...chartsData,
        chartsSupported: false,
      },
    },
  } satisfies SavingsViewProps,
}
export const ChartsNotSupportedMobile = getMobileStory(ChartsNotSupported)
export const ChartsNotSupportedTablet = getTabletStory(ChartsNotSupported)

export const InSandbox: Story = {
  args: {
    ...NoDeposit.args,
    isInSandbox: true,
  },
}
export const InSandboxMobile = getMobileStory(InSandbox)
export const InSandboxTablet = getTabletStory(InSandbox)

export const WithOneSparkReward: Story = {
  args: {
    ...savingsViewSusdsArgs,
    selectedAccount: {
      ...savingsUsdsAccountDefinition,
      interestData: {
        ...interestData,
        sparkRewardsOneYearProjection: NormalizedNumber(10),
      },
      sparkRewardsSummary: {
        totalApy: Percentage(0.02),
        rewards: [
          {
            rewardTokenSymbol: tokens.USDS.symbol,
            longDescription: 'USDS',
          },
        ],
      },
    },
  },
}

export const WithMultipleSparkReward: Story = {
  args: {
    ...savingsViewSusdsArgs,
    selectedAccount: {
      ...savingsUsdsAccountDefinition,
      interestData: {
        ...interestData,
        sparkRewardsOneYearProjection: NormalizedNumber(27),
      },
      sparkRewardsSummary: {
        totalApy: Percentage(0.045),
        rewards: [
          {
            rewardTokenSymbol: tokens.USDS.symbol,
            longDescription: 'USDS',
          },
          {
            rewardTokenSymbol: tokens.USDC.symbol,
            longDescription: 'USDC',
          },
        ],
      },
    },
  },
}
