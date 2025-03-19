import { api } from '@pagerduty/pdjs'

export class PagerDutyClient {
  private readonly pdClient: ReturnType<typeof api>

  constructor(
    readonly apiKey: string,
    private readonly requesterEmail: string,
  ) {
    this.pdClient = api({ token: apiKey })
  }

  async createIncident({
    serviceId,
    title,
    description,
    uniqueKey,
  }: {
    serviceId: string
    title: string
    description: string
    uniqueKey: string // avoids duplicate incidents
  }): Promise<void> {
    const res = await this.pdClient.post('/incidents', {
      headers: {
        From: this.requesterEmail,
      },
      data: {
        incident: {
          type: 'incident',
          title,
          body: {
            type: 'incident_body',
            details: description,
          },
          service: {
            id: serviceId,
            type: 'service_reference',
          },
          incident_key: uniqueKey,
        },
      },
    })
    // ignore if incident already exists
    if (res.status === 400 && res.data.error.code === 2002) {
      return
    }

    if (!res.ok) {
      throw new Error(`Failed to create incident: ${JSON.stringify(res.data)}`)
    }
  }
}
