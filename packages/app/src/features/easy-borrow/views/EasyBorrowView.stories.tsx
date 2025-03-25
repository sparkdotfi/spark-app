import { TokenWithBalance, TokenWithFormValue } from '@/domain/common/types'
import { RiskAcknowledgementInfo } from '@/domain/liquidation-risk-warning/types'
import { UserPositionSummary } from '@/domain/market-info/marketInfo'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { Objective } from '@/features/actions/logic/types'
import { getMockMarketInfo, getMockTokenRepository } from '@/test/integration/constants'
import { WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { useForm } from 'react-hook-form'
import { withRouter } from 'storybook-addon-remix-react-router'
import { EasyBorrowFormSchema } from '../logic/form/validation'
import { ExistingPosition, PageState } from '../logic/types'
import { BorrowDetails } from '../logic/useEasyBorrow'
import { EasyBorrowView } from './EasyBorrowView'

const mockMarketInfo = getMockMarketInfo()
const mockTokenRepository = getMockTokenRepository()

interface EasyBorrowViewStoryProps {
  assetsToDeposit: TokenWithFormValue[]
  assetsToBorrow: TokenWithFormValue[]
  alreadyDeposited: ExistingPosition
  alreadyBorrowed: ExistingPosition
  pageState: PageState
  assets: TokenWithBalance[]
  assetToMaxValue: Record<TokenSymbol, NormalizedUnitNumber>
  updatedPositionSummary: UserPositionSummary
  actions: Objective[]
  guestMode: boolean
  borrowDetails: BorrowDetails
  riskAcknowledgement?: RiskAcknowledgementInfo
  actionsEnabled?: boolean
}

function EasyBorrowViewStory(props: EasyBorrowViewStoryProps) {
  const {
    assetsToBorrow,
    assetsToDeposit,
    alreadyDeposited,
    alreadyBorrowed,
    pageState,
    assets,
    assetToMaxValue,
    updatedPositionSummary,
    actions,
    guestMode,
    borrowDetails,
    riskAcknowledgement: _riskAcknowledgement,
    actionsEnabled = true,
  } = props
  const form = useForm<EasyBorrowFormSchema>({
    defaultValues: {
      assetsToBorrow,
      assetsToDeposit,
    },
  })

  const assetsToDepositFields = {
    selectedAssets: assetsToDeposit,
    addAsset: () => {},
    removeAsset: () => {},
    assets,
    assetToMaxValue,
    changeAsset: () => {},
  }
  const assetsToBorrowFields = {
    selectedAssets: assetsToBorrow,
    addAsset: () => {},
    removeAsset: () => {},
    assets,
    assetToMaxValue,
    changeAsset: () => {},
  }

  const riskAcknowledgement = _riskAcknowledgement ?? {
    onStatusChange: () => {},
    warning: undefined,
  }

  /* eslint-disable func-style */
  const setDesiredLoanToValue = () => {}
  const openConnectModal = () => {}
  const openSandboxModal = () => {}
  const focusOnActionsPanel = () => {}
  /* eslint-enable func-style */

  const pageStatus = {
    actionsEnabled,
    state: pageState,
    onProceedToForm: () => {},
    goToSuccessScreen: () => {},
    submitForm: () => {},
  }

  return (
    <EasyBorrowView
      pageStatus={pageStatus}
      form={form}
      assetsToBorrowFields={assetsToBorrowFields}
      assetsToDepositFields={assetsToDepositFields}
      alreadyDeposited={alreadyDeposited}
      alreadyBorrowed={alreadyBorrowed}
      updatedPositionSummary={updatedPositionSummary}
      setDesiredLoanToValue={setDesiredLoanToValue}
      objectives={actions}
      borrowDetails={borrowDetails}
      guestMode={guestMode}
      openConnectModal={openConnectModal}
      openSandboxModal={openSandboxModal}
      focusOnActionsPanel={focusOnActionsPanel}
      riskAcknowledgement={riskAcknowledgement}
      actionsContext={{ marketInfo: mockMarketInfo, tokenRepository: mockTokenRepository }}
    />
  )
}

const meta: Meta<typeof EasyBorrowViewStory> = {
  title: 'Features/EasyBorrow/Views/EasyBorrowView',
  component: EasyBorrowViewStory,
  decorators: [withRouter, WithTooltipProvider(), ZeroAllowanceWagmiDecorator()],
  args: {
    pageState: 'form',
    assets: [
      {
        token: tokens.ETH,
        balance: NormalizedUnitNumber(1),
      },
      {
        token: tokens.wstETH,
        balance: NormalizedUnitNumber(1),
      },
      {
        token: tokens.rETH,
        balance: NormalizedUnitNumber(1),
      },
      {
        token: tokens.GNO,
        balance: NormalizedUnitNumber(1),
      },
    ],
    assetToMaxValue: {
      [TokenSymbol('ETH')]: NormalizedUnitNumber(1),
      [TokenSymbol('wstETH')]: NormalizedUnitNumber(1),
      [TokenSymbol('rETH')]: NormalizedUnitNumber(1),
      [TokenSymbol('GNO')]: NormalizedUnitNumber(1),
    },
    assetsToBorrow: [
      {
        token: tokens.DAI,
        balance: NormalizedUnitNumber(1000),
        value: '',
      },
    ],
    assetsToDeposit: [
      {
        token: tokens.ETH,
        balance: NormalizedUnitNumber(10),
        value: '',
      },
    ],
    alreadyDeposited: {
      tokens: [],
      totalValueUSD: NormalizedUnitNumber(0),
    },
    alreadyBorrowed: {
      tokens: [],
      totalValueUSD: NormalizedUnitNumber(0),
    },
    updatedPositionSummary: {
      availableBorrowsUSD: NormalizedUnitNumber(0),
      currentLiquidationThreshold: Percentage(0.8),
      loanToValue: Percentage(0),
      healthFactor: undefined,
      maxLoanToValue: Percentage(0.8),
      totalBorrowsUSD: NormalizedUnitNumber(0),
      totalCollateralUSD: NormalizedUnitNumber(0),
      totalLiquidityUSD: NormalizedUnitNumber(0),
    },
    guestMode: false,
    borrowDetails: {
      borrowRate: Percentage(0.0553),
    },
    actions: [],
  },
}

export default meta
type Story = StoryObj<typeof EasyBorrowView>

export const InitialViewDesktop: Story = {
  name: 'Initial View Desktop',
}

export const InitialViewMobile = getMobileStory(InitialViewDesktop)
export const InitialViewTablet = getTabletStory(InitialViewDesktop)

const depositETHArgs: Partial<EasyBorrowViewStoryProps> = {
  assetsToBorrow: [
    {
      token: tokens.DAI,
      balance: NormalizedUnitNumber(1000),
      value: '1000',
    },
  ],
  assetsToDeposit: [
    {
      token: tokens.ETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
  ],
  updatedPositionSummary: {
    availableBorrowsUSD: NormalizedUnitNumber(1000),
    currentLiquidationThreshold: Percentage(0.8),
    loanToValue: Percentage(0.5),
    healthFactor: new BigNumber(1.5),
    maxLoanToValue: Percentage(0.8),
    totalBorrowsUSD: NormalizedUnitNumber(10),
    totalCollateralUSD: NormalizedUnitNumber(1000),
    totalLiquidityUSD: NormalizedUnitNumber(1000),
  },
}

export const DepositETHDesktop: Story = {
  name: 'Deposit ETH desktop',
  args: depositETHArgs,
}

export const DepositETHMobile = getMobileStory(DepositETHDesktop)
export const DepositETHTablet = getTabletStory(DepositETHDesktop)

const borrowUsdsArgs: Partial<EasyBorrowViewStoryProps> = {
  pageState: 'confirmation',
  assetsToBorrow: [
    {
      token: tokens.USDS,
      balance: NormalizedUnitNumber(1000),
      value: '1000',
    },
  ],
  assetsToDeposit: [
    {
      token: tokens.ETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
  ],
  updatedPositionSummary: {
    availableBorrowsUSD: NormalizedUnitNumber(2000),
    currentLiquidationThreshold: Percentage(0.8),
    loanToValue: Percentage(0.75),
    healthFactor: new BigNumber(1.1),
    maxLoanToValue: Percentage(0.8),
    totalBorrowsUSD: NormalizedUnitNumber(10),
    totalCollateralUSD: NormalizedUnitNumber(2000),
    totalLiquidityUSD: NormalizedUnitNumber(2000),
  },
  borrowDetails: {
    borrowRate: Percentage(0.0553),
  },
  actions: [
    {
      type: 'deposit',
      value: NormalizedUnitNumber(1),
      token: tokens.wstETH,
    },
    {
      type: 'borrow',
      value: NormalizedUnitNumber(1000),
      token: tokens.DAI,
    },
    {
      type: 'upgrade',
      fromToken: tokens.DAI,
      toToken: tokens.USDS,
      amount: NormalizedUnitNumber(1),
    },
  ],
  actionsEnabled: false,
}

export const borrowUsdsDesktop: Story = {
  name: 'Borrow USDS desktop',
  args: borrowUsdsArgs,
}

export const borrowUsdsMobile = getMobileStory(borrowUsdsDesktop)
export const borrowUsdsTablet = getTabletStory(borrowUsdsDesktop)

const depositETHWithExistingPositionArgs: Partial<EasyBorrowViewStoryProps> = {
  assetsToBorrow: [
    {
      token: tokens.DAI,
      balance: NormalizedUnitNumber(1000),
      value: '1000',
    },
  ],
  assetsToDeposit: [
    {
      token: tokens.ETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
  ],
  alreadyDeposited: {
    tokens: [tokens.ETH, tokens.wstETH, tokens.rETH, tokens.GNO, tokens.WBTC],
    totalValueUSD: NormalizedUnitNumber(1000),
  },
  alreadyBorrowed: {
    tokens: [tokens.DAI],
    totalValueUSD: NormalizedUnitNumber(500),
  },
  updatedPositionSummary: {
    availableBorrowsUSD: NormalizedUnitNumber(2000),
    currentLiquidationThreshold: Percentage(0.8),
    loanToValue: Percentage(0.5),
    healthFactor: new BigNumber(1.5),
    maxLoanToValue: Percentage(0.8),
    totalBorrowsUSD: NormalizedUnitNumber(10),
    totalCollateralUSD: NormalizedUnitNumber(2000),
    totalLiquidityUSD: NormalizedUnitNumber(2000),
  },
}

export const DepositETHWithExistingPositionDesktop: Story = {
  name: 'Deposit ETH with existing position desktop',
  args: depositETHWithExistingPositionArgs,
}

export const DepositETHWithExistingPositionMobile = getMobileStory(DepositETHWithExistingPositionDesktop)
export const DepositETHWithExistingPositionTablet = getTabletStory(DepositETHWithExistingPositionDesktop)

const depositETHActionsArgs: Partial<EasyBorrowViewStoryProps> = {
  pageState: 'confirmation',
  assetsToBorrow: [
    {
      token: tokens.DAI,
      balance: NormalizedUnitNumber(1000),
      value: '1000',
    },
  ],
  assetsToDeposit: [
    {
      token: tokens.ETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
  ],
  updatedPositionSummary: {
    availableBorrowsUSD: NormalizedUnitNumber(2000),
    currentLiquidationThreshold: Percentage(0.8),
    loanToValue: Percentage(0.5),
    healthFactor: new BigNumber(1.5),
    maxLoanToValue: Percentage(0.8),
    totalBorrowsUSD: NormalizedUnitNumber(10),
    totalCollateralUSD: NormalizedUnitNumber(2000),
    totalLiquidityUSD: NormalizedUnitNumber(2000),
  },
  actions: [
    {
      type: 'deposit',
      value: NormalizedUnitNumber(1),
      token: tokens.ETH,
    },
    {
      type: 'borrow',
      value: NormalizedUnitNumber(1000),
      token: tokens.DAI,
    },
  ],
}

export const DepositETHActionDesktop: Story = {
  name: 'Deposit ETH with actions desktop',
  args: depositETHActionsArgs,
}

export const DepositETHActionMobile = getMobileStory(DepositETHActionDesktop)
export const DepositETHActionTablet = getTabletStory(DepositETHActionDesktop)

const depositErc20ActionArgs: Partial<EasyBorrowViewStoryProps> = {
  pageState: 'confirmation',
  assetsToBorrow: [
    {
      token: tokens.DAI,
      balance: NormalizedUnitNumber(1000),
      value: '1000',
    },
  ],
  assetsToDeposit: [
    {
      token: tokens.wstETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
  ],
  updatedPositionSummary: {
    availableBorrowsUSD: NormalizedUnitNumber(2000),
    currentLiquidationThreshold: Percentage(0.8),
    loanToValue: Percentage(0.75),
    healthFactor: new BigNumber(1.1),
    maxLoanToValue: Percentage(0.8),
    totalBorrowsUSD: NormalizedUnitNumber(10),
    totalCollateralUSD: NormalizedUnitNumber(2000),
    totalLiquidityUSD: NormalizedUnitNumber(2000),
  },
  actions: [
    {
      type: 'deposit',
      value: NormalizedUnitNumber(1),
      token: tokens.wstETH,
    },
    {
      type: 'borrow',
      value: NormalizedUnitNumber(1000),
      token: tokens.DAI,
    },
  ],
  riskAcknowledgement: {
    onStatusChange: () => {},
    warning: { type: 'liquidation-warning-borrow' },
  },
  actionsEnabled: false,
}

export const DepositErc20ActionDesktop: Story = {
  name: 'Deposit ERC20 with actions desktop',
  args: depositErc20ActionArgs,
}

export const DepositErc20ActionMobile = getMobileStory(DepositErc20ActionDesktop)
export const DepositErc20ActionTablet = getTabletStory(DepositErc20ActionDesktop)

const depositMultipleArgs: Partial<EasyBorrowViewStoryProps> = {
  assetsToBorrow: [
    {
      token: tokens.DAI,
      balance: NormalizedUnitNumber(1000),
      value: '1000',
    },
  ],
  assetsToDeposit: [
    {
      token: tokens.ETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
    {
      token: tokens.wstETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
    {
      token: tokens.rETH,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
    {
      token: tokens.GNO,
      balance: NormalizedUnitNumber(10),
      value: '1',
    },
  ],
  updatedPositionSummary: {
    availableBorrowsUSD: NormalizedUnitNumber(2000),
    currentLiquidationThreshold: Percentage(0.8),
    loanToValue: Percentage(0.5),
    healthFactor: new BigNumber(1.5),
    maxLoanToValue: Percentage(0.8),
    totalBorrowsUSD: NormalizedUnitNumber(10),
    totalCollateralUSD: NormalizedUnitNumber(2000),
    totalLiquidityUSD: NormalizedUnitNumber(2000),
  },
}

export const DepositMultipleDesktop: Story = {
  name: 'Deposit multiple desktop',
  args: depositMultipleArgs,
}

export const DepositMultipleMobile = getMobileStory(DepositMultipleDesktop)
export const DepositMultipleTablet = getTabletStory(DepositMultipleDesktop)
