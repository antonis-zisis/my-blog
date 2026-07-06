import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PostContent from '@/components/PostContent';

function renderContent(content: string): HTMLElement {
  const { container } = render(<PostContent content={content} />);

  return container;
}

describe('PostContent sanitization', () => {
  it('removes <script> tags from the rendered output', () => {
    const container = renderContent(
      '<p>Hello</p><script>window.pwned = true;</script>'
    );

    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('pwned');
    expect(container).toHaveTextContent('Hello');
  });

  it('strips event-handler attributes', () => {
    const container = renderContent(
      '<img src="https://example.com/a.png" onerror="alert(1)" />' +
        '<a href="https://example.com" onclick="alert(2)">link</a>'
    );

    expect(container.querySelector('img')).not.toHaveAttribute('onerror');
    expect(container.querySelector('a')).not.toHaveAttribute('onclick');
  });

  it('neutralises javascript: hrefs', () => {
    const container = renderContent('<a href="javascript:alert(1)">click</a>');
    const link = container.querySelector('a');

    expect(link).not.toBeNull();
    expect(link?.getAttribute('href') ?? '').not.toContain('javascript:');
  });

  it('preserves legitimate TipTap content', () => {
    const container = renderContent(
      '<h2>Heading</h2>' +
        '<p>Some <strong>bold</strong> text with a ' +
        '<a href="https://example.com">link</a>.</p>' +
        '<pre><code class="language-ts">const answer = 42;</code></pre>' +
        '<img src="https://example.com/cover.png" alt="Cover" />'
    );

    expect(container.querySelector('h2')).toHaveTextContent('Heading');
    expect(container.querySelector('a')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(container.querySelector('pre code')).toHaveTextContent(
      'const answer = 42;'
    );
    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://example.com/cover.png'
    );
    expect(container.querySelector('strong')).toHaveTextContent('bold');
  });
});
