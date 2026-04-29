import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../markdown/renderMarkdown';

describe('markdown preview rendering', () => {
  it('renders heading, list, code, table, and link markdown for CE-05 review', () => {
    const html = renderMarkdown(`# Release Plan

- Pair-edit the brief
- Check reconnect merge

\`\`\`ts
const status = 'synced';
\`\`\`

| Owner | Status |
| --- | --- |
| Alice | Draft |

[Yorkie](https://yorkie.dev)
`);

    expect(html).toContain('<h1>Release Plan</h1>');
    expect(html).toContain('<li>Pair-edit the brief</li>');
    expect(html).toContain('<pre><code class="language-ts">const status =');
    expect(html).toContain('<table>');
    expect(html).toContain('<a href="https://yorkie.dev">Yorkie</a>');
  });
});
