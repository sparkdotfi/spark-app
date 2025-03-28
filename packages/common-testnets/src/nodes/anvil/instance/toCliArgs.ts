export function toCliArgs(args: { [key: string]: string | boolean | number | bigint | undefined }): string[] {
  return Object.entries(args).flatMap(([key, value]) => {
    if (value === undefined) {
      return []
    }

    const flag = toFlag(key)
    if (value === false) {
      return [flag, 'false']
    }
    if (value === true) {
      return [flag]
    }

    const stringValue = value.toString()
    if (!stringValue) {
      return [flag]
    }
    return [flag, stringValue]
  })
}

function toFlag(str: string, separator = '-'): string {
  const key = str
    .replace(/\s+/g, separator)
    .replace(/([a-z])([A-Z])/g, `$1${separator}$2`)
    .toLowerCase()
  return `--${key}`
}
