import { ActionHandler, ActionType } from '@/features/actions/logic/types'
import { getMockReserve } from '@/test/integration/constants'
import { BaseUnitNumber, Hex, NormalizedUnitNumber } from '@marsfoundation/common-universal'
import { CheckedAddress } from '@marsfoundation/common-universal'
import { tokens } from '@sb/tokens'
import { times } from 'remeda'
import { parseEther, zeroAddress } from 'viem'

export const allActionHandlers: Record<ActionType, ActionHandler> = {
  approve: {
    action: {
      type: 'approve',
      token: tokens.wstETH,
      spender: CheckedAddress(zeroAddress),
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  permit: {
    action: {
      type: 'permit',
      token: tokens.wstETH,
      spender: CheckedAddress(zeroAddress),
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  approveDelegation: {
    action: {
      type: 'approveDelegation',
      token: tokens.WETH,
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  borrow: {
    action: {
      type: 'borrow',
      token: tokens.DAI,
      value: NormalizedUnitNumber(1233.34),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  deposit: {
    action: {
      type: 'deposit',
      token: tokens.wstETH,
      value: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  repay: {
    action: {
      type: 'repay',
      reserve: getMockReserve({
        token: tokens.DAI,
      }),
      value: NormalizedUnitNumber(1233.34),
      useAToken: false,
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  setUseAsCollateral: {
    action: {
      type: 'setUseAsCollateral',
      token: tokens.rETH,
      useAsCollateral: true,
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  setUserEMode: {
    action: {
      type: 'setUserEMode',
      eModeCategoryId: 1,
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  withdraw: {
    action: {
      type: 'withdraw',
      token: tokens.wstETH,
      value: NormalizedUnitNumber(12),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  depositToSavings: {
    action: {
      type: 'depositToSavings',
      token: tokens.DAI,
      savingsToken: tokens.sDAI,
      value: NormalizedUnitNumber(1023),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  withdrawFromSavings: {
    action: {
      type: 'withdrawFromSavings',
      savingsToken: tokens.sDAI,
      token: tokens.DAI,
      amount: NormalizedUnitNumber(1023),
      mode: 'withdraw',
      isRedeem: false,
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  claimMarketRewards: {
    action: {
      type: 'claimMarketRewards',
      assets: [CheckedAddress(zeroAddress)],
      incentiveControllerAddress: CheckedAddress(zeroAddress),
      token: tokens.wstETH,
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  upgrade: {
    action: {
      type: 'upgrade',
      fromToken: tokens.DAI,
      toToken: tokens.USDS,
      amount: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  downgrade: {
    action: {
      type: 'downgrade',
      fromToken: tokens.USDS,
      toToken: tokens.DAI,
      amount: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  stake: {
    action: {
      type: 'stake',
      stakingToken: tokens.USDS,
      stakeAmount: NormalizedUnitNumber(1),
      rewardToken: tokens.SKY,
      farm: CheckedAddress(zeroAddress),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  unstake: {
    action: {
      type: 'unstake',
      stakingToken: tokens.USDS,
      amount: NormalizedUnitNumber(1),
      rewardToken: tokens.SKY,
      farm: CheckedAddress(zeroAddress),
      exit: false,
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  psmConvert: {
    action: {
      type: 'psmConvert',
      inToken: tokens.USDC,
      outToken: tokens.DAI,
      amount: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  claimFarmRewards: {
    action: {
      type: 'claimFarmRewards',
      farm: CheckedAddress(zeroAddress),
      rewardToken: tokens.USDS,
      rewardAmount: NormalizedUnitNumber(1),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  claimSparkRewards: {
    action: {
      type: 'claimSparkRewards',
      token: tokens.USDS,
      epoch: 1,
      cumulativeAmount: NormalizedUnitNumber(1),
      merkleRoot: Hex.random(),
      merkleProof: times(7, () => Hex.random()),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  stakeSpark: {
    action: {
      type: 'stakeSpark',
      spk: tokens.SPK,
      amount: NormalizedUnitNumber(1_232.12),
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
  unstakeSpark: {
    action: {
      type: 'unstakeSpark',
      spk: tokens.SPK,
      amount: NormalizedUnitNumber(1_232.12),
      accountActiveShares: BaseUnitNumber(parseEther('1')),
      unstakeAll: false,
    },
    state: { status: 'ready' },
    onAction: () => {},
  },
}
