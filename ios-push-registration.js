(() => {
  const AMASYA_BOUNDS = { minLat: 39.85, maxLat: 41.05, minLng: 34.85, maxLng: 36.65 };
  if (!/ElmaGo-iOS\//.test(navigator.userAgent)) return;
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
    return new Promise((resolve) => navigator.geolocation?.getCurrentPosition(async ({ coords }) => {
      if (!inAmasya(coords)) return resolve(null);
      const place = await reverseCity(coords.latitude, coords.longitude);
      if (place && !/amasya/i.test(place)) return resolve(null);
      resolve({ latitude: coords.latitude, longitude: coords.longitude });
    }, () => resolve(null), { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }));
  }
  async function saveDevice(event) {
    const token = event.detail?.token;
    if (!token) return;
    const position = await verifiedAmasyaPosition();
    if (!position) return;
    const detail = { token, platform: 'ios', city: 'Amasya', ...position };
    window.dispatchEvent(new CustomEvent('elma-ios-push-ready', { detail }));
    try { localStorage.setItem('elma_ios_push_device_v1', JSON.stringify({ ...detail, updatedAt: Date.now() })); } catch {}
  }
  window.addEventListener('elmaNativePushToken', saveDevice);
  if (window.__elmaPushToken) saveDevice({ detail: { token: window.__elmaPushToken } });
})();
