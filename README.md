# ELMA — Smart City Mobility App

**An AI-assisted mobile app project for urban transportation in Amasya, Türkiye.**

ELMA is a working iOS prototype designed to help students and residents navigate local transportation. It explores a simpler way to find routes, discover transit lines, check upcoming vehicles, read announcements, and report lost or found items.

## Project at a glance

- **Platform:** iPhone (iOS 17+ prototype)
- **iOS technologies:** Swift, SwiftUI, MapKit
- **Core experience:** Map-based navigation, origin/destination search, suggested routes, transit lines and upcoming vehicles, announcements, lost-and-found flows
- **Development approach:** Independently built with AI-assisted coding tools
- **Status:** Working prototype; not yet published on the App Store

**Important:** Transit lines and arrival times currently use prototype data; real-time transport feeds are not yet integrated. This repository contains the public preview and related map infrastructure, while the iOS source repository is private.

## For potential clients

I create functional mobile app prototypes and MVPs with AI-assisted development workflows, focusing on turning an idea into a testable product. ELMA is an example of my hands-on product-building work. For a project inquiry, please reach out via my GitHub profile.

## Screenshots and demo

A product walkthrough and screenshots can be shared upon request. They will be added here when ready.

---

## Preview implementation notes

# elma-preview
## Harita altyapısı

Uygulamanın etkin haritası Leaflet üzerinde OpenStreetMap döşemelerini kullanır (`osm-map-adapter.js`). Adres araması ve ters adres çözümü Photon, yol ve yaya rotaları OSM verisiyle çalışan yönlendirme servislerinden gelir. Durak ve hat haritaları aynı harita bileşenini paylaşır.

- Harita döşemesi varsayılan olarak `https://tile.openstreetmap.org/{z}/{x}/{y}.png`; gerekirse sayfa yüklenmeden önce `window.ELMA_OSM_TILE_URL` ile değiştirilebilir.
- Adres araması için `window.ELMA_OSM_SEARCH_URL` kullanılabilir. Varsayılan Photon demo servisi makul trafik içindir; yüksek kullanımda özel bir örnek veya uygun sağlayıcı gereklidir.
- Harita yalnızca kullanıcı harita görünümüne geçtiğinde döşeme yükler. OSM atfı görünür tutulmalıdır; toplu döşeme indirme veya çevrimdışı ön yükleme eklenmemelidir.
- Rota servisleri de açık demo uç noktalarıdır; üretimde ölçek ve süreklilik için ayrı bir servis altyapısı gereklidir.
