import { mergeDeep } from 'remeda'
import { ZodString, z } from 'zod'
import { ILogger } from '../logger/Logger.js'
import { RetryOptions, defaultRetryOptions, fetchRetry } from './fetchRetry.js'

export class HttpClient {
  private readonly logger: ILogger
  private readonly fetchWithRetries: typeof fetch
  constructor(logger: ILogger, retryOptions: Partial<RetryOptions> = {}) {
    this.logger = logger.for(this)
    const options = mergeDeep(defaultRetryOptions, retryOptions) as RetryOptions
    this.fetchWithRetries = fetchRetry(options)
  }

  async post<T extends z.ZodTypeAny>(
    url: string,
    body: object,
    schema: T,
    headers?: Record<string, string>,
  ): Promise<z.infer<T>> {
    const result = await this.rawPost(url, body, headers)

    if (isZodString(schema)) {
      return await result.text()
    }
    return schema.parse(await result.json())
  }

  async get<T extends z.ZodTypeAny>(url: string, schema: T, headers?: Record<string, string>): Promise<z.infer<T>> {
    const result = await this.rawGet(url, headers)

    if (isZodString(schema)) {
      return schema.parse(await result.text())
    }
    return schema.parse(await result.json())
  }

  async rawGet(url: string, headers?: Record<string, string>): Promise<Response> {
    this.logger.trace(`[HttpClient] GET request - ${url}`, { url })
    const result = await this.fetchWithRetries(url, {
      method: 'GET',
      headers,
    })
    if (!result.ok) {
      throw new HttpError('GET', url, result.status, await result.text())
    }

    return result
  }

  async rawPost(url: string, body: object, headers?: Record<string, string>): Promise<Response> {
    this.logger.trace(`[HttpClient] POST request - ${url}`, { url, body })

    const result = await this.fetchWithRetries(url, {
      method: 'POST',
      headers: { ...applicationJsonHeader, ...headers },
      body: JSON.stringify(body),
    })
    if (!result.ok) {
      throw new HttpError('POST', url, result.status, await result.text())
    }

    return result
  }
}

export class HttpError extends Error {
  constructor(
    public readonly method: 'POST' | 'GET',
    public readonly url: string,
    public readonly status: number,
    public readonly textResult: string,
  ) {
    super(`Failed ${method} ${url}: ${status} - ${textResult}`)
    this.name = 'HttpError'
  }
}

const applicationJsonHeader = {
  'Content-Type': 'application/json',
}

function isZodString(schema: z.ZodTypeAny): schema is ZodString {
  return schema instanceof ZodString || schema._def.typeName === 'ZodString'
}
