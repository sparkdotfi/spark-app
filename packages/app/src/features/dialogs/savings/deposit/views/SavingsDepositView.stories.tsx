import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { DepositToSavingsObjective } from '@/features/actions/flavours/deposit-to-savings/types'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { SavingsDepositView } from './SavingsDepositView'

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

const meta: Meta<typeof SavingsDepositView> = {
  title: 'Features/Dialogs/Views/Savings/Deposit',
  component: (args) => {
    const form = useForm() as any
    return <SavingsDepositView {...args} form={form} />
  },
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
  args: {
    underlyingToken: tokens.DAI,
    selectableAssets: [
      {
        token: tokens.USDC,
        balance: NormalizedNumber(50000),
      },
      {
        token: tokens.DAI,
        balance: NormalizedNumber(1),
      },
    ],
    assetsFields: {
      selectedAsset: {
        token: tokens.USDC,
        balance: NormalizedNumber(50000),
        value: '2000',
      },
      maxValue: NormalizedNumber(5000),
      changeAsset: () => {},
    },
    objectives: [
      {
        type: 'depositToSavings',
        value: NormalizedNumber(5000),
        token: tokens.USDC,
        savingsToken: tokens.sDAI,
      } satisfies DepositToSavingsObjective,
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    txOverview: {
      underlyingToken: tokens.DAI,
      status: 'success',
      APY: Percentage(0.05),
      stableEarnRate: NormalizedNumber(542),
      route: [
        { token: tokens.USDC, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
        { token: tokens.DAI, value: NormalizedNumber(1300.74), usdValue: NormalizedNumber(1300.74) },
        { token: tokens.sDAI, value: NormalizedNumber(925.75), usdValue: NormalizedNumber(1300.74) },
      ],
      skyBadgeToken: tokens.USDC,
      outTokenAmount: NormalizedNumber(925.75),
    },
    actionsContext: {
      tokenRepository: mockTokenRepository,
    },
  },
}

export default meta
type Story = StoryObj<typeof SavingsDepositView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
