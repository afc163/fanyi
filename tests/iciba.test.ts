import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { printIciba } from '../lib/iciba.mjs';

describe('printIciba', () => {
  let logs: string[] = [];

  beforeEach(() => {
    logs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => {
      logs.push(args.join(' '));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const output = () => logs.join('\n');

  it('prints matched word with pos & meanings', () => {
    printIciba(
      'gap',
      [
        { key: 'gap', paraphrase: 'n.缺口', means: [{ part: 'n.', means: ['缺口', '间隔'] }] },
        { key: 'gape', paraphrase: 'v.张开', means: [{ part: 'v.', means: ['张开'] }] },
      ],
      { color: false },
    );
    expect(output()).toContain('gap');
    expect(output()).toContain('~ iciba.com');
    expect(output()).toContain('n. 缺口；间隔');
    // related words
    expect(output()).toContain('gape');
  });

  it('prints not-found when message is empty', () => {
    printIciba('zxcvbn', [], { color: false });
    expect(output()).toContain('未找到 zxcvbn 的释义');
  });

  it('prints not-found when message is not an array', () => {
    printIciba('zxcvbn', undefined, { color: false });
    expect(output()).toContain('未找到 zxcvbn 的释义');
  });

  it('does not crash on null elements in message', () => {
    expect(() => printIciba('test', [null], { color: false })).not.toThrow();
    expect(output()).toContain('未找到 test 的释义');
  });

  it('falls back to query word when matched item has no key', () => {
    printIciba('apple', [{ paraphrase: 'n.苹果', means: [{ part: 'n.', means: ['苹果'] }] }], {
      color: false,
    });
    expect(output()).toContain('apple');
    expect(output()).not.toContain('undefined');
  });

  it('skips entries without meanings', () => {
    expect(() =>
      printIciba('x', [{ key: 'x', paraphrase: 'p', means: [{ part: 'n.', means: [] }] }], {
        color: false,
      }),
    ).not.toThrow();
  });
});
