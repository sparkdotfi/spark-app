import { Hash } from '@marsfoundation/common-universal'
import { IReporter, Report } from '../types.js'
import { PagerDutyClient } from './PagerDutyClient.js'
import { renderToPagerdutyString } from './renderToPagerDuty.js'

export class PagerDutyReporter implements IReporter {
  constructor(
    private readonly pagerDutyClient: PagerDutyClient,
    private readonly serviceId: string,
  ) {}

  async report(report: Report): Promise<void> {
    const description = renderToPagerdutyString(report.content)
    const uniqueKey = Hash.fromText(description)

    await this.pagerDutyClient.createIncident({
      serviceId: this.serviceId,
      title: report.title ?? `${description.slice(0, 20)}...`,
      description,
      uniqueKey,
    })
  }
}
