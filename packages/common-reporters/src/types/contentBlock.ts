export type ContentBlock =
  | {
      type: 'text'
      content: string
      bold?: boolean
      italic?: boolean
    }
  | {
      type: 'link'
      href: string
      text: string
    }
