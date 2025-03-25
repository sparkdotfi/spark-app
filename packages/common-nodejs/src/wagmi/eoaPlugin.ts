import { CheckedAddress } from '@sparkdotfi/common-universal'
import { Plugin } from '@wagmi/cli'

type Addresses = Record<number, CheckedAddress>

export function eoa(input: Record<string, Addresses>): Plugin {
  return {
    name: 'EOA Addresses',
    async run() {
      const result = Object.entries(input).map(([name, addresses]) => {
        if (!isValidVariableName(name)) {
          throw new Error(`Invalid name: ${name}`)
        }
        const parts = Object.entries(addresses).map(([chain, address]) => `  ${chain}: '${address.toString()}',`)
        return [`export const ${name}Address = {`, ...parts, '} as const'].join('\n')
      })
      return {
        content: result.join('\n'),
      }
    },
  }
}

function isValidVariableName(name: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(name)
}
