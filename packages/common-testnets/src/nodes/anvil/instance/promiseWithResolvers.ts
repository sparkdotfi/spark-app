export function promiseWithResolvers(): {
  promise: Promise<void>
  resolve: () => void
  reject: (reason: Error) => void
} {
  let resolve!: () => void
  let reject!: (reason: Error) => void

  const promise = new Promise<void>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}
