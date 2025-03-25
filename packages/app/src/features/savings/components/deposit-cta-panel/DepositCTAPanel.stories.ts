import { links } from '@/ui/constants/links'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Percentage } from '@sparkdotfi/common-universal'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { DepositCTAPanel } from './DepositCTAPanel'

const meta: Meta<typeof DepositCTAPanel> = {
  title: 'Features/Savings/Components/DepositCTAPanel',
  component: DepositCTAPanel,
  decorators: [WithTooltipProvider(), withRouter(), WithClassname('max-w-6xl grid md:h-[320px]')],
  args: {
    savingsRate: Percentage(0.12),
    actions: {
      primary: {
        title: 'Deposit',
        action: () => {},
      },
      secondary: {
        title: 'Try in Sandbox',
        action: () => {},
      },
    },
    isInSandbox: false,
  },
}

export default meta
type Story = StoryObj<typeof DepositCTAPanel>

export const usds: Story = {
  args: {
    entryTokens: [tokens.USDS, tokens.DAI, tokens.USDC],
    savingsToken: tokens.sUSDS,
    description: {
      text: 'Deposit your stablecoins into USDS Savings to tap into the Sky Savings Rate, which grants you a predictable APY in USDS.',
      docsLink: links.docs.savings.susds,
    },
    apyExplainer:
      'Current annual interest in the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.susds,
    sparkRewardsSummary: {
      totalApy: Percentage(0),
      rewards: [],
    },
  },
}
export const usdsMobile = getMobileStory(usds)
export const usdsTablet = getTabletStory(usds)

export const usdsDisconnected: Story = {
  args: {
    entryTokens: [tokens.USDS, tokens.DAI, tokens.USDC],
    savingsToken: tokens.sUSDS,
    description: {
      text: 'Deposit your stablecoins into USDS Savings to tap into the Sky Savings Rate, which grants you a predictable APY in USDS.',
      docsLink: links.docs.savings.susds,
    },
    actions: {
      primary: {
        title: 'Connect Wallet',
        action: () => {},
      },
      secondary: {
        title: 'Try in Sandbox',
        action: () => {},
      },
    },
    apyExplainer:
      'Current annual interest in the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.susds,
    sparkRewardsSummary: {
      totalApy: Percentage(0),
      rewards: [],
    },
  },
}

export const usdc: Story = {
  args: {
    entryTokens: [tokens.USDC],
    savingsToken: tokens.sUSDC,
    description: {
      text: 'Deposit your stablecoins into USDC Savings to tap into the Sky Savings Rate, which grants you a predictable APY in USDC.',
      docsLink: links.docs.savings.susdc,
    },
    apyExplainer:
      'Current annual interest in the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.susdc,
    sparkRewardsSummary: {
      totalApy: Percentage(0),
      rewards: [],
    },
  },
}
export const usdcMobile = getMobileStory(usdc)
export const usdcTablet = getTabletStory(usdc)

export const dai: Story = {
  args: {
    entryTokens: [tokens.USDS, tokens.DAI, tokens.USDC],
    savingsToken: tokens.sDAI,
    description: {
      text: 'Deposit your stablecoins into DAI Savings to tap into the Sky Savings Rate, which grants you a predictable APY in DAI.',
      docsLink: links.docs.savings.sdai,
    },
    apyExplainer:
      'Current annual interest rate for DAI deposited into the Sky Savings Module. It is determined on-chain by the Sky Ecosystem Governance. Please note that these protocol mechanisms are subject to change.',
    apyExplainerDocsLink: links.docs.savings.sdai,
    sparkRewardsSummary: {
      totalApy: Percentage(0),
      rewards: [],
    },
  },
}
export const daiMobile = getMobileStory(dai)
export const daiTablet = getTabletStory(dai)

export const inSandbox: Story = {
  args: {
    ...usds.args,
    isInSandbox: true,
  },
}
export const inSandboxMobile = getMobileStory(inSandbox)
export const inSandboxTablet = getTabletStory(inSandbox)

export const WithOneSparkReward: Story = {
  args: {
    ...usds.args,
    sparkRewardsSummary: {
      totalApy: Percentage(0.012),
      rewards: [
        {
          rewardTokenSymbol: tokens.RED.symbol,
          longDescription: 'Lorem ipsum',
        },
      ],
    },
  },
}

export const WithMultipleSparkRewards: Story = {
  args: {
    ...usds.args,
    sparkRewardsSummary: {
      totalApy: Percentage(0.031),
      rewards: [
        {
          rewardTokenSymbol: tokens.RED.symbol,
          longDescription: 'Lorem ipsum',
        },
        {
          rewardTokenSymbol: tokens.wstETH.symbol,
          longDescription: 'Lorem ipsum',
        },
      ],
    },
  },
}
