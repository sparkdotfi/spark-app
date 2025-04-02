import { LogEntry, LogFormatter, Logger, LoggerTransport } from '@sparkdotfi/common-universal/logger'
import { MockObject, expect, mockFn, mockObject } from 'earl'
import { templating as t } from '../templating.js'
import { ConsoleReporter } from './ConsoleReporter.js'

describe(ConsoleReporter.name, () => {
  it('joins title and content', async () => {
    const logger = getMockLogger()
    const reporter = new ConsoleReporter(logger, 'info')

    await reporter.report({
      title: 'some title',
      content: [t.text('some description'), t.text('additional description')],
    })

    expect(logger.info).toHaveBeenOnlyCalledWith('some title\nsome description additional description')
  })

  it('strips reportError', async () => {
    const mockReportError = mockFn((_: unknown) => {})
    const transport: LoggerTransport = {
      debug: (_: string | object) => {},
      log: (_: string | object) => {},
      warn: (_: string | object) => {},
      error: (_: string | object) => {},
    }
    const formatter: LogFormatter = {
      format: (entry: LogEntry): string | object => entry.toString(),
    }
    const logger = new Logger({
      logLevel: 'NONE',
      reportError: mockReportError,
      transports: [{ transport, formatter }],
    })
    const reporter = new ConsoleReporter(logger, 'error')

    await reporter.report({
      title: 'some title',
      content: [t.text('some description')],
    })

    expect(mockReportError).not.toHaveBeenCalled()
  })

  it('allows for different logger function', async () => {
    const logger = getMockLogger()
    const reporter = new ConsoleReporter(logger, 'warn')

    await reporter.report({
      title: 'some title',
      content: [t.text('some description')],
    })

    expect(logger.warn).toHaveBeenOnlyCalledWith('some title\nsome description')
    expect(logger.info).not.toHaveBeenCalled()
  })

  it('sends message without title', async () => {
    const logger = getMockLogger()
    const reporter = new ConsoleReporter(logger, 'info')

    await reporter.report({
      content: [t.text('some description'), t.text('additional description')],
    })

    expect(logger.info).toHaveBeenOnlyCalledWith('some description additional description')
  })
})

function getMockLogger(): MockObject<Logger> {
  const mockLogger = mockObject<Logger>({
    info: mockFn(() => {}),
    warn: mockFn(() => {}),
    error: mockFn(() => {}),
    for: (_): Logger => mockLogger,
    configure: (_): Logger => mockLogger,
  })
  return mockLogger
}
