import { ContentBlock } from './types/contentBlock'

function text(content: string, extra?: { bold?: boolean }): ContentBlock {
  return { type: 'text', content, ...(extra ?? {}) }
}

function link(href: string, text: string): ContentBlock {
  return { type: 'link', href, text }
}

export const templating = {
  text,
  link,
}
