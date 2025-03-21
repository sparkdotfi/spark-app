import { MockObject, expect, mockFn, mockObject } from 'earl'
import { ZodError, z } from 'zod'
import { Logger } from '../logger/Logger.js'
import { HttpClient, HttpError } from './HttpClient.js'
import { HttpServerMock, PostBody, getResponseSchema, postBodySchema } from './HttpServer.mock.js'

describe(HttpClient.name, () => {
  let httpServer: HttpServerMock

  beforeEach(() => {
    httpServer = new HttpServerMock()
    httpServer.listen()
  })

  afterEach(() => httpServer.server?.close())

  describe(HttpClient.prototype.get.name, () => {
    it('returns successful response', async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const response = await httpClient.get(httpServer.getUrl('/status?status=200'), getResponseSchema)

      expect(response).toEqual({ status: 200 })
    })

    it('logs request', async () => {
      const url = httpServer.getUrl('/status?status=200')
      const logger = getMockLogger()
      const httpClient = new HttpClient(logger, { delay: 0 })

      await httpClient.get(url, getResponseSchema)
      expect(logger.trace).toHaveBeenOnlyCalledWith(`[HttpClient] GET request - ${url}`, { url })
    })

    it('throws with invalid schema', async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const invalidSchema = z.object({
        invalid: z.boolean(),
      })

      await expect(() => httpClient.get(httpServer.getUrl('/status?status=200'), invalidSchema)).toBeRejectedWith(
        ZodError,
      )
    })

    it("doesn't retry in case of client error", async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const url = httpServer.getUrl('/status?status=400')

      await expect(() => httpClient.get(url, getResponseSchema)).toBeRejectedWith(
        `Failed GET ${url}: 400 - {"status":400}`,
      )
      expect(httpServer.requestsCount['/status']).toEqual(1)
    })

    it('retries in case of server error', async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const url = httpServer.getUrl('/status?status=500')

      await expect(() => httpClient.get(url, getResponseSchema)).toBeRejectedWith(
        `Failed GET ${url}: 500 - {"status":500}`,
      )
      expect(httpServer.requestsCount['/status']).toEqual(5)
    })

    it('returns text response', async () => {
      httpServer.app.get('/text', (_req, res) => {
        res.status(200).send('plain text GET response')
      })
      const url = httpServer.getUrl('/text')

      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const response = await httpClient.get(url, z.string())
      expect(response).toEqual('plain text GET response')
    })
  })

  describe(HttpClient.prototype.post.name, () => {
    it('returns response', async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const body: PostBody = {
        status: 200,
      }

      expect(await httpClient.post(httpServer.getUrl('/post'), body, postBodySchema)).toEqual(body)
    })

    it('logs request', async () => {
      const url = httpServer.getUrl('/post')
      const logger = getMockLogger()
      const httpClient = new HttpClient(logger, { delay: 0 })
      const body: PostBody = {
        status: 200,
      }

      expect(await httpClient.post(url, body, postBodySchema)).toEqual(body)
      expect(logger.trace).toHaveBeenOnlyCalledWith(`[HttpClient] POST request - ${url}`, { url, body })
    })

    it('throws with invalid schema', async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const body: PostBody = {
        status: 200,
      }
      const invalidSchema = z.object({
        invalid: z.boolean(),
      })

      await expect(() => httpClient.post(httpServer.getUrl('/post'), body, invalidSchema)).toBeRejectedWith(ZodError)
    })

    it("doesn't retries in case of client error by default", async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const url = httpServer.getUrl('/post')
      const body: PostBody = {
        status: 400,
      }

      await expect(() => httpClient.post(url, body, postBodySchema)).toBeRejectedWith(
        HttpError,
        `Failed POST ${url}: 400 - {"status":400}`,
      )
      expect(httpServer.requestsCount['/post']).toEqual(1)
    })

    it('retries in case of server error by default', async () => {
      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const url = httpServer.getUrl('/post')
      const body: PostBody = {
        status: 500,
      }

      await expect(() => httpClient.post(url, body, postBodySchema)).toBeRejectedWith(
        HttpError,
        `Failed POST ${url}: 500 - {"status":500}`,
      )
      expect(httpServer.requestsCount['/post']).toEqual(5)
    })

    it('returns text response', async () => {
      httpServer.app.post('/text', (_req, res) => {
        res.status(200).send('plain text POST response')
      })
      const url = httpServer.getUrl('/text')

      const httpClient = new HttpClient(Logger.SILENT, { delay: 0 })
      const response = await httpClient.post(url, {}, z.string())
      expect(response).toEqual('plain text POST response')
    })
  })
})

function getMockLogger(): MockObject<Logger> {
  const mockLogger = mockObject<Logger>({
    trace: mockFn(() => {}),
    for: (_): Logger => mockLogger,
  })
  return mockLogger
}
