// Builds every *.html in this folder into ../pdf/<name>.pdf with a headless Chromium browser
// (Chrome or Edge). Chromium shapes Persian text and right-to-left layout correctly.
// Usage (Windows or macOS):  node docs/fa/pdf-src/build.mjs [name ...]
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '..', 'pdf');
mkdirSync(outDir, { recursive: true });

const candidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error('No Chrome or Edge found. Install Google Chrome, or set CHROME_PATH.');
  process.exit(1);
}

const only = process.argv.slice(2);
const pages = readdirSync(here)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => only.length === 0 || only.includes(f.replace(/\.html$/, '')));

for (const file of pages) {
  const out = join(outDir, file.replace(/\.html$/, '.pdf'));
  execFileSync(browser, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=8000', // give the web fonts time to load
    `--print-to-pdf=${out}`,
    pathToFileURL(join(here, file)).href,
  ], { stdio: 'ignore' });
  console.log('built', out);
}
