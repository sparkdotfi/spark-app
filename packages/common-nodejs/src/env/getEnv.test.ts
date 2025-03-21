import { expect } from 'earl'

import { Equal, Expect } from '@marsfoundation/common-universal'
import { Env } from './getEnv.js'

describe(Env.name, () => {
  describe(Env.prototype.string.name, () => {
    it('returns the environment variable', () => {
      const env = new Env({ TEST_A: 'foo' })
      const result = env.string('TEST_A')
      expect(result).toEqual('foo')
    })

    it('returns the fallback if the variable is not present', () => {
      const env = new Env({})
      const result = env.string('TEST_A', 'bar')
      expect(result).toEqual('bar')
    })

    it('throws if variable is not present and there is no fallback', () => {
      const env = new Env({})
      expect(() => env.string('TEST_A')).toThrow()
    })

    it('supports array keys', () => {
      const env = new Env({ TEST_A: 'foo', TEST_C: 'bar' })
      expect(env.string(['TEST_B', 'TEST_A'])).toEqual('foo')
      expect(env.string(['TEST_C', 'TEST_A'])).toEqual('bar')
    })
  })

  describe(Env.prototype.stringOf.name, () => {
    it('returns the env variable', () => {
      const env = new Env({ TEST_A: 'foo' })
      const result = env.stringOf('TEST_A', ['foo', 'bar'])

      expect(result).toEqual('foo')
    })

    it('returns the fallback value', () => {
      const env = new Env({})
      const result = env.stringOf('TEST_A', ['foo', 'bar'], 'bar')

      expect(result).toEqual('bar')
    })

    it('works with const arrays', () => {
      const env = new Env({ TEST_A: 'zar' })
      const options = ['foo', 'bar', 'zar'] as const

      const result = env.stringOf('TEST_A', options)
      expect(result).toEqual('zar')
    })

    it('throws if variable is not present and there is no fallback', () => {
      const env = new Env({})

      expect(() => env.stringOf('TEST_A', ['foo', 'bar'])).toThrow('Missing environment variable')
    })

    it('throws if variable is is not one of the expected values', () => {
      const env = new Env({ TEST_A: 'zar' })

      expect(() => env.stringOf('TEST_A', ['foo', 'bar'])).toThrow('Environment variable TEST_A is not one of foo, bar')
    })

    it.skip('[TYPE LEVEL] returns correct types', () => {
      const env = new Env({ TEST_A: 'foo' })
      const result = env.stringOf('TEST_A', ['foo', 'bar'])

      type _t1 = Expect<Equal<typeof result, 'foo' | 'bar'>>
    })
  })

  describe(Env.prototype.optionalStringOf.name, () => {
    it('returns the env variable', () => {
      const env = new Env({ TEST_A: 'foo' })
      const result = env.optionalStringOf('TEST_A', ['foo', 'bar'])

      expect(result).toEqual('foo')
    })

    it('returns undefined if variable is not present', () => {
      const env = new Env({})
      const result = env.optionalStringOf('TEST_A', ['foo', 'bar'])

      expect(result).toEqual(undefined)
    })

    it('works with const arrays', () => {
      const env = new Env({ TEST_A: 'zar' })
      const options = ['foo', 'bar', 'zar'] as const

      const result = env.optionalStringOf('TEST_A', options)
      expect(result).toEqual('zar')
    })

    it('throws if variable is is not one of the expected values', () => {
      const env = new Env({ TEST_A: 'zar' })

      expect(() => env.optionalStringOf('TEST_A', ['foo', 'bar'])).toThrow(
        'Environment variable TEST_A is not one of foo, bar',
      )
    })

    it.skip('[TYPE LEVEL] returns correct types', () => {
      const env = new Env({ TEST_A: 'foo' })
      const result = env.optionalStringOf('TEST_A', ['foo', 'bar'])

      type _t1 = Expect<Equal<typeof result, 'foo' | 'bar' | undefined>>
    })
  })

  describe(Env.prototype.integer.name, () => {
    it('returns the environment variable as integer', () => {
      const env = new Env({ TEST_A: '-420' })
      const result = env.integer('TEST_A')
      expect(result).toEqual(-420)
    })

    it('returns the fallback if the variable is not present', () => {
      const env = new Env({})
      const result = env.integer('TEST_A', 69)
      expect(result).toEqual(69)
    })

    it('throws if variable is not present and there is no fallback', () => {
      const env = new Env({})
      expect(() => env.integer('TEST_A')).toThrow()
    })

    it('throws if variable is not an integer', () => {
      const env = new Env({ TEST_A: 'foo' })
      expect(() => env.integer('TEST_A')).toThrow()
    })

    it('supports array keys', () => {
      const env = new Env({ TEST_A: '69', TEST_C: '-420' })
      expect(env.integer(['TEST_B', 'TEST_A'])).toEqual(69)
      expect(env.integer(['TEST_C', 'TEST_A'])).toEqual(-420)
    })
  })

  describe(Env.prototype.boolean.name, () => {
    it('returns the environment variable as boolean', () => {
      const env = new Env({ TEST_A: 'FALSE' })
      const result = env.boolean('TEST_A')
      expect(result).toEqual(false)
    })

    it('returns the fallback if the variable is not present', () => {
      const env = new Env({})
      const result = env.boolean('TEST_A', false)
      expect(result).toEqual(false)
    })

    it('throws if variable is not present and there is no fallback', () => {
      const env = new Env({})
      expect(() => env.boolean('TEST_A')).toThrow()
    })

    it('throws if variable is not a boolean', () => {
      const env = new Env({ TEST_A: '69' })
      expect(() => env.boolean('TEST_A')).toThrow()
    })

    it('supports array keys', () => {
      const env = new Env({ TEST_A: 'true', TEST_C: 'false' })
      expect(env.boolean(['TEST_B', 'TEST_A'])).toEqual(true)
      expect(env.boolean(['TEST_C', 'TEST_A'])).toEqual(false)
    })
  })
})
