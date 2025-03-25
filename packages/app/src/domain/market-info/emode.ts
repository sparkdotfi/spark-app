import { assert, Percentage } from '@sparkdotfi/common-universal'
import { AaveFormattedReserve } from './aave-data-layer/query'
import { EModeCategories, EModeState } from './marketInfo'
import { parseRawPercentage } from './math'

// The easiest way to get information eMode categories is to extract and reconstruct it from the reserves
export function extractEmodeInfoFromReserves(reserves: AaveFormattedReserve[]): EModeCategories {
  const emodeCategories: EModeCategories = {}
  for (const reserve of reserves) {
    if (reserve.eModeCategoryId === 0) {
      continue
    }
    const eModeCategoryId = reserve.eModeCategoryId
    if (emodeCategories[eModeCategoryId]) {
      continue
    }

    emodeCategories[eModeCategoryId] = {
      id: eModeCategoryId,
      name: reserve.eModeLabel,
      ltv: parseRawPercentage(reserve.eModeLtv),
      liquidationBonus: Percentage(
        parseRawPercentage(reserve.eModeLiquidationBonus, { allowMoreThan1: true }).minus(1),
      ),
      liquidationThreshold: parseRawPercentage(reserve.eModeLiquidationThreshold),
    }
  }

  return emodeCategories
}

export function determineEModeState(userEmodeCategoryId: number, emodeCategories: EModeCategories): EModeState {
  if (userEmodeCategoryId === 0) {
    return { enabled: false }
  }
  const userCategory = emodeCategories[userEmodeCategoryId]
  assert(userCategory, 'User emode category not found')

  return { enabled: true, category: userCategory }
}
