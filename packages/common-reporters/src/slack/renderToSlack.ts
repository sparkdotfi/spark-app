import { assertNever } from '@marsfoundation/common-universal'
import { ContentBlock } from '../types.js'

export function renderToSlackString(node: ContentBlock[]): string {
  const text = node
    .map((block) => {
      switch (block.type) {
        case 'text':
          return applyFontStyle(block)
        case 'link':
          return `<${block.href}|${block.text}>`
        default:
          assertNever(block)
      }
    })
    .join(' ')

  // we add block quotes to make the text more readable and aligned
  const blockQuotes = text.split('\n').map((line) => {
    return `> ${line.trimStart()}`
  })

  return blockQuotes.join('\n')
}

export function applyFontStyle(block: Extract<ContentBlock, { type: 'text' }>): string {
  const lines = block.content.split('\n')
  if (lines.length === 1) {
    return applyLineFontStyle(block.content, block.bold, block.italic)
  }
  const styledLines = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => `${applyLineFontStyle(line, block.bold, block.italic)}\n`)
  return styledLines.join('')
}

export function applyLineFontStyle(line: string, bold = false, italic = false): string {
  let result = line
  if (bold) {
    result = applyBoldStyle(result)
  }
  if (italic) {
    result = applyItalicStyle(result)
  }
  return result
}

function applyBoldStyle(text: string): string {
  return `*${text}*`
}

function applyItalicStyle(text: string): string {
  return `_${text}_`
}
