import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { getBorrowMaxValue } from './getBorrowMaxValue'

describe(getBorrowMaxValue.name, () => {
  describe('unlimited liquidity', () => {
    it('returns 0 when no collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedNumber.ZERO,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedNumber.ZERO,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
          },
        }),
      ).toEqual(NormalizedNumber(99))
    })

    it('returns borrow cap based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedNumber(50),
            borrowCap: NormalizedNumber(100),
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(Number.POSITIVE_INFINITY),
          },
        }),
      ).toEqual(NormalizedNumber(50))
    })
  })

  describe('limited liquidity', () => {
    it('returns 0 when collateral based borrow limit 0', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedNumber(10),
            totalDebt: NormalizedNumber.ZERO,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns available liquidity based value when smaller than borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedNumber(10),
            totalDebt: NormalizedNumber(5),
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
          },
        }),
      ).toEqual(NormalizedNumber(10))
    })
  })

  describe('isolation mode', () => {
    it('returns 0 when no collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber.ZERO,
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber.ZERO,
            isolationModeCollateralDebtCeiling: NormalizedNumber(100),
          },
          asset: {
            availableLiquidity: NormalizedNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber.ZERO,
            isolationModeCollateralDebtCeiling: NormalizedNumber(100),
          },
          asset: {
            availableLiquidity: NormalizedNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedNumber(99))
    })

    it('returns correct value when isolation mode collateral debt and ceiling present', () => {
      expect(
        getBorrowMaxValue({
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber(50),
            isolationModeCollateralDebtCeiling: NormalizedNumber(100),
          },

          asset: {
            availableLiquidity: NormalizedNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedNumber(50))
    })
  })

  describe('existing borrow validation issue', () => {
    const userAndAsset = {
      user: {
        maxBorrowBasedOnCollateral: NormalizedNumber(100),
      },
      asset: {
        availableLiquidity: NormalizedNumber(100),
        totalDebt: NormalizedNumber.ZERO,
      },
    }

    it('returns 0 when reserve not active', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'reserve-not-active',
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns 0 when reserve borrowing disabled', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'reserve-borrowing-disabled',
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns 0 when asset not borrowable in isolation', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'asset-not-borrowable-in-isolation',
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns 0 when siloed mode cannot enable', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'siloed-mode-cannot-enable',
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns 0 when siloed mode enabled', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'siloed-mode-enabled',
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })

    it('returns 0 when emode category mismatch', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'emode-category-mismatch',
        }),
      ).toEqual(NormalizedNumber.ZERO)
    })
  })
})
