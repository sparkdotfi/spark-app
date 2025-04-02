import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { useState } from 'react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { TopbarMenu } from './TopbarMenu'

const meta: Meta<typeof TopbarMenu> = {
  title: 'Features/Topbar/Components/TopbarMenu',
  decorators: [WithTooltipProvider(), WithClassname('flex justify-end h-96'), withRouter()],
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button')

    await userEvent.click(button)
  },
  render: () => {
    const [sandboxEnabled, setSandboxEnabled] = useState(false)

    return (
      <TopbarMenu
        isInSandbox={sandboxEnabled}
        onSandboxModeClick={() => setSandboxEnabled((p) => !p)}
        buildInfo={{
          sha: 'bdebc69',
          buildTime: '25/10/2024, 10:01:51',
        }}
        isMobileDisplay={false}
        airdropInfo={{
          airdrop: {
            tokenReward: NormalizedUnitNumber(1_200_345.568),
            tokenRatePerSecond: NormalizedUnitNumber(1),
            tokenRatePrecision: 1,
            refreshIntervalInMs: 100,
            timestampInMs: Date.now() - 30 * 1000,
          },
          isLoading: false,
          isError: false,
        }}
        rewardsInfo={{
          rewards: [],
          totalClaimableReward: NormalizedUnitNumber.ZERO,
          onClaim: () => {},
        }}
        sparkRewardsSummary={{
          totalUsdAmount: NormalizedUnitNumber(100),
        }}
      />
    )
  },
}

export default meta
type Story = StoryObj<typeof TopbarMenu>

export const Default: Story = {}
