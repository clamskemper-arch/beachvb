# Beach Volleyball Turnier

Tablet-App für Beach-Volleyball-Turniere. Offline-fähig, keine laufenden Kosten.

## Setup

```bash
npm install
npm run dev       # Entwicklungsserver
npm run build     # Produktions-Build → dist/
```

## Deployment (GitHub Pages – kostenlos)

1. Repo auf GitHub erstellen
2. Code pushen (`git push origin main`)
3. In GitHub: **Settings → Pages → Source: GitHub Actions**
4. Der Workflow `.github/workflows/deploy.yml` baut und deployed automatisch

Die App ist dann unter `https://<user>.github.io/<repo>/` erreichbar.

### Offline-Nutzung auf dem Tablet

Nach dem ersten Laden die App als PWA installieren:
- **Android/Chrome:** Menü → "Zum Startbildschirm hinzufügen"
- **iOS/Safari:** Teilen → "Zum Home-Bildschirm"

Danach läuft die App vollständig offline.

## Icons ersetzen

Die Dateien `public/icon-192.png` und `public/icon-512.png` sind Platzhalter.
Ersetze sie durch eigene 192×192 und 512×512 PNGs (z.B. mit [favicon.io](https://favicon.io)).

## Funktionen

- **Setup:** Spieler, Teamgröße (2v2 / 3v3 / 4v4), Mindestspiele, Felder konfigurieren
- **Runden:** Zufällige Mannschaften jede Runde, faire Pausen-Rotation
- **Ergebnisse:** Selbstbedienung – große +/- Buttons für Tablet-Bedienung
- **Spielerverwaltung:** Spätnachzügler jederzeit hinzufügen, Spieler de-/aktivieren
- **Tabelle:** Siegwertung, Punktdifferenz, Fortschrittsbalken für Mindestspiele
- **Verlauf:** Alle Runden und Ergebnisse einsehbar
