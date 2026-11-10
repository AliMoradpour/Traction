import { extractJsonObject } from './monthly-review.service';

describe('extractJsonObject', () => {
  it('parses a bare JSON object', () => {
    expect(extractJsonObject('{"summary":"ok"}')).toEqual({ summary: 'ok' });
  });

  it('parses JSON wrapped in code fences and prose', () => {
    const reply = 'Here is your review:\n```json\n{"wins":["a"],"summary":"fine"}\n```\nGood luck!';
    expect(extractJsonObject(reply)).toEqual({ wins: ['a'], summary: 'fine' });
  });

  it('throws when there is no object', () => {
    expect(() => extractJsonObject('no json here')).toThrow();
  });
});
