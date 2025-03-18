import { ContentBlock } from './contentBlock'

export interface IReporter {
  report(contentBlocks: ContentBlock[]): Promise<void>
}
