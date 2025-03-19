import { Logger } from '@marsfoundation/common-universal/logger'
import { MockObject, expect, mockFn, mockObject } from 'earl'
import { templating } from '../templating.js'
import { ConsoleReporter } from './ConsoleReporter.js'

describe(ConsoleReporter.name, () => {
  it('joins title and content', async () => {
    const logger = getMockLogger()
    const reporter = new ConsoleReporter(logger, 'info')

    await reporter.report({
      title: 'some title',
      content: [templating.text('some description'), templating.text('additional description')],
    })

    expect(logger.info).toHaveBeenOnlyCalledWith('some title\nsome description additional description')
  })

  it('allows for different logger function', async () => {
    const logger = getMockLogger()
    const reporter = new ConsoleReporter(logger, 'warn')

    await reporter.report({
      title: 'some title',
      content: [templating.text('some description')],
    })

    expect(logger.warn).toHaveBeenOnlyCalledWith('some title\nsome description')
    expect(logger.info).not.toHaveBeenCalled()
  })

  it('sends message without title', async () => {
    const logger = getMockLogger()
    const reporter = new ConsoleReporter(logger, 'info')

    await reporter.report({
      content: [templating.text('some description'), templating.text('additional description')],
    })

    expect(logger.info).toHaveBeenOnlyCalledWith('some description additional description')
  })
})

function getMockLogger(): MockObject<Logger> {
  const mockLogger = mockObject<Logger>({
    info: mockFn(() => {}),
    warn: mockFn(() => {}),
    for: (_): Logger => mockLogger,
  })
  return mockLogger
}
