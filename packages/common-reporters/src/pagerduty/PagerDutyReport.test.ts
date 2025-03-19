import { Hash } from '@marsfoundation/common-universal'
import { MockObject, expect, mockFn, mockObject } from 'earl'
import { templating } from '../templating.js'
import { PagerDutyClient } from './PagerDutyClient.js'
import { PagerDutyReporter } from './PagerDutyReporter.js'

describe(PagerDutyReporter.name, () => {
  it('sends report', async () => {
    const pdClient = getMockPagerDutyClient()
    const reporter = new PagerDutyReporter(pdClient, 'service')
    const content = [templating.text('some content')]
    const expectedHash = Hash.fromText('some content')

    await reporter.report({
      title: 'some title',
      content,
    })

    expect(pdClient.createIncident).toHaveBeenOnlyCalledWith({
      serviceId: 'service',
      title: 'some title',
      description: 'some content',
      uniqueKey: expectedHash,
    })
  })

  it('uses description for title if not provided', async () => {
    const pdClient = getMockPagerDutyClient()
    const reporter = new PagerDutyReporter(pdClient, 'service')
    const content = [
      templating.text('really long title'),
      templating.text('with multiple parts'),
      templating.link('href', 'and some link'),
    ]
    const expectedDescription = 'really long title with multiple parts [href] and some link>'

    await reporter.report({ content })

    expect(pdClient.createIncident).toHaveBeenOnlyCalledWith({
      serviceId: 'service',
      title: 'really long title wi...',
      description: expectedDescription,
      uniqueKey: Hash.fromText(expectedDescription),
    })
  })
})

function getMockPagerDutyClient(): MockObject<PagerDutyClient> {
  return mockObject<PagerDutyClient>({
    createIncident: mockFn<PagerDutyClient['createIncident']>(async (_data) => {}),
  })
}
