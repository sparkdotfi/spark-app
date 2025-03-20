export function shouldErrorBeTracked(error: Error): boolean {
  if (isIgnoredMessage(error) || isIgnoredStackTrace(error)) {
    return false
  }
  return isTrackedErrorType(error)
}

function isIgnoredMessage(error: Error): boolean {
  const ignoredMessages = [
    // Network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    'Importing a module script failed',
    'The I/O read operation failed',
    'fetch failed',
    'error loading dynamically imported module',
    'Connection terminated unexpectedly',
    'Request expired',
    'The request took too long to respond',

    // Unsupported contracts and methods
    'does not support contract "ensUniversalResolver"',
    'wallet_getCapabilities',

    // Wallet connector errors
    'Connector not connected',
    'connector.getChainId is not a function',
    'provider.disconnect is not a function',
    '.getAccounts',
    'not found for connector',
    '.disconnect is not a function',
    'does not support programmatic chain switching',
    "does not match the connection's chain",
    "Cannot read properties of null (reading 'disconnect')",
    'redefine non-configurable property',

    // Wallet user interaction errors
    'User rejected the request',
    'user reject this request',
    'User rejected methods',
    'User rejected transaction',
    'Transaction was rejected',
    'User disapproved requested methods',
    'does not match the target chain for the transaction',
    'nonce too high',
    'nonce too low',
    'method has not been authorized by the user',
    'already pending for origin https://app.spark.fi',
    'Signing aborted by user',

    // Allowance errors
    '"approve" reverted',
    'transfer amount exceeds allowance',
    'insufficient-allowance',
    'transfer-from-failed',
    'transfer from failed',

    // Gas errors
    'to pay the network fees',

    // RPC errors
    'Internal JSON-RPC error',
    'JsonRpcEngine',
    "Non-200 status code: '429'",
    'Unexpected error',
    'Response has no error or result for request',
    'HTTP request failed',

    // Other
    'non-configurable data property on the proxy target',
    'setting getter-only property "ethereum"',
  ]

  return ignoredMessages.some((message) => error.message?.toLowerCase().includes(message.toLowerCase()))
}

function isIgnoredStackTrace(error: Error): boolean {
  const ignoredStackTraces = [/@wagmi[\/\\]core.*[\/\\]injected/, /@wagmi[\/\\]core.*[\/\\]disconnect/]
  const errorStack = error.stack
  return errorStack ? ignoredStackTraces.some((pattern) => pattern.test(errorStack)) : false
}

function isTrackedErrorType(error: Error): boolean {
  const trackedErrors = ['TypeError', 'AssertionError', 'ZodError', 'HandledWriteError']
  return trackedErrors.some((errorName) => error.name === errorName)
}
