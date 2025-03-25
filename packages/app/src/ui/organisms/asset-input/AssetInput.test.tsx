import { Token } from '@/domain/types/Token'
import { Form } from '@/ui/atoms/form/Form'
import { testIds } from '@/ui/utils/testIds'
import { zodResolver } from '@hookform/resolvers/zod'
import { tokens } from '@sb/tokens'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { useForm } from 'react-hook-form'
import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { AssetInput } from './AssetInput'

const VALIDATION_ERROR = 'Value must be a valid number'

const FormInputSchema = z
  .object({
    value: z.string(),
    isMaxSelected: z.boolean(),
  })
  .superRefine((field, ctx) => {
    if (field.isMaxSelected) {
      return
    }

    const isValidNumber = !Number.isNaN(Number.parseFloat(field.value))
    if (!isValidNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: VALIDATION_ERROR,
        path: ['value'],
      })
    }
  })

interface AssetInputTestWrapperProps {
  max?: NormalizedUnitNumber
  token?: Token
  maxSelectedFieldName?: string
}

function AssetInputTestWrapper({
  max,
  token = tokens.DAI,
  maxSelectedFieldName = 'isMaxSelected',
}: AssetInputTestWrapperProps) {
  const form = useForm<z.infer<typeof FormInputSchema>>({
    resolver: zodResolver(FormInputSchema),
    defaultValues: {
      value: '',
      isMaxSelected: false,
    },
    mode: 'onChange',
  })

  const _ = form.formState.errors // error does not appear without this line

  return (
    <Form {...form}>
      <AssetInput
        control={form.control}
        fieldName="value"
        selectorAssets={[]}
        setSelectedAsset={() => {}}
        selectedAsset={{ token, balance: NormalizedUnitNumber(1) }}
        maxSelectedFieldName={maxSelectedFieldName}
        maxValue={max}
      />
    </Form>
  )
}

describe(AssetInput.name, () => {
  test('Changes value in input', async () => {
    const value = NormalizedUnitNumber(12345)

    const { getByRole } = render(<AssetInputTestWrapper />)

    await waitFor(() => expect(getByRole('textbox')).toHaveValue(''))
    fillInput(getByRole('textbox'), value.toFixed())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(value.toFixed()))
  })

  test('Validation fails if input value is erased', async () => {
    const value = NormalizedUnitNumber(12345)

    const { getByRole, getByTestId } = render(<AssetInputTestWrapper />)

    fillInput(getByRole('textbox'), value.toFixed())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(value.toFixed()))

    fillInput(getByRole('textbox'), '')
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(''))
    await waitFor(() => expect(getByTestId(testIds.component.AssetInput.error)).toHaveTextContent(VALIDATION_ERROR))
  })

  test('Unable to put non-number input', async () => {
    const value = NormalizedUnitNumber(12345)

    const { getByRole, queryByTestId } = render(<AssetInputTestWrapper />)

    fillInput(getByRole('textbox'), value.toFixed())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(value.toFixed()))

    fillInput(getByRole('textbox'), 'NOTANUMBER')
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(value.toFixed()))
    await waitFor(() => expect(queryByTestId(testIds.component.AssetInput.error)).toBeNull())
  })

  test('Sets input value to max value if it is provided', async () => {
    const max = NormalizedUnitNumber(1234)

    const { getByRole } = render(<AssetInputTestWrapper max={max} />)

    act(() => getByRole('button', { name: 'MAX' }).click())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(max.toFixed()))
  })

  test('Rounds max value to 6 decimal points', async () => {
    const max = NormalizedUnitNumber('1234.56789123456789')

    const { getByRole } = render(<AssetInputTestWrapper max={max} />)

    act(() => getByRole('button', { name: 'MAX' }).click())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(max.dp(6).toFixed()))
  })

  test('Able to alter input after clicking max', async () => {
    const max = NormalizedUnitNumber(1234)
    const value = NormalizedUnitNumber(123) // simulates hitting backspace

    const { getByRole } = render(<AssetInputTestWrapper max={max} />)

    act(() => getByRole('button', { name: 'MAX' }).click())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(max.toFixed()))

    fillInput(getByRole('textbox'), value.toFixed())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(value.toFixed()))
  })

  test('MAX button is disabled after clicking max', async () => {
    const max = NormalizedUnitNumber(1234)

    const { getByRole } = render(<AssetInputTestWrapper max={max} />)

    act(() => getByRole('button', { name: 'MAX' }).click())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(max.toFixed()))
    await waitFor(() => expect(getByRole('button', { name: 'MAX' })).toBeDisabled())
  })

  test('Able to use arbitrary path as maxSelectedFieldName', async () => {
    const max = NormalizedUnitNumber(1234)

    const { getByRole } = render(<AssetInputTestWrapper max={max} maxSelectedFieldName="assets.0.isMaxSelected" />)

    act(() => getByRole('button', { name: 'MAX' }).click())
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(max.toFixed()))
    await waitFor(() => expect(getByRole('button', { name: 'MAX' })).toBeDisabled())
  })

  test('Able to paste value with white spaces', async () => {
    const input = '123 . 456'
    const max = NormalizedUnitNumber(input.replace(/\s/g, ''))

    const { getByRole } = render(<AssetInputTestWrapper />)

    fillInput(getByRole('textbox'), input)
    await waitFor(() => expect(getByRole('textbox')).toHaveValue(max.toFixed()))
  })

  describe('Pastes value with decimals number up to token decimals', async () => {
    for (const token of [tokens.DAI, tokens.USDC, tokens.ETH]) {
      test(token.symbol, async () => {
        const input = `1234.${'5'.repeat(token.decimals)}`

        const { getByRole } = render(<AssetInputTestWrapper token={token} />)

        fillInput(getByRole('textbox'), input)
        await waitFor(() => expect(getByRole('textbox')).toHaveValue(input))

        fillInput(getByRole('textbox'), `${input}6`)
        expect(getByRole('textbox')).toHaveValue(input)
      })
    }
  })
})

function fillInput(input: HTMLElement, value: string): void {
  fireEvent.focusIn(input)
  fireEvent.change(input, { target: { value } })
  fireEvent.focusOut(input)
}
