(() => {
  const AMASYA_BOUNDS = { minLat: 39.85, maxLat: 41.05, minLng: 34.85, maxLng: 36.65 };
  if (!/ElmaGo-iOS\//.test(navigator.userAgent)) return;
  try { localStorage.removeItem('elma_ios_push_device_v1'); } catch {}
  function inAmasya({ latitude, longitude }) {
    return latitude >= AMASYA_BOUNDS.minLat && latitude <= AMASYA_BOUNDS.maxLat && longitude >= AMASYA_BOUNDS.minLng && longitude <= AMASYA_BOUNDS.maxLng;
  }
  async function reverseCity(latitude, longitude) {
    try {
      const url = new URL('https://photon.komoot.io/reverse');
      url.searchParams.set('lat', latitude); url.searchParams.set('lon', longitude); url.searchParams.set('lang', 'tr');
      const response = await fetch(url);
      const place = (await response.json()).features?.[0]?.properties || {};
      return [place.city, place.county, place.state].filter(Boolean).join(' ');
    } catch { return ''; }
  }
  async function verifiedAmasyaPosition() {
    // Optional chaining here used to leave the promise pending forever when
    // geolocation was unavailable (for example, in restricted webviews).
    if (!navigator.geolocation?.getCurrentPosition) return null;
    return new Promise((resolve) => {
      try {
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
          if (!inAmasya(coords)) return resolve(null);
          const place = await reverseCity(coords.latitude, coords.longitude);
          if (place && !/amasya/i.test(place)) return resolve(null);
          resolve({ latitude: coords.latitude, longitude: coords.longitude });
        }, () => resolve(null), { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
      } catch {
        resolve(null);
      }
    });
  }
  async function saveDevice(event) {
    const token = event.detail?.token;
    if (!token) return;
    const position = await verifiedAmasyaPosition();
    if (!position) return;
    const detail = { token, platform: 'ios', city: 'Amasya', ...position };
    window.dispatchEvent(new CustomEvent('elma-ios-push-ready', { detail }));
  }
  window.addEventListener('elmaNativePushToken', saveDevice);
  if (window.__elmaPushToken) saveDevice({ detail: { token: window.__elmaPushToken } });
})();
