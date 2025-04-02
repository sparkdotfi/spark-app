import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { SuccessView } from './SuccessView'

const meta: Meta<typeof SuccessView> = {
  title: 'Features/EasyBorrow/Views/SuccessView',
  component: SuccessView,
  decorators: [withRouter],
  args: {
    deposited: [
      {
        token: tokens.ETH,
        value: NormalizedNumber(13.74),
      },
      {
        token: tokens.stETH,
        value: NormalizedNumber(34.21),
      },
    ],
    borrowed: [
      {
        token: tokens.DAI,
        value: NormalizedNumber(50000),
      },
    ],
    runConfetti: false,
  },
}

export default meta
type Story = StoryObj<typeof SuccessView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)

export const OnlyBorrowed: Story = {
  args: {
    deposited: [],
  },
}
export const OnlyBorrowedMobile = getMobileStory(OnlyBorrowed)
export const OnlyBorrowedTablet = getTabletStory(OnlyBorrowed)

export const Usds: Story = {
  args: {
    deposited: [
      {
        token: tokens.stETH,
        value: NormalizedNumber(34.21),
      },
    ],
    borrowed: [
      {
        token: tokens.USDS,
        value: NormalizedNumber(10_000),
      },
    ],
  },
}
export const UsdsMobile = getMobileStory(Usds)
export const UsdsTablet = getTabletStory(Usds)
