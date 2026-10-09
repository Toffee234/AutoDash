# AutoDash v3.0

CarPlay-Ersatz für iPhone / iPad und Browser.

## Struktur

```
autodash/
├── web/                   ← Web-Version (HTML + PWA)
│   ├── autodash.html      ← Haupt-App (single-file, offline-fähig)
│   ├── sw.js              ← Service Worker (Offline / Cache)
│   ├── manifest.json      ← PWA-Manifest
│   └── README_WEB.md      ← Installations-Anleitung Web
│
└── README.md
```

## Web-Version starten

Einfach `autodash.html` in einem modernen Browser öffnen — keine Build-Tools, kein Server nötig.

Für vollständige PWA-Funktion (Offline, Installierbar) via HTTPS hosten:
```bash
# Lokaler Dev-Server:
npx serve web/
# oder
python3 -m http.server 8080 --directory web/
```

## Features v3.0

- **Analogtacho** — 270°-Bogen-Gauge, 3 Farbzonen (0–100 / >100 / >130 km/h)
- **Glassmorphism-Kacheln** — `backdrop-filter: blur` mit variierenden Farbakzenten
- **Musik Album-Art-Hintergrund** — unscharfes Cover-Bild hinter der Musik-Kachel
- **Animierte Wettericons** — CSS Keyframes pro Wetterkategorie
- **Turn-by-Turn Navigation** — OSRM-Schritte mit Manöver-Emoji-Banner
- **ETA + Distanz-Badge** — kompaktes Overlay auf der Karte
- **Auto-Neuberechnung** — Off-Route-Erkennung (80 m), automatisches Rerouting
- **Navigation-Bug-Fixes** — vollständiger OSM/Nominatim-Durchfluss geprüft

*Generiert mit Claude Code*
