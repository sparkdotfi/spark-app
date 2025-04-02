import { WithClassname } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { SuccessView } from './SuccessView'

const meta: Meta<typeof SuccessView> = {
  title: 'Features/Dialogs/Views/Success',
  component: SuccessView,
  decorators: [WithClassname('max-w-xl')],
  args: {
    tokenWithValue: {
      token: tokens.DAI,
      value: NormalizedNumber(2000),
    },
    onProceed: () => {},
    proceedText: 'View in portfolio',
  },
}

export default meta
type Story = StoryObj<typeof SuccessView>

export const DesktopDeposit: Story = {
  args: {
    objectiveType: 'deposit',
  },
}
export const MobileDeposit = getMobileStory(DesktopDeposit)
export const TabletDeposit = getTabletStory(DesktopDeposit)

export const DesktopBorrow: Story = {
  args: {
    objectiveType: 'borrow',
  },
}
export const MobileBorrow = getMobileStory(DesktopBorrow)
export const TabletBorrow = getTabletStory(DesktopBorrow)

export const DesktopRepay: Story = {
  args: {
    objectiveType: 'repay',
  },
}
export const MobileRepay = getMobileStory(DesktopRepay)
export const TabletRepay = getTabletStory(DesktopRepay)

export const DesktopWithdraw: Story = {
  args: {
    objectiveType: 'withdraw',
  },
}
export const MobileWithdraw = getMobileStory(DesktopWithdraw)
export const TabletWithdraw = getTabletStory(DesktopWithdraw)

export const ZeroPriceToken = getMobileStory({
  args: {
    objectiveType: 'claimFarmRewards',
    tokenWithValue: {
      token: tokens.SKY.clone({ unitPriceUsd: NormalizedNumber.ZERO }),
      value: NormalizedNumber(2000),
    },
    onProceed: () => {},
    proceedText: 'View in portfolio',
  },
})
export const ZeroPriceTokenMobile = getMobileStory(ZeroPriceToken)
export const ZeroPriceTokenTablet = getTabletStory(ZeroPriceToken)
