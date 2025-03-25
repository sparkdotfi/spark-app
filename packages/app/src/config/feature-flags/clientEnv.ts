import { assert } from '@sparkdotfi/common-universal'

export function clientEnv(key: string): string {
  const value = import.meta.env[key]
  assert(value, `${key} env not defined`)

  return value
}

clientEnv.boolean = (key: string): boolean => {
  const value = import.meta.env[key]
  return value === '1'
}
