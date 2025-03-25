import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { getDepositMaxValue } from './getDepositMaxValue'

describe(getDepositMaxValue.name, () => {
  describe('not active reserve', () => {
    it('returns 0 for frozen reserve', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'frozen',
            totalLiquidity: NormalizedUnitNumber(0),
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(0))
    })

    it('returns 0 for paused reserve', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'paused',
            totalLiquidity: NormalizedUnitNumber(0),
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(0))
    })
  })

  describe('no supply cap', () => {
    it('returns 0 when no balance', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(0) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(10),
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(0))
    })

    it('returns balance', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(0),
            isNativeAsset: false,
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(100))
    })

    it('retains some native asset', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(0),
            isNativeAsset: true,
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0.01) },
        }),
      ).toEqual(NormalizedUnitNumber(99.99))
    })
  })

  describe('supply cap', () => {
    it('returns 0 when no balance', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(0) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(0),
            isNativeAsset: false,
            supplyCap: NormalizedUnitNumber(100),
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(0))
    })

    it('returns 0 when supply cap reached', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(100),
            isNativeAsset: false,
            supplyCap: NormalizedUnitNumber(100),
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(0))
    })

    it('returns supply cap when balance is greater than supply cap', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(0),
            isNativeAsset: false,
            supplyCap: NormalizedUnitNumber(50),
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(50))
    })

    it('returns available to supply value', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(25),
            isNativeAsset: false,
            supplyCap: NormalizedUnitNumber(50),
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(25))
    })

    it('returns available to supply value for capped by liquidity', () => {
      expect(
        getDepositMaxValue({
          user: { balance: NormalizedUnitNumber(100) },
          asset: {
            status: 'active',
            totalLiquidity: NormalizedUnitNumber(25),
            isNativeAsset: false,
            supplyCap: NormalizedUnitNumber(50),
          },
          chain: { minRemainingNativeAsset: NormalizedUnitNumber(0) },
        }),
      ).toEqual(NormalizedUnitNumber(25))
    })
  })
})
