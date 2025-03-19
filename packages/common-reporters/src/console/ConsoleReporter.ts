import { assertNever } from '@marsfoundation/common-universal'
import { ILogger } from '@marsfoundation/common-universal/logger'
import { templating } from '../templating.js'
import { ContentBlock, IReporter, Report } from '../types.js'

export class ConsoleReporter implements IReporter {
  private readonly logger: ILogger

  constructor(
    logger: ILogger,
    private readonly logFunctionName: LogFunctionName,
  ) {
    this.logger = logger.for(this)
  }

  async report(report: Report): Promise<void> {
    const blocks = report.title ? [templating.text(`${report.title}\n`), ...report.content] : report.content
    this.logger[this.logFunctionName](renderToConsoleString(blocks))
  }
}

function renderToConsoleString(content: ContentBlock[]): string {
  const text = content
    .map((block) => {
      switch (block.type) {
        case 'text':
          return block.content
        case 'link':
          return `${block.text} (${block.href})`
        default:
          assertNever(block)
      }
    })
    .join(' ')

  return text
    .split('\n')
    .map((line) => line.trimStart())
    .join('\n')
}

type LogFunctionName = Exclude<keyof ILogger, 'configure' | 'for' | 'tag'>
