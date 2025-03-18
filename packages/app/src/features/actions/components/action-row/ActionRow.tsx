import { Token } from '@/domain/types/Token'
import SuccessIcon from '@/ui/assets/icons/success.svg?react'
import WarningIcon from '@/ui/assets/icons/warning.svg?react'
import { Button } from '@/ui/atoms/button/Button'
import { HorizontalScroll } from '@/ui/atoms/horizontal-scroll/HorizontalScroll'
import { IconStack } from '@/ui/molecules/icon-stack/IconStack'
import { cn } from '@/ui/utils/style'
import { testIds } from '@/ui/utils/testIds'
import { assert, NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { cva } from 'class-variance-authority'
import { ComponentType, ReactNode, createContext, useContext } from 'react'
import { ActionHandlerState, BatchActionHandlerState } from '../../logic/types'
import { ActionsGridLayout } from '../../types'
import { ErrorWarning as ErrorWarningComponent } from './components/ErrorWarning'

export interface ActionRowProps {
  actionIndex: number
  actionHandlerState: ActionHandlerState | BatchActionHandlerState
  onAction?: () => void
  layout: ActionsGridLayout
  children: ReactNode
}

const ActionRowContext = createContext<Omit<ActionRowProps, 'children'> | null>(null)

function useActionRowContext() {
  const context = useContext(ActionRowContext)
  assert(context, 'useActionRowContext must be used within ActionRow')
  return context
}

function ActionRow({ children, actionHandlerState, actionIndex, onAction, layout }: ActionRowProps) {
  return (
    <div
      className={cn(
        'col-span-full grid grid-cols-subgrid items-center',
        'gap-y-3 border-b border-b-primary p-4 last:border-none sm:p-5',
        layout === 'compact' && 'sm:p-4',
      )}
      data-testid={testIds.actions.row(actionIndex)}
    >
      <ActionRowContext.Provider value={{ actionHandlerState, actionIndex, onAction, layout }}>
        {children}
      </ActionRowContext.Provider>
    </div>
  )
}

const iconVariants = cva(
  cn(
    'typography-label-3 grid h-6 w-12 grid-cols-[1fr_1px_1fr] items-center',
    'justify-items-center rounded-xs transition-all delay-500 duration-200 sm:h-8 sm:w-16',
  ),
  {
    variants: {
      variant: {
        disabled: 'bg-secondary text-primary',
        ready: 'bg-brand-primary text-brand-primary',
        loading: 'bg-brand-primary text-brand-primary',
        success: 'bg-system-success-primary text-system-success-primary',
        error: 'bg-system-error-primary text-system-error-primary',
      },
    },
  },
)

function Icon({ icon }: { icon: ComponentType<{ className?: string }> }) {
  const { actionIndex, actionHandlerState } = useActionRowContext()

  const Icon =
    actionHandlerState.status === 'success' ? SuccessIcon : actionHandlerState.status === 'error' ? WarningIcon : icon

  return (
    <div className={cn(iconVariants({ variant: actionHandlerState.status }), actionIndex === 0 && 'delay-0')}>
      <div className="text-primary">{actionIndex + 1}</div>
      <div className="h-full w-px bg-primary" />
      <Icon className="icon-xs" />
    </div>
  )
}

function Title({ children }: { children: ReactNode }) {
  const { actionHandlerState } = useActionRowContext()

  return (
    <HorizontalScroll
      className={cn(
        'typography-label-2 col-span-2 flex items-center gap-1.5',
        'sm:overflow-visible md:col-span-1',
        actionHandlerState.status === 'success' && 'text-secondary',
      )}
    >
      {children}
    </HorizontalScroll>
  )
}

function TitleTokens({ tokens }: { tokens: Token[] }) {
  const { actionHandlerState } = useActionRowContext()

  return (
    <IconStack
      items={tokens}
      className={cn('shrink-0', actionHandlerState.status === 'success' && 'opacity-60')}
      stackingOrder="last-on-top"
    />
  )
}

// @note: Optional component, displayed only in extended action row layout
function Amount({ token, amount }: { token: Token; amount: NormalizedUnitNumber }) {
  const { actionHandlerState, layout } = useActionRowContext()

  if (layout === 'compact') {
    return null
  }

  return (
    <div
      className={cn(
        'typography-label-2 col-span-full col-start-2 md:col-span-1',
        actionHandlerState.status === 'success' && 'text-secondary',
      )}
    >
      {token.format(amount, { style: 'auto' })}{' '}
      <span className={cn('text-secondary', actionHandlerState.status === 'success' && 'text-tertiary')}>
        {token.symbol}
      </span>
    </div>
  )
}

function ErrorWarning() {
  const { actionHandlerState, layout } = useActionRowContext()

  if (actionHandlerState.status !== 'error') {
    return null
  }

  return (
    <ErrorWarningComponent
      message={actionHandlerState.message}
      className={cn(
        'col-span-full col-start-2 md:col-span-1',
        layout === 'compact' ? 'md:col-start-3' : 'md:col-start-4',
      )}
    />
  )
}

function Trigger({ children, beforeAction }: { children: ReactNode; beforeAction?: () => void }) {
  const { actionHandlerState, onAction } = useActionRowContext()

  if (onAction === undefined) {
    return null
  }

  return (
    <div
      className={cn(
        'col-span-full min-w-[5rem] md:col-span-1 md:col-start-[-1] md:w-auto',
        actionHandlerState.status === 'success' && 'hidden md:invisible md:block',
      )}
    >
      <Button
        variant="primary"
        size="m"
        onClick={() => {
          try {
            beforeAction?.()
          } catch (error) {
            // ignore errors
            console.error(error)
          }
          onAction()
        }}
        loading={actionHandlerState.status === 'loading'}
        disabled={actionHandlerState.status === 'disabled'}
        className="w-full"
      >
        {actionHandlerState.status === 'error' ? 'Try Again' : children}
      </Button>
    </div>
  )
}

ActionRow.Icon = Icon
ActionRow.Title = Title
Title.Tokens = TitleTokens
ActionRow.Amount = Amount
ActionRow.ErrorWarning = ErrorWarning
ActionRow.Trigger = Trigger

export { ActionRow }
