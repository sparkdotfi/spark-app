import { defineInstance, toArgs } from 'prool'
import { AnvilParameters as ProolAnvilParameters } from 'prool/instances'
import { execa } from 'prool/processes'
import { mergeDeep } from 'remeda'

interface AnvilParameters extends Omit<ProolAnvilParameters, 'binary'> {
  noStorageCaching?: boolean
  host: string
  port: number
}

export const getAnvilInstance = defineInstance((parameters: Partial<AnvilParameters> = {}) => {
  const args = mergeDeep(defaultAnvilParameters, parameters) as AnvilParameters

  const name = 'anvil'
  const process = execa({ name })

  return {
    _internal: {
      args,
      get process() {
        return process._internal.process
      },
    },
    host: args.host,
    name,
    port: args.port,
    async start({ port = args.port }, internalOptions) {
      return await process.start(
        ($) =>
          $({
            env: {
              FOUNDRY_DISABLE_NIGHTLY_WARNING: 'true',
            },
          })`anvil ${toArgs({ ...args, port })}`,
        {
          ...internalOptions,
          // Resolve when the process is listening via a "Listening on" message.
          resolver({ process, reject, resolve }) {
            process.stdout.on('data', (data) => {
              const message = data.toString()
              if (message.includes('Listening on')) {
                resolve()
              }
            })
            process.stderr.on('data', (data) => {
              const message = data.toString()
              if (!message.includes('Warning')) {
                reject(message)
              }
            })
          },
        },
      )
    },
    async stop() {
      await process.stop()
    },
  }
})

const defaultAnvilParameters: AnvilParameters = {
  host: '0.0.0.0',
  port: 8545,
}
