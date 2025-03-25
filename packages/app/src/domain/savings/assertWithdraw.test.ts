import { daiLikeReserve, testAddresses, wethLikeReserve } from '@/test/integration/constants'
import { CheckedAddress } from '@sparkdotfi/common-universal'
import { zeroAddress } from 'viem'
import { assertWithdraw } from './assertWithdraw'

describe(assertWithdraw.name, () => {
  const bob = testAddresses.bob
  const alice = CheckedAddress(testAddresses.alice)
  const reserveAddresses = [daiLikeReserve.token.address, wethLikeReserve.token.address]

  describe('withdraw mode', () => {
    test('throws when receiver is defined', () => {
      expect(() => {
        assertWithdraw({ mode: 'withdraw', owner: bob, receiver: alice })
      }).toThrow('Receiver address should not be defined when withdrawing')
    })

    test('throws when reserve addresses are defined', () => {
      expect(() => {
        assertWithdraw({ mode: 'withdraw', owner: bob, tokenAddresses: reserveAddresses })
      }).toThrow('Reserve addresses should not be defined when withdrawing')
    })

    test('does not throw when receiver and reserve addresses are not defined', () => {
      expect(() => {
        assertWithdraw({ mode: 'withdraw', owner: bob })
      }).not.toThrow()
    })
  })

  describe('send mode', () => {
    test('throws when receiver is not defined', () => {
      expect(() => {
        assertWithdraw({ mode: 'send', tokenAddresses: reserveAddresses, owner: bob, receiver: undefined })
      }).toThrow('Receiver address should be defined when sending')
    })

    test('throws when receiver is zero address', () => {
      expect(() => {
        assertWithdraw({
          mode: 'send',
          tokenAddresses: reserveAddresses,
          owner: bob,
          receiver: CheckedAddress(zeroAddress),
        })
      }).toThrow('Receiver address is zero address')
    })

    test('throws when receiver address is reserve address', () => {
      expect(() => {
        assertWithdraw({
          mode: 'send',
          tokenAddresses: reserveAddresses,
          owner: bob,
          receiver: daiLikeReserve.token.address,
        })
      }).toThrow('Receiver address is a token address')
    })

    test('throws when receiver address is same as owner address', () => {
      expect(() => {
        assertWithdraw({ mode: 'send', tokenAddresses: reserveAddresses, owner: bob, receiver: bob })
      }).toThrow('Receiver address is the same as the sender')
    })

    test('throws when reserve addresses are undefined', () => {
      expect(() => {
        assertWithdraw({ mode: 'send', owner: bob, receiver: alice })
      }).toThrow('Reserve addresses should be defined when sending')
    })
  })
})
