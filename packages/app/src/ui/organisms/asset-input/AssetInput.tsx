import { formFormat } from '@/domain/common/format'
import { TokenWithBalance } from '@/domain/common/types'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { IconButton } from '@/ui/atoms/icon-button/IconButton'
import { AssetSelector } from '@/ui/molecules/asset-selector/AssetSelector'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber, parseBigNumber } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { XIcon } from 'lucide-react'
import { Control, FieldPath, FieldValues, useController, useFormContext } from 'react-hook-form'

export interface AssetInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  fieldName: FieldPath<TFieldValues>
  selectorAssets: TokenWithBalance[]
  selectedAsset: TokenWithBalance
  setSelectedAsset: (selectedAsset: TokenSymbol) => void
  label?: string
  maxValue?: NormalizedUnitNumber
  maxSelectedFieldName?: string
  onRemove?: () => void
  disabled?: boolean
  showError?: boolean // defaults to show error if field is touched or dirty
}

export function AssetInput<TFieldValues extends FieldValues>({
  fieldName,
  control,
  selectorAssets,
  selectedAsset,
  setSelectedAsset,
  label,
  showError,
  disabled = false,
  maxValue,
  maxSelectedFieldName,
  onRemove,
}: AssetInputProps<TFieldValues>) {
  const { setValue, trigger, getValues } = useFormContext()
  const {
    field,
    fieldState: { error, isTouched, isDirty },
  } = useController({
    name: fieldName,
    control,
  })

  showError = showError ?? (isTouched || isDirty)
  const isMaxSelected = maxSelectedFieldName ? getValues(maxSelectedFieldName) : false
  const token = selectedAsset.token
  const value = field.value === '' ? '0' : field.value

  function toggleIsMaxSelected() {
    if (maxSelectedFieldName) {
      setValue(maxSelectedFieldName, !isMaxSelected, {
        shouldValidate: true,
      })
    }
  }

  const setMaxValue = maxValue?.gt(0)
    ? () => {
        setValue(fieldName, formFormat(maxValue, token.decimals) as any, {
          shouldValidate: true,
        })
        toggleIsMaxSelected()
      }
    : undefined

  const inputValue = (() => {
    if (isMaxSelected) {
      const valueAsBigNumber = BigNumber(field.value)
      if (!valueAsBigNumber.isNaN()) {
        return valueAsBigNumber.dp(6).toFixed()
      }
    }

    return field.value
  })()

  const optionalGridColsNum = Number(!!onRemove) + Number(!!maxValue)

  return (
    <div className="flex flex-col gap-2">
      {label && <div className="typography-label-3 text-secondary">{label}</div>}
      <div
        className={cn(
          'grid items-center gap-3 p-2 pr-4',
          'rounded-sm border border-primary bg-secondary',
          'focus-within:border-brand-primary',
          disabled && 'cursor-not-allowed bg-secondary/50',
          showError && error && 'border-error-200 bg-system-error-primary',
          optionalGridColsNum === 0 && 'grid-cols-[auto_1fr]',
          optionalGridColsNum === 1 && 'grid-cols-[auto_1fr_auto]',
          optionalGridColsNum === 2 && 'grid-cols-[auto_1fr_auto_auto]',
        )}
      >
        <div className="min-w-[120px]">
          <AssetSelector
            assets={selectorAssets}
            selectedAsset={token}
            setSelectedAsset={setSelectedAsset}
            disabled={disabled}
          />
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <input
            type="text"
            inputMode="decimal"
            className={cn(
              'typography-label-2 text-primary focus:outline-none',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            placeholder="0"
            size={1} // force minimum width
            autoComplete="off"
            data-testid={testIds.component.AssetInput.input}
            {...field}
            disabled={disabled}
            value={inputValue}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/,/g, '.')
              e.target.value = e.target.value.replace(/\s/g, '')
              const value = e.target.value
              if (!value || (decimalNumberRegex.test(value) && (value.split('.')[1]?.length ?? 0) <= token.decimals)) {
                field.onChange(e)
                if (maxSelectedFieldName) {
                  setValue(maxSelectedFieldName, false, {
                    shouldValidate: true,
                  })
                }
                // always trigger validation of the whole form
                trigger().catch(console.error)
              }
            }}
          />
          <div className={cn('typography-label-4 truncate text-secondary', disabled && 'opacity-50')}>
            {token.formatUSD(NormalizedUnitNumber(parseBigNumber(value, 0)))}
          </div>
        </div>
        {maxValue?.gt(0) && (
          <div className="flex flex-col items-end justify-center gap-0.5">
            <button
              onClick={disabled ? undefined : setMaxValue}
              className={cn(
                'typography-label-3 text-brand-primary hover:text-primary-950 disabled:text-secondary',
                disabled && 'cursor-not-allowed opacity-50',
              )}
              disabled={disabled || isMaxSelected}
              data-testid={testIds.component.AssetInput.maxButton}
            >
              MAX
            </button>
            <div className={cn('typography-body-4 text-secondary', disabled && 'opacity-50')}>
              {token.format(maxValue, { style: 'compact' })} {token.symbol}
            </div>
          </div>
        )}
        {onRemove && <IconButton icon={XIcon} onClick={onRemove} variant="transparent" size="m" />}
      </div>
      {showError && error && (
        <div data-testid={testIds.component.AssetInput.error} className="typography-label-4 text-system-error-primary">
          {error.message}
        </div>
      )}
    </div>
  )
}

const decimalNumberRegex = /^\d+\.?\d*$/
