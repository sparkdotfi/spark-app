import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import type { Meta, StoryObj } from '@storybook/react'

import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'

import { TokensToDeposit } from './TokensToDeposit'

const meta: Meta<typeof TokensToDeposit> = {
  title: 'Features/FarmDetails/Components/TokensToDeposit',
  component: TokensToDeposit,
}

export default meta
type Story = StoryObj<typeof TokensToDeposit>

export const Desktop: Story = {
  args: {
    assets: [
      {
        token: tokens.USDS,
        balance: NormalizedUnitNumber(10_000),
      },
      {
        token: tokens.DAI,
        balance: NormalizedUnitNumber(20_864.56),
      },
      {
        token: tokens.USDC,
        balance: NormalizedUnitNumber(0),
      },
      {
        token: tokens.sDAI,
        balance: NormalizedUnitNumber(0),
      },
      {
        token: tokens.sUSDS,
        balance: NormalizedUnitNumber(0),
      },
    ],
    openStakeDialog: () => {},
  },
}

export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
