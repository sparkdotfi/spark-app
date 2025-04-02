import { WithClassname } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'

import { NormalizedNumber } from '@sparkdotfi/common-universal'

import { MyWallet } from './MyWallet'

const meta: Meta<typeof MyWallet> = {
  title: 'Features/MarketDetails/Components/MyWallet',
  component: MyWallet,
  args: {
    token: tokens.wstETH,
  },
  decorators: [WithClassname('max-w-xs')],
}

export default meta
type Story = StoryObj<typeof MyWallet>

export const Default: Story = {
  name: 'Default',
  args: {
    tokenBalance: NormalizedNumber(10000),
    borrow: {
      token: tokens.wstETH,
      eligibility: 'yes',
      available: NormalizedNumber(20000),
    },
    deposit: {
      token: tokens.wstETH,
      available: NormalizedNumber(40000),
    },
  },
}

export const Mobile = getMobileStory(Default)
export const Tablet = getTabletStory(Default)

export const NoDeposits: Story = {
  name: 'No Deposits',
  args: {
    tokenBalance: NormalizedNumber(10000),
    borrow: {
      token: tokens.wstETH,
      eligibility: 'yes',
      available: NormalizedNumber.ZERO,
    },
    deposit: {
      token: tokens.wstETH,
      available: NormalizedNumber(40000),
    },
  },
}

export const ZeroBalance: Story = {
  name: 'Zero Balance',
  args: {
    tokenBalance: NormalizedNumber.ZERO,
    borrow: {
      token: tokens.wstETH,
      eligibility: 'yes',
      available: NormalizedNumber(2000),
    },
    deposit: {
      token: tokens.wstETH,
      available: NormalizedNumber.ZERO,
    },
  },
}

export const NoDepositsZeroBalance: Story = {
  name: 'No deposits Zero Balance',
  args: {
    tokenBalance: NormalizedNumber.ZERO,
    borrow: {
      token: tokens.wstETH,
      eligibility: 'yes',
      available: NormalizedNumber.ZERO,
    },
    deposit: {
      token: tokens.wstETH,
      available: NormalizedNumber.ZERO,
    },
  },
}

export const AssetCannotBeBorrowed: Story = {
  name: 'Asset cannot be borrowed',
  args: {
    tokenBalance: NormalizedNumber.ZERO,
    borrow: {
      token: tokens.wstETH,
      eligibility: 'no',
      available: NormalizedNumber.ZERO,
    },
    deposit: {
      token: tokens.wstETH,
      available: NormalizedNumber.ZERO,
    },
  },
}

export const Dai: Story = {
  name: 'DAI',
  args: {
    token: tokens.DAI,
    tokenBalance: NormalizedNumber(10000),
    deposit: {
      token: tokens.DAI,
      available: NormalizedNumber(10000),
    },
    borrow: {
      token: tokens.DAI,
      eligibility: 'yes',
      available: NormalizedNumber(20000),
    },
    lend: {
      token: tokens.DAI,
      available: NormalizedNumber(10000),
    },
    openDialog: () => {},
  },
}

export const DaiMobile: Story = {
  ...getMobileStory(Dai),
  name: 'DAI (Mobile)',
}
export const DaiTablet: Story = {
  ...getTabletStory(Default),
  name: 'DAI (Tablet)',
}

export const DaiNoDeposits: Story = {
  name: 'DAI no deposits',
  args: {
    token: tokens.DAI,

    tokenBalance: NormalizedNumber(10000),
    deposit: {
      token: tokens.DAI,
      available: NormalizedNumber(10000),
    },
    borrow: {
      token: tokens.DAI,
      eligibility: 'yes',
      available: NormalizedNumber(10000),
    },
    lend: {
      token: tokens.DAI,
      available: NormalizedNumber.ZERO,
    },
    openDialog: () => {},
  },
}

export const DaiZeroBalance: Story = {
  name: 'DAI zero balance',
  args: {
    token: tokens.DAI,

    tokenBalance: NormalizedNumber.ZERO,
    deposit: {
      token: tokens.DAI,
      available: NormalizedNumber.ZERO,
    },
    borrow: {
      token: tokens.DAI,
      eligibility: 'yes',
      available: NormalizedNumber(2000),
    },
    lend: {
      token: tokens.DAI,
      available: NormalizedNumber.ZERO,
    },
    openDialog: () => {},
  },
}

export const DaiNoDepositsZeroBalance: Story = {
  name: 'DAI no deposits zero balance',
  args: {
    token: tokens.DAI,
    tokenBalance: NormalizedNumber.ZERO,
    deposit: {
      token: tokens.DAI,
      available: NormalizedNumber.ZERO,
    },
    borrow: {
      token: tokens.DAI,
      eligibility: 'yes',
      available: NormalizedNumber.ZERO,
    },
    lend: {
      token: tokens.DAI,
      available: NormalizedNumber.ZERO,
    },
    openDialog: () => {},
  },
}
