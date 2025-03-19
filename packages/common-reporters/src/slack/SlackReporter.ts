import { HttpClient } from '@marsfoundation/common-universal/http-client'
import { z } from 'zod'
import { templating } from '../templating.js'
import { ContentBlock, IReporter, Report } from '../types.js'
import { renderToSlackString } from './renderToSlack.js'

interface SlackReporterConfig {
  apiUrl: string
}

export class SlackReporter implements IReporter {
  constructor(
    private readonly config: SlackReporterConfig,
    private readonly httpClient: HttpClient,
  ) {}

  async report(report: Report): Promise<void> {
    const text = renderToSlackString(this.getContentBlocks(report))
    await this.httpClient.post(this.config.apiUrl, { text }, z.string())
  }

  private getContentBlocks(report: Report): ContentBlock[] {
    if (report.title) {
      return [templating.text(`${report.title}\n`, { bold: true }), ...report.content]
    }
    return report.content
  }
}
