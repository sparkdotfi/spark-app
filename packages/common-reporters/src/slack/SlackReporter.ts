import { HttpClient } from '@marsfoundation/common-universal/http-client'
import { z } from 'zod'
import { IReporter } from '../types/IReporter'
import { ContentBlock } from '../types/contentBlock'
import { renderToSlackString } from './renderToSlack'

interface SlackReporterConfig {
  apiUrl: string
}

export class SlackReporter implements IReporter {
  constructor(
    private readonly config: SlackReporterConfig,
    private readonly httpClient: HttpClient,
  ) {}

  async report(contentBlocks: ContentBlock[]): Promise<void> {
    const text = renderToSlackString(contentBlocks)
    await this.httpClient.post(this.config.apiUrl, { text }, z.string())
  }
}
