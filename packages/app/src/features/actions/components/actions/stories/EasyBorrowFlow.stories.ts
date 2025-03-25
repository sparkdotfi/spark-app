import { WithClassname, WithTooltipProvider } from '@sb/decorators'
import { tokens } from '@sb/tokens'
import { getMobileStory, getTabletStory } from '@sb/viewports'
import { Meta, StoryObj } from '@storybook/react'
import { zeroAddress } from 'viem'

import { ActionHandler } from '@/features/actions/logic/types'
import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { CheckedAddress } from '@sparkdotfi/common-universal'

import { Actions } from '../Actions'
import { allActionHandlers } from './allActionHandlers'

const meta: Meta<typeof Actions> = {
  title: 'Features/Actions/ActionsGrid/EasyBorrowFlow',
  component: Actions,
  decorators: [WithTooltipProvider(), WithClassname('max-w-3xl')],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof Actions>

const actionHandlers: ActionHandler[] = [
  {
    action: {
      type: 'approve',
      token: tokens.wstETH,
      spender: CheckedAddress(zeroAddress),
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'success' },
    onAction: () => {},
  },
  {
    action: {
      type: 'deposit',
      token: tokens.wstETH,
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'success' },
    onAction: () => {},
  },
  {
    action: {
      type: 'approve',
      token: tokens.rETH,
      spender: CheckedAddress(zeroAddress),
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'loading' },
    onAction: () => {},
  },
  {
    action: {
      type: 'deposit',
      token: tokens.rETH,
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'disabled' },
    onAction: () => {},
  },
  { ...allActionHandlers.borrow, state: { status: 'disabled' } },
]

export const EasyBorrowFlow: Story = {
  name: 'Easy Borrow Flow',
  args: {
    actionHandlers,
    layout: 'extended',
  },
}

export const EasyBorrowFlowMobile: Story = {
  name: 'Easy Borrow Flow (Mobile)',
  ...getMobileStory(EasyBorrowFlow),
}

export const EasyBorrowFlowTablet: Story = {
  name: 'Easy Borrow Flow (Tablet)',
  ...getTabletStory(EasyBorrowFlow),
}

export const EasyBorrowFlowWithError: Story = {
  name: 'Easy Borrow Flow (With Error)',
  args: {
    ...EasyBorrowFlow.args,
    actionHandlers: actionHandlers.map((handler, index) => {
      if (index === 2) {
        return {
          ...handler,
          state: {
            status: 'error',
            message: 'Transaction rejected by user. This is lengthy error message. Layout test.',
          },
        }
      }
      return handler
    }),
  },
}

export const EasyBorrowFlowWithErrorMobile: Story = {
  name: 'Easy Borrow Flow (With Error, Mobile)',
  ...getMobileStory(EasyBorrowFlowWithError),
}
export const EasyBorrowFlowWithErrorTablet: Story = {
  name: 'Easy Borrow Flow (With Error, Tablet)',
  ...getTabletStory(EasyBorrowFlowWithError),
}
