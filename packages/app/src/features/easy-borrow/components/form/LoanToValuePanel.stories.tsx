import type { Meta, StoryObj } from '@storybook/react'

import { Percentage } from '@sparkdotfi/common-universal'
import { useState } from 'react'
import { LoanToValuePanel } from './LoanToValuePanel'

function LoanToValuePanelWrapper({ ltv }: { ltv: number }) {
  const [value, setValue] = useState<Percentage>(Percentage(ltv))

  return (
    <LoanToValuePanel
      ltv={value}
      maxLtv={Percentage(0.8)}
      liquidationLtv={Percentage(0.825)}
      onLtvChange={(v) => setValue(v)}
    />
  )
}

const meta: Meta<typeof LoanToValuePanelWrapper> = {
  title: 'Features/EasyBorrow/Components/Form/LoanToValuePanel',
  component: LoanToValuePanelWrapper,
  args: {
    ltv: 0.1,
  },
}

export default meta
type Story = StoryObj<typeof LoanToValuePanelWrapper>

export const Default: Story = {}
