import { TokenRepository } from '@/domain/token-repository/TokenRepository'
import { WithClassname } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { Meta, StoryObj } from '@storybook/react'
import { useForm } from 'react-hook-form'
import { getConvertStablesFormFields } from '../../logic/form/getConvertStablesFormFields'
import { ConvertStablesForm } from './ConvertStablesForm'

const dai = tokens.DAI
const usds = tokens.USDS
const usdc = tokens.USDC
const mockTokenRepository = new TokenRepository(
  [
    { token: dai, balance: NormalizedUnitNumber(2000) },
    { token: usds, balance: NormalizedUnitNumber.ZERO },
    { token: usdc, balance: NormalizedUnitNumber(500) },
  ],
  {
    DAI: dai.symbol,
    USDS: usds.symbol,
  },
)
const psmStables = [tokens.DAI.symbol, tokens.USDC.symbol, tokens.USDS.symbol]

const meta: Meta<typeof ConvertStablesForm> = {
  title: 'Features/Dialogs/ConvertStables/Components/Form',
  component: () => {
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

    return <ConvertStablesForm form={form} formFields={formFields} />
  },
  decorators: [WithClassname('max-w-xl')],
}

export default meta
type Story = StoryObj<typeof ConvertStablesForm>

export const Desktop: Story = {}
export const Mobile = getMobileStory(Desktop)
export const Tablet = getTabletStory(Desktop)
