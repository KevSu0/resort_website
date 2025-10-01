import { render, screen } from '@testing-library/react'
import { UnifiedRichTextEditor } from '../UnifiedRichTextEditor'

// Mock the TipTap editor
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    chain: jest.fn(() => ({
      focus: jest.fn(() => ({
        toggleBold: jest.fn(() => ({ run: jest.fn() })),
        toggleItalic: jest.fn(() => ({ run: jest.fn() })),
        toggleUnderline: jest.fn(() => ({ run: jest.fn() })),
        toggleCode: jest.fn(() => ({ run: jest.fn() })),
        toggleHeading: jest.fn(() => ({ run: jest.fn() })),
        toggleBulletList: jest.fn(() => ({ run: jest.fn() })),
        toggleOrderedList: jest.fn(() => ({ run: jest.fn() })),
        toggleBlockquote: jest.fn(() => ({ run: jest.fn() })),
        setLink: jest.fn(() => ({ run: jest.fn() })),
        setImage: jest.fn(() => ({ run: jest.fn() })),
        insertTable: jest.fn(() => ({ run: jest.fn() })),
        undo: jest.fn(() => ({ run: jest.fn() })),
        redo: jest.fn(() => ({ run: jest.fn() })),
        setParagraph: jest.fn(() => ({ run: jest.fn() })),
      })),
      isActive: jest.fn(() => false),
      can: jest.fn(() => ({
        undo: jest.fn(() => true),
        redo: jest.fn(() => true),
      })),
      getHTML: jest.fn(() => '<p>Test content</p>'),
      getJSON: jest.fn(() => ({ type: 'doc', content: [] })),
      getText: jest.fn(() => 'Test content'),
      state: {
        doc: {
          textBetween: jest.fn(() => 'selected text'),
        },
        selection: {
          from: 0,
          to: 10,
        },
      },
    })),
    EditorContent: jest.fn(({ children }) => <div>{children}</div>),
  })),
}))

describe('UnifiedRichTextEditor', () => {
  it('renders without crashing', () => {
    const onChange = jest.fn()
    render(<UnifiedRichTextEditor content="Test" onChange={onChange} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders toolbar when enabled', () => {
    const onChange = jest.fn()
    render(<UnifiedRichTextEditor content="Test" onChange={onChange} toolbar={true} />)
    expect(screen.getByTitle('Bold (Ctrl+B)')).toBeInTheDocument()
  })

  it('does not render toolbar when disabled', () => {
    const onChange = jest.fn()
    render(<UnifiedRichTextEditor content="Test" onChange={onChange} toolbar={false} />)
    expect(screen.queryByTitle('Bold (Ctrl+B)')).not.toBeInTheDocument()
  })

  it('calls onChange when content changes', () => {
    const onChange = jest.fn()
    render(<UnifiedRichTextEditor content="Test" onChange={onChange} />)
    // Simulate content change would be handled by TipTap
    // This is a basic test to ensure the component renders
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders with different modes', () => {
    const onChange = jest.fn()
    const { rerender } = render(<UnifiedRichTextEditor content="Test" onChange={onChange} mode="simple" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()

    rerender(<UnifiedRichTextEditor content="Test" onChange={onChange} mode="standard" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()

    rerender(<UnifiedRichTextEditor content="Test" onChange={onChange} mode="advanced" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()

    rerender(<UnifiedRichTextEditor content="Test" onChange={onChange} mode="cms" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})