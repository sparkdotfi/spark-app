import { HttpClient } from '@sparkdotfi/common-universal/http-client'
import { MockObject, expect, mockFn, mockObject } from 'earl'
import { templating as t } from '../templating.js'
import { SlackReporter } from './SlackReporter.js'

describe(SlackReporter.name, () => {
  it('joins title and content', async () => {
    const httpClient = getMockHttpClient()
    const reporter = new SlackReporter({ apiUrl: 'url' }, httpClient)

    await reporter.report({
      title: 'some title',
      content: [t.text('some description'), t.text('additional description')],
    })

    expect(httpClient.post).toHaveBeenOnlyCalledWith(
      'url',
      {
        text: '> *some title*\n> some description additional description',
      },
      expect.anything(),
    )
  })

  it('sends message without title', async () => {
    const httpClient = getMockHttpClient()
    const reporter = new SlackReporter({ apiUrl: 'url' }, httpClient)

    await reporter.report({
      content: [t.text('some description'), t.text('additional description')],
    })

    expect(httpClient.post).toHaveBeenOnlyCalledWith(
      'url',
      {
        text: '> some description additional description',
      },
      expect.anything(),
    )
  })

  function getMockHttpClient(): MockObject<HttpClient> {
    return mockObject<HttpClient>({
      post: mockFn((_url, _body, _schema) => 'some string' as any),
    })
  }
})
