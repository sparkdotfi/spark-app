import type { Meta, StoryObj } from '@storybook/react'

import { Form } from '@/ui/atoms/form/Form'
import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
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
            balance: NormalizedUnitNumber(1),
          },
          {
            token: tokens.wstETH,
            balance: NormalizedUnitNumber(1.5),
          },
        ]}
        changeAsset={() => {}}
        addAsset={() => {}}
        removeAsset={() => {}}
        allAssets={[
          {
            token: tokens.ETH,
            balance: NormalizedUnitNumber(1),
          },
          {
            token: tokens.wstETH,
            balance: NormalizedUnitNumber(2),
          },
          {
            token: tokens.rETH,
            balance: NormalizedUnitNumber(3),
          },
        ]}
        alreadyDeposited={{
          tokens: [tokens.ETH, tokens.wstETH],
          totalValueUSD: NormalizedUnitNumber(5000),
        }}
        assetToMaxValue={{
          [tokens.ETH.symbol]: NormalizedUnitNumber(1),
          [tokens.wstETH.symbol]: NormalizedUnitNumber(2),
          [tokens.rETH.symbol]: NormalizedUnitNumber(3),
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
