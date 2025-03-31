import type { SetupWorker } from 'msw/browser'

let worker: SetupWorker | undefined

export function getWorker(): SetupWorker | undefined {
  return worker
}

export function setWorker(newWorker: SetupWorker): SetupWorker {
  worker = newWorker
  return worker
}
