import { getChainConfigEntry } from '@/config/chain'
import { Token } from '@/domain/types/Token'
import { USD_MOCK_TOKEN } from '@/domain/types/Token'
import { isTokenImageAvailable } from '@/ui/assets'
import { Button } from '@/ui/atoms/button/Button'
import { Panel } from '@/ui/atoms/panel/Panel'
import { Skeleton } from '@/ui/atoms/skeleton/Skeleton'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'
import { Info } from '@/ui/molecules/info/Info'
import { cn } from '@/ui/utils/style'
import { NormalizedNumber, raise } from '@sparkdotfi/common-universal'
import { AlertTriangleIcon, ChevronRightIcon } from 'lucide-react'
import { UseClaimableRewardsSummaryResult } from '../../logic/useClaimableRewardsSummary'
import { ClaimableReward } from '../../types'
import { EarnRewardsBanner } from '../earn-rewards-banner/EarnRewardsBanner'

export interface ClaimAllPanelProps {
  claimableRewardsSummaryResult: UseClaimableRewardsSummaryResult
  selectNetwork: () => void
  className?: string
}

export function ClaimAllPanel({ claimableRewardsSummaryResult, selectNetwork, className }: ClaimAllPanelProps) {
  if (claimableRewardsSummaryResult.isPending) {
    return <PendingPanel className={className} />
  }

  if (claimableRewardsSummaryResult.isError) {
    return <ErrorPanel className={className} />
  }

  const { usdSum, isClaimEnabled, claimableRewardsWithPrice, claimableRewardsWithoutPrice, claimAll, chainId } =
    claimableRewardsSummaryResult.data

  if (claimableRewardsWithPrice.length === 0 && claimableRewardsWithoutPrice.length === 0) {
    return <EarnRewardsBanner className={className} />
  }

  return (
    <MainPanel className={cn(className)}>
      {usdSum.gt(0) && (
        <ClaimableRewardsWithPriceSubPanel
          usdSum={usdSum}
          claimableRewardsWithPrice={claimableRewardsWithPrice}
          claimableRewardsWithoutPrice={claimableRewardsWithoutPrice}
        />
      )}
      {usdSum.eq(0) && isClaimEnabled && (
        <ClaimableRewardsWithoutPriceSubPanel claimableRewardsWithoutPrice={claimableRewardsWithoutPrice} />
      )}
      {usdSum.eq(0) && !isClaimEnabled && <PendingRewardsSubPanel />}
      <div className="flex flex-col gap-2 p-4">
        <div className="typography-label-2 flex justify-between py-3 text-primary-inverse">
          Network
          <button
            onClick={selectNetwork}
            className={cn(
              'flex items-center gap-1.5',
              'cursor-pointer rounded-[1px] focus-visible:outline-none focus-visible:ring',
              'focus-visible:ring-primary-200 focus-visible:ring-offset-0',
            )}
          >
            <img src={getChainConfigEntry(chainId).meta.logo} alt="network logo" className="size-4" />
            {getChainConfigEntry(chainId).meta.name}
            <ChevronRightIcon className="icon-xs icon-secondary -ml-1.5" />
          </button>
        </div>
        <Button variant="primary" className="w-full" onClick={claimAll} disabled={!isClaimEnabled}>
          Claim all
        </Button>
      </div>
    </MainPanel>
  )
}

export function PendingPanel({ className }: { className?: string }) {
  return (
    <MainPanel className={cn(className)}>
      <SubPanel>
        <Skeleton className="h-5 w-24 bg-primary/10" />
        <Skeleton className="mb-7 h-12 w-52 bg-primary/10" />
      </SubPanel>
      <div className="flex flex-col gap-2.5 p-4">
        <Skeleton className="my-2 h-6 w-1/3 bg-primary/10" />
        <Skeleton className="h-10 w-full bg-primary/10" />
      </div>
    </MainPanel>
  )
}

function ErrorPanel({ className }: { className?: string }) {
  return (
    <MainPanel className={cn('flex h-[342px] items-center justify-center', className)}>
      <div
        className={cn(
          'typography-label-3 inline-flex items-center gap-2 rounded-full',
          'mb-1 bg-secondary/20 px-3 py-1 text-primary-inverse/60',
        )}
      >
        <AlertTriangleIcon className="icon-xs" /> Failed to load rewards data
      </div>
    </MainPanel>
  )
}

function MainPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Panel variant="secondary" spacing="none" className={cn('rounded-sm p-2', className)}>
      {children}
    </Panel>
  )
}

function SubPanel({ children }: { children: React.ReactNode }) {
  return (
    <Panel
      variant="quaternary"
      spacing="none"
      className="flex min-h-[164px] flex-col items-center justify-center gap-3 py-12 md:min-h-[174px]"
    >
      {children}
    </Panel>
  )
}

function OneTokenWithoutPrice({ tokens }: { tokens: ClaimableReward[] }) {
  const { token, amountToClaim } = tokens[0] ?? raise('No token to display')

  return (
    <div className="typography-heading-2 flex items-center gap-2 text-primary-inverse">
      <div>{token.format(amountToClaim, { style: 'compact' })}</div>
      <TokenIconOrSymbol token={token} iconClassName="size-6 md:size-8" />
    </div>
  )
}

function MultipleTokensWithoutPrice({ tokens }: { tokens: ClaimableReward[] }) {
  return (
    <div className="flex flex-col gap-2">
      {tokens.map(({ token, amountToClaim }) => (
        <div key={token.symbol} className="typography-heading-4 flex items-center gap-1 text-primary-inverse">
          {token.format(amountToClaim, { style: 'compact' })}{' '}
          <TokenIconOrSymbol token={token} iconClassName="size-4 md:size-6" />
        </div>
      ))}
    </div>
  )
}

function TokenIconOrSymbol({ token, iconClassName }: { token: Token; iconClassName?: string }) {
  return isTokenImageAvailable(token.symbol) ? <TokenIcon token={token} className={iconClassName} /> : token.symbol
}

interface ClaimableRewardsWithPriceSubPanelProps {
  usdSum: NormalizedNumber
  claimableRewardsWithPrice: ClaimableReward[]
  claimableRewardsWithoutPrice: ClaimableReward[]
}

function ClaimableRewardsWithPriceSubPanel({
  usdSum,
  claimableRewardsWithPrice,
  claimableRewardsWithoutPrice,
}: ClaimableRewardsWithPriceSubPanelProps) {
  return (
    <SubPanel>
      <div className="flex items-center gap-1">
        <div className="typography-label-2 text-tertiary">Total to claim</div>
        <Info>Sum of all rewards available to claim in USD.</Info>
      </div>
      <div className="flex items-center gap-2">
        <div className="typography-heading-2 text-primary-inverse">{USD_MOCK_TOKEN.formatUSD(usdSum)}</div>
        <IconStack size="m" items={claimableRewardsWithPrice.map(({ token }) => token)} />
      </div>
      <div className="flex flex-col gap-2">
        {claimableRewardsWithoutPrice.map(({ token, amountToClaim }) => (
          <div key={token.symbol} className="typography-label-2 flex items-center gap-1 text-tertiary">
            +{token.format(amountToClaim, { style: 'compact' })}{' '}
            <TokenIconOrSymbol token={token} iconClassName="size-4" />
          </div>
        ))}
      </div>
    </SubPanel>
  )
}

function PendingRewardsSubPanel() {
  return (
    <SubPanel>
      <div className="flex items-center gap-1">
        <div className="typography-label-2 text-tertiary">Total to claim</div>
        <Info>You have nothing to claim at the moment.</Info>
      </div>
      <div className="typography-heading-2 text-primary-inverse">{USD_MOCK_TOKEN.formatUSD(NormalizedNumber.ZERO)}</div>
    </SubPanel>
  )
}

interface ClaimableRewardsWithoutPriceSubPanelProps {
  claimableRewardsWithoutPrice: ClaimableReward[]
}

function ClaimableRewardsWithoutPriceSubPanel({
  claimableRewardsWithoutPrice,
}: ClaimableRewardsWithoutPriceSubPanelProps) {
  return (
    <SubPanel>
      <div className="flex items-center gap-1">
        <div className="typography-label-2 text-tertiary">Total to claim</div>
        <Info>All tokens you can claim.</Info>
      </div>
      {claimableRewardsWithoutPrice.length === 1 ? (
        <OneTokenWithoutPrice tokens={claimableRewardsWithoutPrice} />
      ) : (
        <MultipleTokensWithoutPrice tokens={claimableRewardsWithoutPrice} />
      )}
    </SubPanel>
  )
}
