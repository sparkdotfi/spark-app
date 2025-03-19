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

export type Report = {
  title: string
  content: ContentBlock[]
}

export interface IReporter {
  report(report: Report): Promise<void>
}
