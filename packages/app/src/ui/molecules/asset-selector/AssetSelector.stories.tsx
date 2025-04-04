import { tokens } from '@sb/tokens'
import type { Meta, StoryObj } from '@storybook/react'

import { WithClassname } from '@sb/decorators'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { userEvent } from '@storybook/test'
import { within } from '@testing-library/react'
import { AssetSelector } from './AssetSelector'

const meta: Meta<typeof AssetSelector> = {
  title: 'Components/Molecules/New/AssetSelector',
  component: AssetSelector,
  decorators: [WithClassname('w-[120px] h-[440px]')],
  args: {
    assets: [
      { token: tokens.ETH, balance: NormalizedNumber('0.0001') },
      { token: tokens.wstETH, balance: NormalizedNumber('0.001') },
      { token: tokens.USDC, balance: NormalizedNumber('100') },
      { token: tokens.USDS, balance: NormalizedNumber('1000') },
      { token: tokens.DAI, balance: NormalizedNumber('1000000') },
    ],
    selectedAsset: tokens.ETH,
    setSelectedAsset: () => {},
  },
}

export default meta
type Story = StoryObj<typeof AssetSelector>

export const Default: Story = {}
export const Hovered: Story = {
  parameters: {
    pseudo: {
      hover: true,
    },
  },
}
export const Active: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const button = await canvas.findByRole('combobox')
    await userEvent.click(button)
  },
}
export const ActiveWithoutBalance: Story = {
  name: 'Active without balance',
  args: {
    showBalance: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body)
    const button = await canvas.findByRole('combobox')
    await userEvent.click(button)
  },
}
export const Focused: Story = {
  parameters: {
    pseudo: {
      focusVisible: true,
    },
  },
}
export const Disabled: Story = {
  args: {
    disabled: true,
  },
}
export const OneAsset: Story = {
  name: 'One asset',
  args: {
    assets: [{ token: tokens.ETH, balance: NormalizedNumber('0.0001') }],
  },
}
export const OneAssetDisabled: Story = {
  name: 'One asset disabled',
  args: {
    assets: [{ token: tokens.ETH, balance: NormalizedNumber('0.0001') }],
    disabled: true,
  },
}
