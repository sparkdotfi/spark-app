import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { WithClassname, WithTooltipProvider, ZeroAllowanceWagmiDecorator } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { getConvertStablesFormFields } from '../logic/form/getConvertStablesFormFields'
import { ConvertStablesView } from './ConvertStablesView'

const dai = tokens.DAI
const usds = tokens.USDS
const usdc = tokens.USDC
const mockTokenRepository = new TokenRepository(
  [
    { token: dai, balance: NormalizedUnitNumber(2000) },
    { token: usds, balance: NormalizedUnitNumber(0) },
    { token: usdc, balance: NormalizedUnitNumber(500) },
  ],
  {
    DAI: dai.symbol,
    USDS: usds.symbol,
  },
)
const psmStables = [tokens.DAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol]

const meta: Meta<typeof ConvertStablesView> = {
  title: 'Features/Dialogs/Views/ConvertStables/ConvertStablesView',
  decorators: [ZeroAllowanceWagmiDecorator(), WithClassname('max-w-xl'), WithTooltipProvider()],
  component: (args) => {
    const form = useForm({
      defaultValues: {
        inTokenSymbol: tokens.USDS.symbol,
        outTokenSymbol: tokens.DAI.symbol,
        amount: '1000',
      },
    }) as any
    const formFields = getConvertStablesFormFields({
      form,
      tokenRepository: mockTokenRepository,
      psmStables,
    })
    return <ConvertStablesView {...args} form={form} formFields={formFields} />
  },
  args: {
    objectives: [
      {
        type: 'convertStables',
        inToken: tokens.DAI,
        outToken: tokens.USDC,
        amount: NormalizedUnitNumber(2000),
      },
    ],
    pageStatus: {
      state: 'form',
      actionsEnabled: true,
      goToSuccessScreen: () => {},
    },
    txOverview: {
      status: 'success',
      inToken: tokens.DAI,
      outcome: { token: tokens.USDC, value: NormalizedUnitNumber(2000), usdValue: NormalizedUnitNumber(2000) },
      route: [
        { token: tokens.DAI, value: NormalizedUnitNumber(2000), usdValue: NormalizedUnitNumber(2000) },
        { token: tokens.USDC, value: NormalizedUnitNumber(2000), usdValue: NormalizedUnitNumber(2000) },
      ],
    },
    actionsContext: {
      tokenRepository: mockTokenRepository,
    },
  },
}

export default meta
type Story = StoryObj<typeof ConvertStablesView>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
