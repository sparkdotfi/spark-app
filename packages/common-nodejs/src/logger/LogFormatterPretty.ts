import { inspect } from 'node:util'
import chalk from 'chalk'

import { LogLevel } from './LogLevel.js'
import { LogEntry, LogFormatter } from './types.js'
import { toJSON } from './utils.js'

const STYLES = {
  bigint: 'white',
  boolean: 'white',
  date: 'white',
  module: 'white',
  name: 'blue',
  null: 'white',
  number: 'white',
  regexp: 'white',
  special: 'white',
  string: 'white',
  symbol: 'white',
  undefined: 'white',
}

const INDENT_SIZE = 4
const INDENT = ' '.repeat(INDENT_SIZE)

interface Options {
  colors: boolean
  utc: boolean
}

// @note: format methods are protected to allow easy construction of simpler formatters for non-standard environments
export class LogFormatterPretty implements LogFormatter {
  protected readonly options: Options

  constructor(options?: Partial<Options>) {
    this.options = {
      colors: options?.colors ?? true,
      utc: options?.utc ?? false,
    }
  }

  public format(entry: LogEntry): string {
    const timeOut = this.formatTimePretty(entry.time, this.options.utc, this.options.colors)
    const levelOut = this.formatLevelPretty(entry.level, this.options.colors)
    const serviceOut = this.formatServicePretty(entry.service, this.options.colors)
    const messageOut = entry.message ? ` ${entry.message}` : ''
    const paramsOut = this.formatParametersPretty(
      this.sanitize(entry.resolvedError ? { ...entry.resolvedError, ...entry.parameters } : (entry.parameters ?? {})),
      this.options.colors,
    )

    return `${timeOut} ${levelOut}${serviceOut}${messageOut}${paramsOut}`
  }

  protected formatLevelPretty(level: LogLevel, colors: boolean): string {
    if (colors) {
      switch (level) {
        case 'CRITICAL':
        case 'ERROR':
          return chalk.red(chalk.bold(level.toUpperCase()))
        case 'WARN':
          return chalk.yellow(chalk.bold(level.toUpperCase()))
        case 'INFO':
          return chalk.green(chalk.bold(level.toUpperCase()))
        case 'DEBUG':
          return chalk.magenta(chalk.bold(level.toUpperCase()))
        case 'TRACE':
          return chalk.gray(chalk.bold(level.toUpperCase()))
      }
    }
    return level.toUpperCase()
  }

  protected formatTimePretty(now: Date, utc: boolean, colors: boolean): string {
    const h = (utc ? now.getUTCHours() : now.getHours()).toString().padStart(2, '0')
    const m = (utc ? now.getUTCMinutes() : now.getMinutes()).toString().padStart(2, '0')
    const s = (utc ? now.getUTCSeconds() : now.getSeconds()).toString().padStart(2, '0')
    const ms = (utc ? now.getUTCMilliseconds() : now.getMilliseconds()).toString().padStart(3, '0')

    let result = `${h}:${m}:${s}.${ms}`
    if (utc) {
      result += 'Z'
    }

    return colors ? chalk.gray(result) : result
  }

  protected formatParametersPretty(parameters: object, colors: boolean): string {
    const oldStyles = inspect.styles
    inspect.styles = STYLES

    const inspected = inspect(parameters, {
      colors,
      breakLength: 80 - INDENT_SIZE,
      depth: 5,
    })

    inspect.styles = oldStyles

    if (inspected === '{}') {
      return ''
    }

    const indented = inspected
      .split('\n')
      .map((x) => INDENT + x)
      .join('\n')

    if (colors) {
      return `\n${chalk.gray(indented)}`
    }
    return `\n${indented}`
  }

  protected formatServicePretty(service: string | undefined, colors: boolean): string {
    if (!service) {
      return ''
    }
    return colors ? ` ${chalk.gray('[')} ${chalk.yellow(service)} ${chalk.gray(']')}` : ` [ ${service} ]`
  }

  protected sanitize(parameters: object): object {
    return JSON.parse(toJSON(parameters))
  }
}
