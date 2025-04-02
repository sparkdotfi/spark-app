import { WithClassname, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { SuccessView } from './SuccessView'

const meta: Meta<typeof SuccessView> = {
  title: 'Features/Dialogs/Views/Savings/Withdraw/Success',
  component: SuccessView,
  decorators: [WithClassname('max-w-xl'), ZeroAllowanceWagmiDecorator(), withRouter],
  args: {
    tokenToWithdraw: {
      token: tokens.DAI,
      value: NormalizedNumber(2000),
    },
    closeDialog: () => {},
  },
}

export default meta
type Story = StoryObj<typeof SuccessView>

export const Default: Story = {}

export const MobileWithdraw = getMobileStory(Default)
export const TabletWithdraw = getTabletStory(Default)

export const SendMode: Story = {
  args: {
    sendModeExtension: {
      receiver: CheckedAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'),
    },
  },
}
export const SendModeMobile = getMobileStory(SendMode)
export const SendModeTablet = getTabletStory(SendMode)
