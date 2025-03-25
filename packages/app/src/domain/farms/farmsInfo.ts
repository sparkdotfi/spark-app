import { CheckedAddress, raise } from '@sparkdotfi/common-universal'
import { Farm } from './types'

export class FarmsInfo {
  constructor(private farms: Farm[]) {}

  getHasFarms(): boolean {
    return this.farms.length > 0
  }

  findFarmByAddress(address: CheckedAddress): Farm | undefined {
    return this.farms.find((farm) => farm.address === address)
  }

  findOneFarmByAddress(address: CheckedAddress): Farm {
    return this.findFarmByAddress(address) ?? raise(`Farm with address ${address} not found`)
  }

  getActiveFarms(): Farm[] {
    return this.farms.filter((farm) => farm.staked.gt(0))
  }
  getInactiveFarms(): Farm[] {
    return this.farms.filter((farm) => farm.staked.eq(0))
  }
}
