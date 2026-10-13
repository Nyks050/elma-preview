const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const source = fs.readFileSync(path.resolve(__dirname, '../maps-core-soft-route.js'), 'utf8');

test('five main navigation destinations remain available', () => {
  for (const tab of ['transport', 'services', 'qr', 'lost', 'account']) {
    assert.match(source, new RegExp('data-elma-tab="' + tab + '"'));
  }
});

test('navigation does not delay screen updates or lock rapid taps', () => {
  const start = source.indexOf('function activateMainTab(button)');
  const end = source.indexOf('window.elmaShowHome=showHome', start);
  assert.ok(start >= 0 && end > start);
  const handler = source.slice(start, end);
  assert.match(handler, /showMainTab\(name\)/);
  assert.doesNotMatch(handler, /setTimeout|tabTransitionLocked|pointerdown/);
});

test('tab reveal is short and honors reduced motion', () => {
  assert.match(source, /elmaSoftTabReveal 210ms ease-out/);
  assert.match(source, /prefers-reduced-motion:reduce/);
  assert.match(source, /data-reduce-motion="true"/);
  assert.match(source, /if\(current===name\)return/);
});
