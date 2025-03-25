import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { withRouter } from 'storybook-addon-remix-react-router'
import { TopbarAirdrop } from './TopbarAirdrop'

const timestampInMs = Date.now() - 30 * 1000 // timestamp snapshot is always bit stale

const meta: Meta<typeof TopbarAirdrop> = {
  title: 'Features/Topbar/Components/TopbarAirdrop',
  decorators: [WithTooltipProvider(), WithClassname('flex justify-end h-96'), withRouter],
  component: TopbarAirdrop,
  args: {
    airdrop: {
      tokenReward: NormalizedUnitNumber(1_200_345.568),
      tokenRatePerSecond: NormalizedUnitNumber(1),
      tokenRatePrecision: 1,
      refreshIntervalInMs: 100,
      timestampInMs,
    },
    isLoading: false,
    isError: false,
  },
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button')

    await userEvent.click(button)
  },
}

export default meta
type Story = StoryObj<typeof TopbarAirdrop>

export const Desktop: Story = {}

export const Loading: Story = { args: { ...meta.args, isLoading: true, isError: false } }

export const LargeAirdrop = {
  args: {
    airdrop: {
      tokenReward: NormalizedUnitNumber('7835102.158890800802961891'),
      tokenRatePerSecond: NormalizedUnitNumber('0.262135690260185551'),
      tokenRatePrecision: 2,
      refreshIntervalInMs: 100,
      timestampInMs,
    },
  },
}

export const SmallAirdrop = {
  args: {
    airdrop: {
      tokenReward: NormalizedUnitNumber('0.005822830257558254'),
      tokenRatePerSecond: NormalizedUnitNumber('2.37304339E-9'),
      tokenRatePrecision: 10,
      refreshIntervalInMs: 100,
      timestampInMs,
    },
  },
}

export const AlmostZero = {
  args: {
    airdrop: {
      tokenReward: NormalizedUnitNumber('8.73949580999E-7'),
      tokenRatePerSecond: NormalizedUnitNumber('2.8442E-13'),
      tokenRatePrecision: 14,
      refreshIntervalInMs: 100,
      timestampInMs,
    },
  },
}

export const Zero = {
  args: {
    airdrop: undefined,
    isLoading: false,
    isError: false,
  },
}
