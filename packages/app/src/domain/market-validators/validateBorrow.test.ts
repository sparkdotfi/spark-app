import { testAddresses } from '@/test/integration/constants'

import { NormalizedNumber } from '@sparkdotfi/common-universal'
import { validateBorrow } from './validateBorrow'

describe(validateBorrow.name, () => {
  it('validates if the value is positive', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber.ZERO,
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(100),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: false,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(100),
          totalBorrowedUSD: NormalizedNumber.ZERO,
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('value-not-positive')
  })

  it('validates if the asset is active', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(100),
        asset: {
          address: testAddresses.token,
          status: 'frozen',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(100),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: false,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(100),
          totalBorrowedUSD: NormalizedNumber.ZERO,
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('reserve-not-active')
  })

  it('validates if the asset is borrowable', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(100),
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: false,
          availableLiquidity: NormalizedNumber(100),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: false,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(100),
          totalBorrowedUSD: NormalizedNumber.ZERO,
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('reserve-borrowing-disabled')
  })

  it('validates liquidity', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(101),
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(100),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: false,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(200),
          totalBorrowedUSD: NormalizedNumber.ZERO,
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('exceeds-liquidity')
  })

  it('validates borrow cap', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(101),
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(102),
          borrowCap: NormalizedNumber(100),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: false,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(200),
          totalBorrowedUSD: NormalizedNumber.ZERO,
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('borrow-cap-reached')
  })

  it('takes into account total debt when validating borrow cap', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(96),
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(102),
          borrowCap: NormalizedNumber(100),
          totalDebt: NormalizedNumber(5),
          isSiloed: false,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(200),
          totalBorrowedUSD: NormalizedNumber.ZERO,
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('borrow-cap-reached')
  })

  it('validates collateralization', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(101),
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(101),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: false,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(100),
          totalBorrowedUSD: NormalizedNumber.ZERO,
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('insufficient-collateral')
  })

  it('if borrowing a siloed asset, validates that it is the first asset to borrow', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(100),
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(100),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: true,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(100),
          totalBorrowedUSD: NormalizedNumber(10),
          isInSiloMode: false,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('siloed-mode-cannot-enable')
  })

  it('if in silo mode, validates against borrowing anything else', () => {
    expect(
      validateBorrow({
        value: NormalizedNumber(100),
        asset: {
          address: testAddresses.token,
          status: 'active',
          borrowingEnabled: true,
          availableLiquidity: NormalizedNumber(100),
          totalDebt: NormalizedNumber.ZERO,
          isSiloed: true,
          borrowableInIsolation: false,
          eModeCategory: 0,
        },
        user: {
          maxBorrowBasedOnCollateral: NormalizedNumber(100),
          totalBorrowedUSD: NormalizedNumber(10),
          isInSiloMode: true,
          siloModeAsset: testAddresses.token2,
          inIsolationMode: false,
          eModeCategory: 0,
        },
      }),
    ).toStrictEqual('siloed-mode-enabled')
  })

  describe('isolation mode', () => {
    it('if user in isolation mode, validates against borrowing something not available in isolation mode', () => {
      expect(
        validateBorrow({
          value: NormalizedNumber(100),
          asset: {
            address: testAddresses.token,
            status: 'active',
            borrowingEnabled: true,
            availableLiquidity: NormalizedNumber(100),
            totalDebt: NormalizedNumber.ZERO,
            isSiloed: false,
            borrowableInIsolation: false,
            eModeCategory: 0,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
            totalBorrowedUSD: NormalizedNumber(10),
            isInSiloMode: false,
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber(800),
            isolationModeCollateralDebtCeiling: NormalizedNumber(1_000),
            eModeCategory: 0,
          },
        }),
      ).toStrictEqual('asset-not-borrowable-in-isolation')
    })

    it('if user in isolation mode, validates against borrowing above debt ceiling', () => {
      expect(
        validateBorrow({
          value: NormalizedNumber(21),

          asset: {
            address: testAddresses.token,
            status: 'active',
            borrowingEnabled: true,
            availableLiquidity: NormalizedNumber(100),
            totalDebt: NormalizedNumber.ZERO,
            isSiloed: false,
            borrowableInIsolation: true,
            eModeCategory: 0,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
            totalBorrowedUSD: NormalizedNumber(10),
            isInSiloMode: false,
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber(80),
            isolationModeCollateralDebtCeiling: NormalizedNumber(100),
            eModeCategory: 0,
          },
        }),
      ).toStrictEqual('isolation-mode-debt-ceiling-exceeded')
    })

    it('if user in isolation mode, can match debt ceiling', () => {
      expect(
        validateBorrow({
          value: NormalizedNumber(20),
          asset: {
            address: testAddresses.token,
            status: 'active',
            borrowingEnabled: true,
            availableLiquidity: NormalizedNumber(100),
            totalDebt: NormalizedNumber.ZERO,
            isSiloed: false,
            borrowableInIsolation: true,
            eModeCategory: 0,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
            totalBorrowedUSD: NormalizedNumber(10),
            isInSiloMode: false,
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber(80),
            isolationModeCollateralDebtCeiling: NormalizedNumber(100),
            eModeCategory: 0,
          },
        }),
      ).toStrictEqual(undefined)
    })
  })

  describe('eMode', () => {
    it('if user eMode category is 0, asset category doesnt matter', () => {
      expect(
        validateBorrow({
          value: NormalizedNumber(20),
          asset: {
            address: testAddresses.token,
            status: 'active',
            borrowingEnabled: true,
            availableLiquidity: NormalizedNumber(100),
            totalDebt: NormalizedNumber.ZERO,
            isSiloed: false,
            borrowableInIsolation: true,
            eModeCategory: 1,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
            totalBorrowedUSD: NormalizedNumber(10),
            isInSiloMode: false,
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber(80),
            isolationModeCollateralDebtCeiling: NormalizedNumber(100),
            eModeCategory: 0,
          },
        }),
      ).toStrictEqual(undefined)
    })

    it('validates if eMode category is consistent', () => {
      expect(
        validateBorrow({
          value: NormalizedNumber(20),
          asset: {
            address: testAddresses.token,
            status: 'active',
            borrowingEnabled: true,
            availableLiquidity: NormalizedNumber(100),
            totalDebt: NormalizedNumber.ZERO,
            isSiloed: false,
            borrowableInIsolation: true,
            eModeCategory: 2,
          },
          user: {
            maxBorrowBasedOnCollateral: NormalizedNumber(100),
            totalBorrowedUSD: NormalizedNumber(10),
            isInSiloMode: false,
            inIsolationMode: true,
            isolationModeCollateralTotalDebt: NormalizedNumber(80),
            isolationModeCollateralDebtCeiling: NormalizedNumber(100),
            eModeCategory: 1,
          },
        }),
      ).toStrictEqual('emode-category-mismatch')
    })
  })
})
