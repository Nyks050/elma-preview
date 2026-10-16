const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');

const source = fs.readFileSync(path.resolve(__dirname, '../ios-push-registration.js'), 'utf8');

async function runWithGeolocation(geolocation) {
  const listeners = {};
  const events = [];
  const context = {
    navigator: { userAgent: 'ElmaGo-iOS/1.0', ...(geolocation === undefined ? {} : { geolocation }) },
    localStorage: { removeItem() {} },
    window: {
      addEventListener(name, callback) { listeners[name] = callback; },
      dispatchEvent(event) { events.push(event); }
    },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options.detail; } },
    URL, fetch: async () => ({ json: async () => ({ features: [] }) })
  };
  vm.runInNewContext(source, context);
  await listeners.elmaNativePushToken({ detail: { token: 'test-token' } });
  return events;
}

test('push token handler finishes without geolocation API', async () => {
  assert.equal((await runWithGeolocation(undefined)).length, 0);
});

test('push token handler finishes when geolocation throws', async () => {
  assert.equal((await runWithGeolocation({ getCurrentPosition() { throw new Error('denied'); } })).length, 0);
});

test('push token handler does not register outside Amasya', async () => {
  const events = await runWithGeolocation({
    getCurrentPosition(success) {
      success({ coords: { latitude: 41.9, longitude: 29.0 } });
    }
  });
  assert.equal(events.length, 0);
});
