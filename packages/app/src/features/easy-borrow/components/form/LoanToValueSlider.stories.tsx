import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Percentage } from '@sparkdotfi/common-universal'

import { LoanToValueSlider } from './LoanToValueSlider'

function LoanToValueSliderWrapper({ ltv }: { ltv: number }) {
  const [value, setValue] = useState<Percentage>(Percentage(ltv))

  return (
    <LoanToValueSlider
      ltv={value}
      className="mt-10"
      liquidationLtv={Percentage(0.825)}
      maxAvailableLtv={Percentage(0.8)}
      onLtvChange={(v) => setValue(v)}
    />
  )
}

const meta: Meta<typeof LoanToValueSliderWrapper> = {
  title: 'Features/EasyBorrow/Components/Form/LoanToValueSlider',
  component: LoanToValueSliderWrapper,
}

export default meta
type Story = StoryObj<typeof LoanToValueSliderWrapper>

export const Healthy: Story = {
  args: {
    ltv: 0.1,
  },
}
export const Moderate: Story = {
  args: {
    ltv: 0.35,
  },
}
export const Risky: Story = {
  args: {
    ltv: 0.55,
  },
}
