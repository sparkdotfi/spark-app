import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import BigNumber from 'bignumber.js'
import { withRouter } from 'storybook-addon-remix-react-router'

import { Percentage } from '@marsfoundation/common-universal'

import { EModeView } from './EModeView'

const meta: Meta<typeof EModeView> = {
  title: 'Features/Dialogs/Views/EMode',
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider(), withRouter],
  component: EModeView,
  args: {
    eModeCategories: {
      'No E-Mode': {
        name: 'No E-Mode',
        tokens: [tokens.ETH, tokens.rETH, tokens.wstETH, tokens.DAI, tokens.USDC, tokens.USDT],
        isActive: true,
        isSelected: false,
        onSelect: () => {},
      },
      'ETH Correlated': {
        name: 'ETH Correlated',
        tokens: [tokens.ETH, tokens.rETH, tokens.wstETH],
        isActive: false,
        isSelected: true,
        onSelect: () => {},
      },
      'BTC Correlated': {
        name: 'BTC Correlated',
        tokens: [tokens.cbBTC, tokens.LBTC],
        isActive: false,
        isSelected: false,
        onSelect: () => {},
      },
      Stablecoins: {
        name: 'Stablecoins',
        tokens: [tokens.DAI, tokens.USDC, tokens.USDT],
        isActive: false,
        isSelected: false,
        onSelect: () => {},
      },
    },
    selectedEModeCategoryName: 'ETH Correlated',
    currentPositionOverview: {
      healthFactor: new BigNumber(2.5),
      maxLTV: Percentage(0.8),
    },
    updatedPositionOverview: {
      healthFactor: new BigNumber(3.1),
      maxLTV: Percentage(0.9),
    },
    objectives: [
      {
        type: 'setUserEMode',
        eModeCategoryId: 1,
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    riskAcknowledgement: {
      onStatusChange: () => {},
      warning: undefined,
    },
  },
}

export default meta
type Story = StoryObj<typeof EModeView>

export const SetEMode: Story = { name: 'Set E-Mode' }
export const SetEModeMobile: Story = { name: 'Set E-Mode Mobile', ...getMobileStory(SetEMode) }
export const SetEModeTablet: Story = { name: 'Set E-Mode Tablet', ...getTabletStory(SetEMode) }

export const ValidationIssue: Story = {
  name: 'Validation Issue',
  args: {
    validationIssue: 'exceeds-ltv',
    eModeCategories: {
      'No E-Mode': {
        name: 'No E-Mode',
        tokens: [tokens.ETH, tokens.rETH, tokens.wstETH, tokens.DAI, tokens.USDC, tokens.USDT],
        isActive: false,
        isSelected: true,
        onSelect: () => {},
      },
      'ETH Correlated': {
        name: 'ETH Correlated',
        tokens: [tokens.ETH, tokens.rETH, tokens.wstETH],
        isActive: true,
        isSelected: false,
        onSelect: () => {},
      },
      'BTC Correlated': {
        name: 'BTC Correlated',
        tokens: [tokens.cbBTC, tokens.LBTC],
        isActive: false,
        isSelected: false,
        onSelect: () => {},
      },
      Stablecoins: {
        name: 'Stablecoins',
        tokens: [tokens.DAI, tokens.USDC, tokens.USDT],
        isActive: false,
        isSelected: false,
        onSelect: () => {},
      },
    },
    currentPositionOverview: {
      healthFactor: new BigNumber(2.5),
      maxLTV: Percentage(0.9),
    },
    updatedPositionOverview: {
      healthFactor: new BigNumber(0.8),
      maxLTV: Percentage(0.8),
    },
    pageStatus: {
      state: 'form',
      actionsEnabled: false,
      goToSuccessScreen: () => {},
    },
  },
}

export const RiskWarning: Story = {
  name: 'Risk Warning',
  args: {
    eModeCategories: {
      'No E-Mode': {
        name: 'No E-Mode',
        tokens: [tokens.ETH, tokens.rETH, tokens.wstETH, tokens.DAI, tokens.USDC, tokens.USDT],
        isActive: false,
        isSelected: true,
        onSelect: () => {},
      },
      'ETH Correlated': {
        name: 'ETH Correlated',
        tokens: [tokens.ETH, tokens.rETH, tokens.wstETH],
        isActive: true,
        isSelected: false,
        onSelect: () => {},
      },
      'BTC Correlated': {
        name: 'BTC Correlated',
        tokens: [tokens.cbBTC, tokens.LBTC],
        isActive: false,
        isSelected: false,
        onSelect: () => {},
      },
      Stablecoins: {
        name: 'Stablecoins',
        tokens: [tokens.DAI, tokens.USDC, tokens.USDT],
        isActive: false,
        isSelected: false,
        onSelect: () => {},
      },
    },
    currentPositionOverview: {
      healthFactor: new BigNumber(2.5),
      maxLTV: Percentage(0.9),
    },
    updatedPositionOverview: {
      healthFactor: new BigNumber(1.1),
      maxLTV: Percentage(0.8),
    },
    pageStatus: {
      state: 'form',
      actionsEnabled: false,
      goToSuccessScreen: () => {},
    },
    riskAcknowledgement: {
      onStatusChange: () => {},
      warning: { type: 'liquidation-warning-e-mode-off' },
    },
  },
}
