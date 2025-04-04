import type { Meta, StoryObj } from '@storybook/react'

import { Form } from '@/ui/atoms/form/Form'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { useForm } from 'react-hook-form'
import { withRouter } from 'storybook-addon-remix-react-router'
import { Deposits } from './Deposits'

function DepositsWrapper() {
  const form = useForm() as any

  return (
    <Form {...form}>
      <Deposits
        control={form.control}
        selectedAssets={[
          {
            token: tokens.ETH,
            balance: NormalizedNumber(1),
          },
          {
            token: tokens.wstETH,
            balance: NormalizedNumber(1.5),
          },
        ]}
        changeAsset={() => {}}
        addAsset={() => {}}
        removeAsset={() => {}}
        allAssets={[
          {
            token: tokens.ETH,
            balance: NormalizedNumber(1),
          },
          {
            token: tokens.wstETH,
            balance: NormalizedNumber(2),
          },
          {
            token: tokens.rETH,
            balance: NormalizedNumber(3),
          },
        ]}
        alreadyDeposited={{
          tokens: [tokens.ETH, tokens.wstETH],
          totalValueUSD: NormalizedNumber(5000),
        }}
        assetToMaxValue={{
          [tokens.ETH.symbol]: NormalizedNumber(1),
          [tokens.wstETH.symbol]: NormalizedNumber(2),
          [tokens.rETH.symbol]: NormalizedNumber(3),
        }}
      />
    </Form>
  )
}

const meta: Meta<typeof DepositsWrapper> = {
  title: 'Features/EasyBorrow/Components/Form/Deposits',
  decorators: [withRouter, WithTooltipProvider(), WithClassname('w-[425px]')],
  component: DepositsWrapper,
}

export default meta
type Story = StoryObj<typeof DepositsWrapper>

export const Default: Story = {}
