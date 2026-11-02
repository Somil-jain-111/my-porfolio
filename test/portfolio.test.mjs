import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const script = await readFile(new URL('../script.js', import.meta.url), 'utf8');

test('every 3D destination has navigation and content', () => {
  for (const stop of ['home', 'about', 'skills', 'experience', 'projects', 'education', 'contact']) {
    assert.match(html, new RegExp(`data-stop="${stop}"`));
    assert.match(html, new RegExp(`data-panel="${stop}"`));
    assert.match(script, new RegExp(`anchors\\.${stop}|anchors\\[stop\\]`));
  }
});

test('external links open safely', () => {
  const links = [...html.matchAll(/<a[^>]+target="_blank"[^>]*>/g)].map(([link]) => link);
  assert.ok(links.length >= 4);
  assert.ok(links.every(link => link.includes('rel="noreferrer"')));
});

test('the WebGL canvas and fallback are labelled', () => {
  assert.match(html, /<canvas[^>]+aria-label=/);
  assert.match(html, /<noscript>/);
});

test('contact links use callable protocols', () => {
  assert.match(html, /href="mailto:somilj111@gmail\.com"/);
  assert.match(html, /href="tel:\+917895683607"/);
});

test('resume is available as a downloadable asset', async () => {
  assert.match(html, /href="\/Somil_Jain_Software_Engineer\.pdf"[^>]*download/);
  const resume = await stat(new URL('../public/Somil_Jain_Software_Engineer.pdf', import.meta.url));
  assert.ok(resume.size > 100_000);
});
