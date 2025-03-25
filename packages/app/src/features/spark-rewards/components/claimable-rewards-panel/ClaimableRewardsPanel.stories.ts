import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber, raise } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { base, mainnet } from 'viem/chains'
import { ClaimableRewardWithAction } from '../../logic/useClaimableRewards'
import { ClaimableRewardsPanel, ClaimableRewardsPanelProps } from './ClaimableRewardsPanel'

const meta: Meta<typeof ClaimableRewardsPanel> = {
  title: 'Features/SparkRewards/Components/ClaimableRewardsPanel',
  decorators: [WithTooltipProvider(), WithClassname('max-w-4xl')],
  component: ClaimableRewardsPanel,
}

export default meta
type Story = StoryObj<typeof ClaimableRewardsPanel>

const data: ClaimableRewardWithAction[] = [
  {
    token: tokens.RED,
    amountPending: NormalizedUnitNumber(123.4323),
    amountToClaim: NormalizedUnitNumber(224_093.23423),
    chainId: mainnet.id,
    actionName: 'Claim',
    action: () => {},
    isActionEnabled: true,
  },
  {
    token: tokens.SPK,
    amountPending: NormalizedUnitNumber(44_224.22),
    amountToClaim: NormalizedUnitNumber(12_213.21),
    chainId: mainnet.id,
    actionName: 'Claim',
    action: () => {},
    isActionEnabled: true,
  },
  {
    token: tokens.USDS,
    amountPending: NormalizedUnitNumber(11.22),
    amountToClaim: NormalizedUnitNumber(0),
    chainId: base.id,
    actionName: 'Switch',
    action: () => {},
    isActionEnabled: true,
  },
]

const args: ClaimableRewardsPanelProps = {
  claimableRewardsResult: {
    data,
    isPending: false,
    isError: false,
    error: null,
  },
}

export const Desktop: Story = { args }
export const Mobile: Story = {
  ...getMobileStory(Desktop),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const rows = await canvas.findAllByRole('switch')
    const firstRow = rows[0] ?? raise('No table row found')
    await userEvent.click(firstRow)
  },
}
export const Tablet = getTabletStory(Desktop)

export const NoRewards: Story = {
  args: {
    ...args,
    claimableRewardsResult: { data: [], isPending: false, isError: false, error: null },
  },
}
export const NoRewardsMobile = getMobileStory(NoRewards)
export const NoRewardsTablet = getTabletStory(NoRewards)

export const Pending: Story = {
  args: {
    ...args,
    claimableRewardsResult: { data: undefined, isPending: true, isError: false, error: null },
  },
}
export const PendingMobile = getMobileStory(Pending)
export const PendingTablet = getTabletStory(Pending)

export const ErrorState: Story = {
  args: {
    ...args,
    claimableRewardsResult: {
      data: undefined,
      isPending: false,
      isError: true,
      error: new Error('Could not fetch rewards'),
    },
  },
}
export const ErrorStateMobile = getMobileStory(ErrorState)
export const ErrorStateTablet = getTabletStory(ErrorState)

export const ZeroAmounts: Story = {
  args: {
    claimableRewardsResult: {
      data: [
        {
          token: tokens.RED,
          amountPending: NormalizedUnitNumber(0),
          amountToClaim: NormalizedUnitNumber(0),
          chainId: mainnet.id,
          actionName: 'Claim',
          action: () => {},
          isActionEnabled: false,
        },
        {
          token: tokens.SPK,
          amountPending: NormalizedUnitNumber(0),
          amountToClaim: NormalizedUnitNumber(0),
          chainId: mainnet.id,
          actionName: 'Claim',
          action: () => {},
          isActionEnabled: false,
        },
        {
          token: tokens.USDS,
          amountPending: NormalizedUnitNumber(0),
          amountToClaim: NormalizedUnitNumber(0),
          chainId: base.id,
          actionName: 'Switch',
          action: () => {},
          isActionEnabled: true,
        },
      ],
      isPending: false,
      isError: false,
      error: null,
    },
  },
}
