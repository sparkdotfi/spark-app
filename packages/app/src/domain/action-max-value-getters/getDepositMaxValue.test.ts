import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { getDepositMaxValue } from './getDepositMaxValue'

describe(getDepositMaxValue.name, () => {
  describe('not active reserve', () => {
    it('returns 0 for frozen reserve', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'frozen',
            totalLiquidity: NormalizedNumber.ZERO,
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns 0 for paused reserve', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'paused',
            totalLiquidity: NormalizedNumber.ZERO,
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })
  })

  describe('no supply cap', () => {
    it('returns 0 when no balance', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber.ZERO },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber(10),
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns balance', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber.ZERO,
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber(100))
    })

    it('retains some native asset', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber.ZERO,
            isNativeAsset: true,
          },
          chain: { minRemainingNativeAsset: NormalizedNumber(0.01) },
        }),
      ).toEqual(NormalizedNumber(99.99))
    })
  })

  describe('supply cap', () => {
    it('returns 0 when no balance', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber.ZERO },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber.ZERO,
            isNativeAsset: false,
            supplyCap: NormalizedNumber(100),
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns 0 when supply cap reached', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber(100),
            isNativeAsset: false,
            supplyCap: NormalizedNumber(100),
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns supply cap when balance is greater than supply cap', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber.ZERO,
            isNativeAsset: false,
            supplyCap: NormalizedNumber(50),
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber(50))
    })

    it('returns available to supply value', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber(25),
            isNativeAsset: false,
            supplyCap: NormalizedNumber(50),
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber(25))
    })

    it('returns available to supply value for capped by liquidity', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedNumber(25),
            isNativeAsset: false,
            supplyCap: NormalizedNumber(50),
          },
          chain: { minRemainingNativeAsset: NormalizedNumber.ZERO },
        }),
      ).toEqual(NormalizedNumber(25))
    })
  })
})
