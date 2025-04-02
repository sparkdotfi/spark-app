import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'

import { CollateralStatusPanel } from './CollateralStatusPanel'

const meta: Meta<typeof CollateralStatusPanel> = {
  title: 'Features/MarketDetails/Components/StatusPanel/CollateralStatusPanel',
  component: CollateralStatusPanel,
  decorators: [WithTooltipProvider(), WithClassname('max-w-2xl'), withRouter],
}

export default meta
type Story = StoryObj<typeof CollateralStatusPanel>

export const CanBeUsedAsCollateral: Story = {
  name: 'Can be used as collateral',
  args: {
    status: 'yes',
    maxLtv: Percentage(0.8),
    liquidationThreshold: Percentage(0.825),
    liquidationPenalty: Percentage(0.05),
  },
}

export const CanBeUsedAsCollateralMobile = {
  ...getMobileStory(CanBeUsedAsCollateral as any),
  name: 'Can be used as collateral (Mobile)',
}
export const CanBeUsedAsCollateralTablet = {
  ...getTabletStory(CanBeUsedAsCollateral as any),
  name: 'Can be used as collateral (Tablet)',
}

export const CanBeUsedAsCollateralInIsolationMode: Story = {
  name: 'Only in isolation Mode',
  args: {
    status: 'only-in-isolation-mode',
    isolationModeInfo: {
      debtCeiling: NormalizedNumber(50_000_000),
      debt: NormalizedNumber(37_896_154),
    },
    maxLtv: Percentage(0.8),
    liquidationThreshold: Percentage(0.825),
    liquidationPenalty: Percentage(0.05),
  },
}
export const CanBeUsedAsCollateralInIsolationModeMobile = {
  ...getMobileStory(CanBeUsedAsCollateralInIsolationMode as any),
  name: 'Only in isolation Mode (Mobile)',
}
export const CanBeUsedAsCollateralInIsolationModeTablet = {
  ...getTabletStory(CanBeUsedAsCollateralInIsolationMode as any),
  name: 'Only in isolation Mode (Tablet)',
}

export const CannotBeUsedAsCollateral: Story = {
  name: 'Cannot Be Used As Collateral',
  args: {
    status: 'no',
    maxLtv: Percentage(0),
    liquidationThreshold: Percentage(0),
    liquidationPenalty: Percentage(0),
  },
}
export const CannotBeUsedAsCollateralMobile = {
  ...getMobileStory(CannotBeUsedAsCollateral as any),
  name: 'Cannot Be Used As Collateral (Mobile)',
}
export const CannotBeUsedAsCollateralTablet = {
  ...getTabletStory(CannotBeUsedAsCollateral as any),
  name: 'Cannot Be Used As Collateral (Tablet)',
}
