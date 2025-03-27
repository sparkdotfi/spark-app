import { createWriteStream } from 'node:fs'
import { Instance } from 'prool'
import { OutputParams } from '../../../TestnetFactory.js'

export function setupOutputRedirects(process: Instance, config: OutputParams): () => void {
  const stdoutStream = createWriteStream(config.stdoutFile)
  const stderrStream = createWriteStream(config.stderrFile)

  process.on('stdout', (data) => stdoutStream.write(data))
  process.on('stderr', (data) => stderrStream.write(data))

  function cleanup(): void {
    stdoutStream.end()
    stderrStream.end()
  }

  return cleanup
}
