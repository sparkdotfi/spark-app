import { NormalizedNumber, Percentage } from '@sparkdotfi/common-universal'
import BigNumber from 'bignumber.js'
import { validateSetUserEMode } from './validateSetUserEMode'

describe(validateSetUserEMode.name, () => {
  describe('returns validation issue', () => {
    it('validates that requested eMode category has correct liquidation threshold', () => {
      expect(
        validateSetUserEMode({
          requestedEModeCategory: {
            id: 1,
            liquidationThreshold: Percentage(0),
          },
          user: {
            eModeCategoryId: 0,
            reserves: [],
          },
        }),
      ).toBe('inconsistent-liquidation-threshold')
    })

    it('validates that user has no borrows with different eMode category', () => {
      const requestedEModeCategory = {
        id: 1,
        liquidationThreshold: Percentage(0.1),
      }

      expect(
        validateSetUserEMode({
          requestedEModeCategory,
          user: {
            eModeCategoryId: 0,
            reserves: [{ eModeCategoryId: 2, borrowBalance: NormalizedNumber(1) }],
          },
        }),
      ).toBe('borrowed-assets-emode-category-mismatch')

      expect(
        validateSetUserEMode({
          requestedEModeCategory,
          user: {
            eModeCategoryId: 0,
            reserves: [
              { eModeCategoryId: 1, borrowBalance: NormalizedNumber(2) },
              { eModeCategoryId: 2, borrowBalance: NormalizedNumber(1) },
            ],
          },
        }),
      ).toBe('borrowed-assets-emode-category-mismatch')
    })

    it('validates that user health factor after changing eMode category is greater than 1', () => {
      expect(
        validateSetUserEMode({
          requestedEModeCategory: {
            id: 2,
            liquidationThreshold: Percentage(0.1),
          },
          user: {
            eModeCategoryId: 1,
            reserves: [],
            healthFactorAfterChangingEMode: BigNumber(0.9),
          },
        }),
      ).toBe('exceeds-ltv')
    })
  })

  describe('returns undefined', () => {
    it('validates that requested eMode category has correct liquidation threshold', () => {
      expect(
        validateSetUserEMode({
          requestedEModeCategory: {
            id: 1,
            liquidationThreshold: Percentage(0.1),
          },
          user: {
            eModeCategoryId: 0,
            reserves: [],
          },
        }),
      ).toBe(undefined)
    })

    it('validates that user has no borrows with different eMode category', () => {
      const requestedEModeCategory = {
        id: 1,
        liquidationThreshold: Percentage(0.1),
      }

      expect(
        validateSetUserEMode({
          requestedEModeCategory,
          user: {
            eModeCategoryId: 0,
            reserves: [
              { eModeCategoryId: 1, borrowBalance: NormalizedNumber(1) },
              { eModeCategoryId: 1, borrowBalance: NormalizedNumber(2) },
              { eModeCategoryId: 2, borrowBalance: NormalizedNumber.ZERO },
            ],
          },
        }),
      ).toBe(undefined)
    })

    it('validates when user changes eMode to 0 category', () => {
      const requestedEModeCategory = {
        id: 0,
        liquidationThreshold: undefined,
      }

      expect(
        validateSetUserEMode({
          requestedEModeCategory,
          user: {
            eModeCategoryId: 1,
            reserves: [
              { eModeCategoryId: 1, borrowBalance: NormalizedNumber(1) },
              { eModeCategoryId: 1, borrowBalance: NormalizedNumber(2) },
            ],
          },
        }),
      ).toBe(undefined)
    })

    it('validates that user health factor after changing eMode category is greater than 1', () => {
      expect(
        validateSetUserEMode({
          requestedEModeCategory: {
            id: 2,
            liquidationThreshold: Percentage(0.1),
          },
          user: {
            eModeCategoryId: 1,
            reserves: [],
            healthFactorAfterChangingEMode: BigNumber(1.1),
          },
        }),
      ).toBe(undefined)
    })
  })
})
