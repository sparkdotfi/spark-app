import { Token } from '@/domain/types/Token'
import { TokenSymbol } from '@/domain/types/TokenSymbol'
import { TokenIcon } from '@/ui/atoms/token-icon/TokenIcon'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { cva } from 'class-variance-authority'
import { ShortAccountDefinition } from '../../logic/useSavings'

export interface AccountsNavigationProps {
  accounts: ShortAccountDefinition[]
  selectedAccount: TokenSymbol
  setSelectedAccount: (savingsTokenSymbol: TokenSymbol) => void
  variant: 'horizontal' | 'vertical'
  className?: string
}

export function AccountsNavigation({
  accounts,
  selectedAccount,
  setSelectedAccount,
  variant,
  className,
}: AccountsNavigationProps) {
  return (
    <div
      className={cn(accountsNavigationVariants({ variant }), className)}
      data-testid={testIds.savings.navigation.container}
    >
      {accounts.map((account) => (
        <NavigationItem
          key={account.underlyingToken.symbol}
          active={account.savingsToken.symbol === selectedAccount}
          onClick={() => setSelectedAccount(account.savingsToken.symbol)}
          variant={variant}
          {...account}
        />
      ))}
    </div>
  )
}

const accountsNavigationVariants = cva('', {
  variants: {
    variant: {
      horizontal: 'flex',
      vertical: 'flex-col',
    },
  },
})

interface AccountNavigationItemProps {
  underlyingToken: Token
  underlyingTokenDeposit: NormalizedNumber
  active: boolean
  onClick: () => void
  variant: 'horizontal' | 'vertical'
}

function NavigationItem({
  underlyingToken,
  underlyingTokenDeposit,
  active,
  onClick,
  variant,
}: AccountNavigationItemProps) {
  const transitionStyles = cn('transition-all duration-200 ease-in-out')

  return (
    <button
      onClick={onClick}
      className={cn(navigationItemButtonVariants({ variant, active }), transitionStyles)}
      data-testid={testIds.savings.navigation.item}
    >
      <TokenIcon
        token={underlyingToken}
        className={cn(navigationItemTokenIconVariants({ variant, active }), transitionStyles)}
      />
      <div
        className={cn(
          navigationItemTextContainerVariants({ variant, active, hasDeposit: underlyingTokenDeposit.gt(0) }),
          transitionStyles,
        )}
      >
        <div className="typography-label-3 text-primary" data-testid={testIds.savings.navigation.itemLabel}>
          {underlyingToken.symbol}
        </div>
        {underlyingTokenDeposit.gt(0) && (
          <div className="typography-label-4 text-secondary" data-testid={testIds.savings.navigation.itemBalance}>
            {underlyingToken.formatUSD(underlyingTokenDeposit, { compact: true })}
          </div>
        )}
      </div>
    </button>
  )
}

const navigationItemButtonVariants = cva(
  cn(
    'relative flex-shrink-0 rounded-[10px] border border-primary bg-white shadow-xs',
    'hover:border-secondary hover:shadow-sm',
    'focus-visible:bg-primary focus-visible:text-neutral-950',
    'focus-visible:outline-none focus-visible:ring focus-visible:ring-primary-200 focus-visible:ring-offset-0',
  ),
  {
    variants: {
      variant: {
        horizontal: 'mr-2 size-28',
        vertical: 'mb-2 h-16 w-full',
      },
      active: {
        true: 'border-savings-600 hover:border-savings-500',
      },
    },
    compoundVariants: [
      {
        variant: 'vertical',
        active: true,
        className: 'h-28 w-full',
      },
      {
        variant: 'horizontal',
        active: true,
        className: 'w-36',
      },
    ],
  },
)

const navigationItemTokenIconVariants = cva('absolute size-6 translate-x-4', {
  variants: {
    variant: {
      horizontal: '-translate-y-10',
      vertical: '-translate-y-1/2',
    },
    active: {
      true: 'size-8',
    },
  },
  compoundVariants: [
    {
      variant: 'vertical',
      active: true,
      className: '-translate-y-10',
    },
  ],
})

const navigationItemTextContainerVariants = cva('absolute flex flex-col items-start gap-0.5', {
  variants: {
    variant: {
      horizontal: 'translate-x-4',
      vertical: '-translate-y-1/2 translate-x-[52px]',
    },
    hasDeposit: {
      true: 'translate-y-2',
      false: 'translate-y-6',
    },
    active: { true: undefined }, // needed for compound variants
  },
  compoundVariants: [
    {
      variant: 'vertical',
      active: false,
      className: '-translate-y-1/2',
    },
    {
      variant: 'vertical',
      active: true,
      className: 'translate-x-4',
    },
    {
      variant: 'vertical',
      active: true,
      hasDeposit: true,
      className: 'translate-y-2',
    },
    {
      variant: 'vertical',
      active: true,
      hasDeposit: false,
      className: 'translate-y-6',
    },
  ],
})
