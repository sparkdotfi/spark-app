import { assertNever } from '@marsfoundation/common-universal'
import { ContentBlock } from '../types.js'

export function renderToPagerdutyString(node: ContentBlock[]): string {
  return node
    .map((block) => {
      switch (block.type) {
        case 'text':
          return block.content
        case 'link':
          return `[${block.href}] ${block.text}>`
        default:
          assertNever(block)
      }
    })
    .join(' ')
}
