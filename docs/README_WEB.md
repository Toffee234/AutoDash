# AutoDash Web — Einrichtungsanleitung

CarPlay-ähnliches Browser-Dashboard für iPhone/iPad.  
Keine App-Installation, kein Developer Account, keine API-Keys erforderlich.

---

## Dateien

```
autodash.html     ← Haupt-Dashboard (standalone, alles inline)
manifest.json     ← PWA-Manifest (Name, Icons, Farben)
sw.js             ← Service Worker (Offline-Cache)
README_WEB.md     ← Diese Datei
```

---

## Option 1 – Lokaler Webserver (empfohlen)

### macOS / Linux
```bash
cd /pfad/zu/AutoDash-Web
python3 -m http.server 8080
```
→ Browser: `http://localhost:8080/autodash.html`

### Windows
```powershell
cd C:\pfad\AutoDash-Web
python -m http.server 8080
```

### Node.js (npx)
```bash
npx serve AutoDash-Web -p 8080
```

---

## Option 2 – Offline / Direkt öffnen

Nur `autodash.html` direkt im Browser öffnen (file://…).  
**Einschränkungen bei `file://`:**  
- Service Worker funktioniert **nicht** (Offline-Cache deaktiviert)  
- GPS funktioniert **nicht** (HTTPS-Pflicht)  
- Wetter-API funktioniert **nicht** (CORS)

**→ Für GPS, Wetter und PWA immer einen lokalen Server verwenden.**

---

## Option 3 – Auf iPhone als PWA installieren (empfohlen für Auto)

1. Webserver im lokalen WLAN starten (s. Option 1)
2. iPhone im gleichen WLAN: Safari öffnen → `http://192.168.x.x:8080/autodash.html`
3. **Teilen-Symbol → „Zum Home-Bildschirm"**
4. AutoDash erscheint als App-Icon → startet im Vollbild ohne Safari-UI

**Für HTTPS auf lokalem Server (GPS-Voraussetzung):**
```bash
# Mit mkcert (einmalige Einrichtung)
brew install mkcert
mkcert -install
mkcert localhost 192.168.x.x
python3 -m http.server 8443 --bind 0.0.0.0 &
# Oder besser: caddy, nginx oder ngrok
```

---

## Option 4 – Hosting (HTTPS, öffentlich)

### GitHub Pages (kostenlos)
1. Repository erstellen → Dateien hochladen
2. Settings → Pages → Source: main/root
3. URL: `https://username.github.io/repo/autodash.html`

### Netlify Drop (einfachstes)
1. netlify.com/drop aufrufen
2. `AutoDash-Web`-Ordner per Drag & Drop hochladen
3. Sofort eine HTTPS-URL

---

## Berechtigungen

| Browser-Popup                          | Zweck                    | Verhalten bei Ablehnung     |
|----------------------------------------|--------------------------|------------------------------|
| Standortzugriff                        | GPS-Tacho, Wetter, Karte | Demo-Wetter, Tacho zeigt 0   |
| Bewegungs- und Orientierungsdaten (iOS)| Kompass                  | Kompassnadel dreht sich nicht|

GPS und Kompass werden erst auf Interaktion angefragt (erster Tap).

---

## API-Dienste (alle kostenlos, kein Key)

| Dienst                      | Verwendung                 | Limits                            |
|-----------------------------|----------------------------|-----------------------------------|
| Open-Meteo                  | Wetter                     | Kostenlos, kein Key               |
| OpenStreetMap / CARTO       | Kartenkacheln              | Kostenlos, faire Nutzungsrichtlinien|
| Nominatim (OSM)             | Adresssuche                | Max 1 req/s, User-Agent nötig     |
| OSRM Demo                   | Routenberechnung           | Demo-Server, keine Garantie       |

**Wichtig für Produktion:** OSRM Demo-Server ist für Tests gedacht.  
Für stabilen Betrieb: eigene OSRM-Instanz oder Alternative (GraphHopper, Valhalla).

---

## Features

| Kachel          | Technologie                        | Offline    |
|-----------------|------------------------------------|------------|
| Uhr             | JavaScript `Date`                  | ✅ Immer   |
| Wetter          | Open-Meteo API                     | ❌ Nur online (Demo-Fallback) |
| Karte           | Leaflet.js + OSM/CARTO             | ⚠️ Gecachte Kacheln |
| Navigation      | Nominatim + OSRM                   | ❌ Nur online |
| Musik           | HTML5 `<audio>` + Media Session API| ✅ Lokale Dateien |
| Telefon         | `tel:`-Links                       | ✅ Immer   |
| GPS-Tacho       | Geolocation API                    | ❌ HTTPS nötig |
| Kompass         | DeviceOrientation API              | ✅ Kein Netz nötig |

---

## Bekannte Einschränkungen

- **Anrufe:** Browser können keine eingehenden Anrufe monitoren.  
  Die Telefon-Kachel bietet nur Notruf-Buttons (112/110) und öffnet den Wähler.
- **Spotify Album-Art:** Media Session API liefert Metadaten, aber Artwork  
  erscheint erst wenn Spotify aktiv ist und die Metadaten bereitstellt.
- **OSRM Demo-Server:** Kann bei hoher Last langsam oder nicht erreichbar sein.
- **GPS auf iOS Safari:** Erfordert HTTPS. Bei `file://` kein GPS.
- **Kompass-Berechtigung (iOS 13+):** Wird beim ersten Tap abgefragt.

---

*Generiert mit Claude Code — AutoDash Web v1.0*
