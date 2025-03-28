import { assert } from '@sparkdotfi/common-universal'
import { ResultPromise, execa } from 'execa'
import { mergeDeep } from 'remeda'
import { toCliArgs } from './toCliArgs.js'

interface AnvilArgs {
  port: number
  host?: string
  forkUrl?: string
  forkChainId?: number
  forkBlockNumber?: bigint
  autoImpersonate?: boolean
  gasPrice?: number
  blockBaseFeePerGas?: number
  noStorageCaching?: boolean
  verbose?: boolean
}

interface AnvilConfig {
  port: number
  host: string
  verbose: boolean
}

type Status = 'idle' | 'running' | 'closed'
const notRunningMessage = "Anvil isn't running"

export class Anvil {
  public status: Status
  public readonly config: AnvilConfig

  private readonly anvilArgs: AnvilArgs
  private process: ResultPromise<{ cleanup: boolean }> | undefined

  constructor(args: Partial<AnvilArgs>) {
    const { verbose, ...anvilArgs } = mergeDeep(defaultAnvilArgs, args) as AnvilArgs

    this.anvilArgs = anvilArgs
    this.config = {
      host: this.anvilArgs.host ?? 'localhost',
      port: this.anvilArgs.port,
      verbose: verbose ?? false,
    }
    this.status = 'idle'
  }

  async start(): Promise<void> {
    let resolve: () => void
    let reject: (reason: Error) => void

    this.process = execa({ cleanup: true })`anvil ${toCliArgs({ ...this.anvilArgs })}`

    const promise = new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })

    this.setupVerboseOutput()

    this.process.stdout.on('data', (data) => {
      const message = data.toString()
      if (message.includes('Listening on')) {
        this.status = 'running'
        resolve()
      }
    })

    this.process.stderr.on('data', async (data) => {
      const message = data.toString()
      if (message.includes('Warning')) {
        return
      }
      await this.stop()
      reject(Error(`Failed to start Anvil: ${message}`))
    })

    return promise
  }

  async stop(): Promise<void> {
    assert(this.process, notRunningMessage)

    const hasSucceed = this.process.kill()
    if (!hasSucceed) {
      return
    }

    return new Promise<void>((resolve) => {
      assert(this.process, notRunningMessage)
      this.process.on('close', resolve)
    })
  }

  private setupVerboseOutput(): void {
    assert(this.process, notRunningMessage)
    if (!this.config.verbose) {
      return
    }

    const logPrefix = `[${this.config.host}:${this.config.port}]:`

    // biome-ignore lint/suspicious/noConsoleLog: console logging in verbose mode
    this.process.stdout.on('data', (data) => console.log(getLog(data.toString(), logPrefix)))
    this.process.stderr.on('data', (data) => console.error(getLog(data.toString(), logPrefix)))
  }
}

function getLog(data: string, prefix: string): string {
  return data
    .split('\n')
    .map((line) => `${prefix} ${line}`)
    .join('\n')
}

const defaultAnvilArgs: AnvilArgs = {
  port: 8545,
}
