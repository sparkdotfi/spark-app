import { NormalizedUnitNumber } from '@sparkdotfi/common-universal'
import { getBorrowMaxValue } from './getBorrowMaxValue'

describe(getBorrowMaxValue.name, () => {
  describe('unlimited liquidity', () => {
    it('returns 0 when no collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedUnitNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedUnitNumber.ZERO,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedUnitNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedUnitNumber.ZERO,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber(100),
          },
        }),
      ).toEqual(NormalizedUnitNumber(99))
    })

    it('returns borrow cap based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedUnitNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedUnitNumber(50),
            borrowCap: NormalizedUnitNumber(100),
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber(Number.POSITIVE_INFINITY),
          },
        }),
      ).toEqual(NormalizedUnitNumber(50))
    })
  })

  describe('limited liquidity', () => {
    it('returns 0 when collateral based borrow limit 0', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedUnitNumber(10),
            totalDebt: NormalizedUnitNumber.ZERO,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns available liquidity based value when smaller than borrow limit', () => {
      expect(
        getBorrowMaxValue({
          asset: {
            availableLiquidity: NormalizedUnitNumber(10),
            totalDebt: NormalizedUnitNumber(5),
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber(100),
          },
        }),
      ).toEqual(NormalizedUnitNumber(10))
    })
  })

  describe('isolation mode', () => {
    it('returns 0 when no collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber.ZERO,
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedUnitNumber.ZERO,
            isolationModeCollateralDebtCeiling: NormalizedUnitNumber(100),
          },
          asset: {
            availableLiquidity: NormalizedUnitNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedUnitNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns collateral based borrow limit', () => {
      expect(
        getBorrowMaxValue({
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber(100),
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedUnitNumber.ZERO,
            isolationModeCollateralDebtCeiling: NormalizedUnitNumber(100),
          },
          asset: {
            availableLiquidity: NormalizedUnitNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedUnitNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedUnitNumber(99))
    })

    it('returns correct value when isolation mode collateral debt and ceiling present', () => {
      expect(
        getBorrowMaxValue({
          user: {
            maxBorrowBasedOnCollateral: NormalizedUnitNumber(100),
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedUnitNumber(50),
            isolationModeCollateralDebtCeiling: NormalizedUnitNumber(100),
          },

          asset: {
            availableLiquidity: NormalizedUnitNumber(Number.POSITIVE_INFINITY),
            totalDebt: NormalizedUnitNumber.ZERO,
          },
        }),
      ).toEqual(NormalizedUnitNumber(50))
    })
  })

  describe('existing borrow validation issue', () => {
    const userAndAsset = {
      user: {
        maxBorrowBasedOnCollateral: NormalizedUnitNumber(100),
      },
      asset: {
        availableLiquidity: NormalizedUnitNumber(100),
        totalDebt: NormalizedUnitNumber.ZERO,
      },
    }

    it('returns 0 when reserve not active', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'reserve-not-active',
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns 0 when reserve borrowing disabled', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'reserve-borrowing-disabled',
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns 0 when asset not borrowable in isolation', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'asset-not-borrowable-in-isolation',
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns 0 when siloed mode cannot enable', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'siloed-mode-cannot-enable',
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns 0 when siloed mode enabled', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'siloed-mode-enabled',
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })

    it('returns 0 when emode category mismatch', () => {
      expect(
        getBorrowMaxValue({
          ...userAndAsset,
          validationIssue: 'emode-category-mismatch',
        }),
      ).toEqual(NormalizedUnitNumber.ZERO)
    })
  })
})
