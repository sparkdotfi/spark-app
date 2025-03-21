import { expect } from 'earl'
import { templating as t } from '../templating.js'
import { ContentBlock } from '../types.js'
import { applyFontStyle, renderToSlackString } from './renderToSlack.js'

describe(renderToSlackString.name, () => {
  it('renders content blocks', () => {
    const content = [
      t.text('Hello'),
      t.text('World', { bold: true }),
      t.text('!\n'),
      t.link('https://basescan.org', 'Link to tx explorer'),
    ]

    const lines = ['> Hello *World* !', '> <https://basescan.org|Link to tx explorer>']
    expect(renderToSlackString(content)).toEqual(lines.join('\n'))
  })

  it('renders bold text with a newline correctly', () => {
    const content = [t.text('Highlighted text\n', { bold: true }), t.text('text')]

    expect(renderToSlackString(content)).toEqual('> *Highlighted text*\n' + '> text')
  })

  it('renders bold text with multiple newlines correctly', () => {
    const content = [t.text('bold text\nmore bold text\n', { bold: true }), t.text('text')]

    expect(renderToSlackString(content)).toEqual('> *bold text*\n' + '> *more bold text*\n' + '> text')
  })

  it('joins different blocks with space', () => {
    const content = [
      t.text('before link'),
      t.link('https://google.com', 'click link'),
      t.text('after link', { bold: true }),
    ]

    expect(renderToSlackString(content)).toEqual('> before link <https://google.com|click link> *after link*')
  })

  it('renders empty new lines correctly', () => {
    const content = [
      t.text('First'),
      t.text('line'),
      t.text('\n'),
      t.text('\n'),
      t.text('Third line'),
      t.text('\n'),
      t.text('Fourth line'),
    ]

    const lines = ['> First line', '> ', '> Third line', '> Fourth line']
    expect(renderToSlackString(content)).toEqual(lines.join('\n'))
  })

  it('renders new lines in correct order', () => {
    const content = [
      t.text('First'),
      t.text('line'),
      t.text('\nSecond line,'),
      t.text('still second line\n'),
      t.text('Third line'),
    ]

    const lines = ['> First line', '> Second line, still second line', '> Third line']
    expect(renderToSlackString(content)).toEqual(lines.join('\n'))
  })

  describe(applyFontStyle.name, () => {
    describe('bold text', () => {
      it('renders correctly', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'bold text',
          bold: true,
        }

        expect(applyFontStyle(block)).toEqual('*bold text*')
      })

      it('renders with newline', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'bold text\n',
          bold: true,
        }

        expect(applyFontStyle(block)).toEqual('*bold text*\n')
      })

      it('renders with multiple newlines', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'bold text\nmore bold text\n',
          bold: true,
        }

        expect(applyFontStyle(block)).toEqual('*bold text*\n*more bold text*\n')
      })

      it('renders with empty string and newline', () => {
        const block: ContentBlock = {
          type: 'text',
          content: '\n',
          bold: true,
        }

        expect(applyFontStyle(block)).toEqual('\n')
      })

      it('ignores empty parts', () => {
        const block: ContentBlock = {
          type: 'text',
          content: ' \n ',
          bold: true,
        }

        expect(applyFontStyle(block)).toEqual('\n')
      })
    })

    describe('italic text', () => {
      it('renders correctly', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'italic text',
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('_italic text_')
      })

      it('renders with newline', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'italic text\n',
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('_italic text_\n')
      })

      it('renders with multiple newlines', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'italic text\nmore italic text\n',
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('_italic text_\n_more italic text_\n')
      })

      it('renders with empty string and newline', () => {
        const block: ContentBlock = {
          type: 'text',
          content: '\n',
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('\n')
      })

      it('ignores empty parts', () => {
        const block: ContentBlock = {
          type: 'text',
          content: ' \n ',
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('\n')
      })
    })

    describe('bold and italics text', () => {
      it('renders correctly', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'bold and italic text',
          bold: true,
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('_*bold and italic text*_')
      })

      it('renders with newline', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'bold and italic text\n',
          bold: true,
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('_*bold and italic text*_\n')
      })

      it('renders with multiple newlines', () => {
        const block: ContentBlock = {
          type: 'text',
          content: 'bold and italic text\nmore bold and italic text\n',
          bold: true,
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('_*bold and italic text*_\n_*more bold and italic text*_\n')
      })

      it('renders with empty string and newline', () => {
        const block: ContentBlock = {
          type: 'text',
          content: '\n',
          bold: true,
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('\n')
      })

      it('ignores empty parts', () => {
        const block: ContentBlock = {
          type: 'text',
          content: ' \n ',
          bold: true,
          italic: true,
        }

        expect(applyFontStyle(block)).toEqual('\n')
      })
    })
  })
})
