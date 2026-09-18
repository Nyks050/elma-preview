# elma-preview
## Harita altyapısı

Uygulamanın etkin haritası Leaflet üzerinde OpenStreetMap döşemelerini kullanır (`osm-map-adapter.js`). Adres araması ve ters adres çözümü Photon, yol ve yaya rotaları OSM verisiyle çalışan yönlendirme servislerinden gelir. Durak ve hat haritaları aynı harita bileşenini paylaşır.

- Harita döşemesi varsayılan olarak `https://tile.openstreetmap.org/{z}/{x}/{y}.png`; gerekirse sayfa yüklenmeden önce `window.ELMA_OSM_TILE_URL` ile değiştirilebilir.
- Adres araması için `window.ELMA_OSM_SEARCH_URL` kullanılabilir. Varsayılan Photon demo servisi makul trafik içindir; yüksek kullanımda özel bir örnek veya uygun sağlayıcı gereklidir.
- Harita yalnızca kullanıcı harita görünümüne geçtiğinde döşeme yükler. OSM atfı görünür tutulmalıdır; toplu döşeme indirme veya çevrimdışı ön yükleme eklenmemelidir.
- Rota servisleri de açık demo uç noktalarıdır; üretimde ölçek ve süreklilik için ayrı bir servis altyapısı gereklidir.
