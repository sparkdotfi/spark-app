import { Meta, StoryObj } from '@storybook/react'

import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { TransactionOverview } from './TransactionOverview'

const meta: Meta<typeof TransactionOverview> = {
  title: 'Components/Molecules/TransactionOverview',
  decorators: [WithClassname('max-w-2xl'), WithTooltipProvider()],
  component: TransactionOverview,
}

export default meta

type Story = StoryObj<typeof TransactionOverview>

export const Default: Story = {
  render: () => {
    return (
      <TransactionOverview showSkyBadge>
        <TransactionOverview.Row>
          <TransactionOverview.Label>APY</TransactionOverview.Label>
          <TransactionOverview.FarmApy
            apy={Percentage(0.05)}
            rewardsPerYear={NormalizedNumber(100)}
            rewardToken={tokens.USDS}
          />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>APY change</TransactionOverview.Label>
          <TransactionOverview.ApyChange currentApy={Percentage(0.08)} updatedApy={Percentage(0.085)} />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Route</TransactionOverview.Label>
          <TransactionOverview.Route
            route={[
              {
                type: 'token-amount',
                token: tokens.USDC,
                amount: NormalizedNumber(100),
                usdAmount: NormalizedNumber(100),
              },
              {
                type: 'token-amount',
                token: tokens.USDS,
                amount: NormalizedNumber(100),
                usdAmount: NormalizedNumber(100),
              },
              {
                type: 'token-amount',
                token: tokens.sUSDS,
                amount: NormalizedNumber(91.345035308238),
                usdAmount: NormalizedNumber(100),
              },
            ]}
          />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Outcome</TransactionOverview.Label>
          <TransactionOverview.TokenAmount token={tokens.USDS} amount={NormalizedNumber(100)} />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Remaining supply</TransactionOverview.Label>
          <TransactionOverview.TokenAmountChange
            token={tokens.USDC}
            currentAmount={NormalizedNumber(1000000)}
            updatedAmount={NormalizedNumber(1000000)}
          />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Health factor</TransactionOverview.Label>
          <TransactionOverview.HealthFactorChange
            currentHealthFactor={BigNumber(4.5)}
            updatedHealthFactor={BigNumber(1.5)}
          />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Availbale assets</TransactionOverview.Label>
          <TransactionOverview.AvailableAssets
            categoryName="Stablecoins"
            tokens={[tokens.sDAI, tokens.USDT, tokens.USDC]}
          />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>MAX LTV</TransactionOverview.Label>
          <TransactionOverview.MaxLtvChange currentMaxLTV={Percentage(0.8)} updatedMaxLTV={Percentage(0.9)} />
        </TransactionOverview.Row>
        <TransactionOverview.Row>
          <TransactionOverview.Label>Collateralization</TransactionOverview.Label>
          <TransactionOverview.Generic>Disabled</TransactionOverview.Generic>
        </TransactionOverview.Row>
      </TransactionOverview>
    )
  },
}
