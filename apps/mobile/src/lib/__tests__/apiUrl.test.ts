import { resolveApiUrl } from '../apiUrl';

describe('resolveApiUrl', () => {
  it('adds the /api prefix to a bare server origin', () => {
    expect(resolveApiUrl('http://192.168.1.5:3000')).toBe('http://192.168.1.5:3000/api');
  });

  it('keeps a URL that already ends in /api', () => {
    expect(resolveApiUrl('https://api.example.com/api')).toBe('https://api.example.com/api');
    expect(resolveApiUrl('https://api.example.com/api/')).toBe('https://api.example.com/api');
  });

  it('defaults to the local backend', () => {
    expect(resolveApiUrl(undefined)).toBe('http://localhost:3000/api');
  });
});
