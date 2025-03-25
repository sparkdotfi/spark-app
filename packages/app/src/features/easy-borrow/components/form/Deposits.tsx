import { paths } from '@/config/paths'
import { TokenWithBalance } from '@/domain/common/types'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { Button, ButtonIcon } from '@/ui/atoms/button/Button'
import { Link } from '@/ui/atoms/link/Link'
import { Panel } from '@/ui/atoms/panel/Panel'
import { Info } from '@/ui/molecules/info/Info'
import { AssetInput } from '@/ui/organisms/asset-input/AssetInput'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { PlusIcon } from 'lucide-react'
import { Control } from 'react-hook-form'
import { EasyBorrowFormSchema } from '../../logic/form/validation'
import { ExistingPosition } from '../../logic/types'
import { TokenSummary } from './TokenSummary'

export interface DepositsProps {
  selectedAssets: TokenWithBalance[]
  allAssets: TokenWithBalance[]
  assetToMaxValue: Record<TokenSymbol, NormalizedUnitNumber>
  addAsset: () => void
  removeAsset: (index: number) => void
  changeAsset: (index: number, newAssetSymbol: TokenSymbol) => void
  alreadyDeposited: ExistingPosition
  control: Control<EasyBorrowFormSchema>
  maxSelectedFieldName?: string
  disabled?: boolean
}

export function Deposits({
  selectedAssets,
  allAssets,
  addAsset,
  changeAsset,
  removeAsset,
  control,
  assetToMaxValue,
  maxSelectedFieldName,
  alreadyDeposited,
  disabled,
}: DepositsProps) {
  const showTokenSummary = alreadyDeposited.tokens.length > 0

  return (
    <Panel className="flex flex-col" data-testid={testIds.easyBorrow.form.deposits} spacing="none">
      <Panel className={cn('flex flex-1 flex-col gap-4 bg-primary', showTokenSummary && 'rounded-b-none')}>
        <div className="flex items-center justify-between">
          <div className="flex h-8 flex-row items-center gap-1">
            <h4 className="typography-heading-5 text-primary">Deposit</h4>
            <Info>
              Some assets (e.g., isolated assets) are only accessible via the{' '}
              <Link to={paths.myPortfolio}>My portfolio</Link> at this time.
            </Info>
          </div>

          <Button
            onClick={addAsset}
            disabled={allAssets.length === selectedAssets.length || disabled}
            variant="transparent"
            size="s"
            spacing="s"
          >
            Add more
            <ButtonIcon icon={PlusIcon} />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          {selectedAssets.map((asset, index) => {
            return (
              <div key={asset.token.symbol} data-testid={testIds.component.MultiAssetSelector.group}>
                <AssetInput
                  fieldName={`assetsToDeposit.${index}.value`}
                  control={control}
                  selectorAssets={allAssets.filter(
                    (s) => !selectedAssets.some((a) => a.token.symbol === s.token.symbol),
                  )}
                  selectedAsset={asset}
                  setSelectedAsset={(newAsset) => changeAsset(index, newAsset)}
                  onRemove={selectedAssets.length > 1 ? () => removeAsset(index) : undefined}
                  maxValue={assetToMaxValue[asset.token.symbol]}
                  disabled={disabled}
                  maxSelectedFieldName={maxSelectedFieldName && `assetsToDeposit.${index}.${maxSelectedFieldName}`}
                />
              </div>
            )
          })}
        </div>
      </Panel>
      {showTokenSummary && (
        <Panel className="rounded-t-none bg-secondary px-8 py-3.5" spacing="none">
          <TokenSummary position={alreadyDeposited} type="deposit" />
        </Panel>
      )}
    </Panel>
  )
}
