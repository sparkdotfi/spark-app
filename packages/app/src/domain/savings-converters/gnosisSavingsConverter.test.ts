import { describe, test } from 'vitest'

import { NormalizedUnitNumber, Percentage } from '@sparkdotfi/common-universal'

import { GnosisSavingsConverter } from './gnosisSavingsConverter'

describe(GnosisSavingsConverter.name, () => {
  describe(GnosisSavingsConverter.prototype.predictAssetsAmount.name, () => {
    test('calculates correct assets for given shares and future timestamp', () => {
      const timestamp = 1000
      const shares = NormalizedUnitNumber(100)
      const savingsConverter = new GnosisSavingsConverter({
        vaultAPY: Percentage(18.25, { allowMoreThan1: true }), // 5% / day
        totalAssets: NormalizedUnitNumber(100),
        totalSupply: NormalizedUnitNumber(100),
        currentTimestamp: timestamp,
      })

      const assetsAtFutureTime = savingsConverter.predictAssetsAmount({
        timestamp: timestamp + 24 * 60 * 60, // one day later
        shares,
      })

      const expectedAssets = shares.times(1.05)
      expect(assetsAtFutureTime.minus(expectedAssets).abs().lt(1e-12)).toEqual(true)
    })

    test('predictAssetsAmount matches convertToAssets at current timestamp', () => {
      const timestamp = 1000
      const shares = NormalizedUnitNumber(100)
      const savingsConverter = new GnosisSavingsConverter({
        vaultAPY: Percentage(18.25, { allowMoreThan1: true }), // 5% / day
        totalAssets: NormalizedUnitNumber(100),
        totalSupply: NormalizedUnitNumber(100),
        currentTimestamp: timestamp,
      })

      const assetsViaPredict = savingsConverter.predictAssetsAmount({
        timestamp: savingsConverter.currentTimestamp,
        shares,
      })
      const assetsViaConvert = savingsConverter.convertToAssets({ shares })

      expect(assetsViaPredict.eq(assetsViaConvert)).toEqual(true)
    })
  })

  describe(GnosisSavingsConverter.prototype.predictSharesAmount.name, () => {
    test('calculates correct shares for given assets and future timestamp', () => {
      const timestamp = 1000
      const assets = NormalizedUnitNumber(100)
      const savingsConverter = new GnosisSavingsConverter({
        vaultAPY: Percentage(18.25, { allowMoreThan1: true }), // 5% / day
        totalAssets: NormalizedUnitNumber(100),
        totalSupply: NormalizedUnitNumber(100),
        currentTimestamp: timestamp,
      })
      const sharesAtFutureTime = savingsConverter.predictSharesAmount({
        timestamp: timestamp + 24 * 60 * 60, // one day later
        assets,
      })

      const expectedShares = assets.div(1.05)
      expect(sharesAtFutureTime.minus(expectedShares).abs().lt(1e-12)).toEqual(true)
    })

    test('predictSharesAmount matches convertToShares at current timestamp', () => {
      const timestamp = 1000
      const assets = NormalizedUnitNumber(100)
      const savingsConverter = new GnosisSavingsConverter({
        vaultAPY: Percentage(18.25, { allowMoreThan1: true }), // 5% / day
        totalAssets: NormalizedUnitNumber(100),
        totalSupply: NormalizedUnitNumber(100),
        currentTimestamp: timestamp,
      })

      const sharesViaPredict = savingsConverter.predictSharesAmount({
        timestamp: savingsConverter.currentTimestamp,
        assets,
      })
      const sharesViaConvert = savingsConverter.convertToShares({ assets })

      expect(sharesViaPredict.eq(sharesViaConvert)).toEqual(true)
    })
  })
})
