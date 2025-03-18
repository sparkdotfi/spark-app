import { expect } from 'earl'
import { templating } from '../templating'
import { applyFontStyle, renderToSlackString } from './renderToSlack'

describe(renderToSlackString.name, () => {
  it('renders content blocks', () => {
    const content = [
      templating.text('Hello'),
      templating.text('World', { bold: true }),
      templating.text('!\n'),
      templating.link('https://basescan.org', 'Link to tx explorer'),
    ]

    expect(renderToSlackString(content)).toEqual(
      `> Hello *World* !
> <https://basescan.org|Link to tx explorer>`,
    )
  })

  it('renders full report correctly', () => {
    const content = [
      templating.text('ALM Relayer (Safe) operation detected\n', { bold: true }),
      templating.text('Transaction executed successfully on mainnet ✅'),
    ]

    expect(renderToSlackString(content)).toEqual(
      '> *ALM Relayer (Safe) operation detected*\n' + '> Transaction executed successfully on mainnet ✅',
    )
  })

  it('renders bold text with a newline correctly', () => {
    const content = [templating.text('Highlighted text\n', { bold: true }), templating.text('text')]

    expect(renderToSlackString(content)).toEqual('> *Highlighted text*\n' + '> text')
  })

  it('renders bold text with multiple newlines correctly', () => {
    const content = [templating.text('bold text\nmore bold text\n', { bold: true }), templating.text('text')]

    expect(renderToSlackString(content)).toEqual('> *bold text*\n' + '> *more bold text*\n' + '> text')
  })

  describe(applyFontStyle.name, () => {
    it('renders bold string correctly', () => {
      const block = {
        type: 'text' as const,
        content: 'bold text',
        bold: true,
      }

      expect(applyFontStyle(block)).toEqual('*bold text*')
    })

    it('renders bold string with newline correctly', () => {
      const content = 'bold text\n'
      const block = {
        type: 'text' as const,
        content: content,
        bold: true,
      }

      expect(applyFontStyle(block)).toEqual('*bold text*\n')
    })

    it('renders bold string with multiple newlines correctly', () => {
      const content = 'bold text\nmore bold text\n'
      const block = {
        type: 'text' as const,
        content,
        bold: true,
      }

      expect(applyFontStyle(block)).toEqual('*bold text*\n*more bold text*\n')
    })

    it('renders bold string with empty string and newline correctly', () => {
      const content = '\n'
      const block = {
        type: 'text' as const,
        content,
        bold: true,
      }

      expect(applyFontStyle(block)).toEqual('')
    })

    it('ignores empty parts', () => {
      const content = ' \n '
      const block = {
        type: 'text' as const,
        content,
        bold: true,
      }

      expect(applyFontStyle(block)).toEqual('')
    })

    it('renders italic string correctly', () => {
      const block = {
        type: 'text' as const,
        content: 'italic text',
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('_italic text_')
    })

    it('renders italic string with newline correctly', () => {
      const content = 'italic text\n'
      const block = {
        type: 'text' as const,
        content: content,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('_italic text_\n')
    })

    it('renders italic string with multiple newlines correctly', () => {
      const content = 'italic text\nmore italic text\n'
      const block = {
        type: 'text' as const,
        content,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('_italic text_\n_more italic text_\n')
    })

    it('renders italic string with empty string and newline correctly', () => {
      const content = '\n'
      const block = {
        type: 'text' as const,
        content,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('')
    })

    it('ignores empty parts for italic text', () => {
      const content = ' \n '
      const block = {
        type: 'text' as const,
        content,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('')
    })

    it('renders bold and italic string correctly', () => {
      const block = {
        type: 'text' as const,
        content: 'bold and italic text',
        bold: true,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('_*bold and italic text*_')
    })

    it('renders bold and italic string with newline correctly', () => {
      const content = 'bold and italic text\n'
      const block = {
        type: 'text' as const,
        content: content,
        bold: true,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('_*bold and italic text*_\n')
    })

    it('renders bold and italic string with multiple newlines correctly', () => {
      const content = 'bold and italic text\nmore bold and italic text\n'
      const block = {
        type: 'text' as const,
        content,
        bold: true,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('_*bold and italic text*_\n_*more bold and italic text*_\n')
    })

    it('renders bold and italic string with empty string and newline correctly', () => {
      const content = '\n'
      const block = {
        type: 'text' as const,
        content,
        bold: true,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('')
    })

    it('ignores empty parts for bold and italic text', () => {
      const content = ' \n '
      const block = {
        type: 'text' as const,
        content,
        bold: true,
        italic: true,
      }

      expect(applyFontStyle(block)).toEqual('')
    })
  })
})
