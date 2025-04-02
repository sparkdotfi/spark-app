import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import type { Meta, StoryObj } from '@storybook/react'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

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
        balance: NormalizedNumber(10_000),
      },
      {
        token: tokens.DAI,
        balance: NormalizedNumber(20_864.56),
      },
      {
        token: tokens.USDC,
        balance: NormalizedNumber.ZERO,
      },
      {
        token: tokens.sDAI,
        balance: NormalizedNumber.ZERO,
      },
      {
        token: tokens.sUSDS,
        balance: NormalizedNumber.ZERO,
      },
    ],
    openStakeDialog: () => {},
  },
}

export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
