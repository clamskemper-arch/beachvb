# Beach Volleyball Turnier-App — Projektnotizen für Claude

## Stack

- **Vue 3** Composition API mit `<script setup lang="ts">`
- **Pinia** Stores, persistiert via eigenem `persistPlugin` in `localStorage`
- **Vite 6** mit `base: './'`, **Tailwind CSS v4** (`@import "tailwindcss"` + `@theme {}`)
- **Vue Router** mit `createWebHashHistory()` (GitHub Pages, kein Server-Routing)
- **PWA** via `vite-plugin-pwa`

## Wichtige Architektur-Entscheidungen

### Satz-basierter Gewinnquotient
`winRatio = setsWon / setsPlayed` — nicht Siege/Spiele. Entscheidung aus Anforderung "Gewinnquotient aus gewonnenen Sätzen und gespielten Sätzen". Betrifft `usePlayerStats.ts` und `StandingsTable.vue`.

### Match.sets[] vs scoreA/scoreB
`Match.sets: SetResult[]` speichert alle Einzelsatz-Ergebnisse. `scoreA`/`scoreB` auf dem Match sind *gewonnene Sätze* (nicht Punkte). `pointsFor`/`pointsAgainst` in `PlayerStats` summieren die Rohpunkte aus `match.sets`.

### Guard in matchStore.confirm()
`finishRound()` wird nur aufgerufen wenn `round.status === 'active'`. Verhindert, dass das nachträgliche Bearbeiten alter Spielergebnisse eine neue Runde auslöst.

### Runden-Generierung
`schedulePendingRounds()` erzeugt immer nur **eine** Runde (nicht mehr im Batch), basierend auf dem aktuellen Roster und der Historie aus `finished`-/`active`-Runden (siehe `createRound()`/`deleteRound()` in `round.ts`, gemeinsam genutzt von `schedulePendingRounds()` und `regenerateCurrentRound()`). `finishRound()` generiert danach automatisch die nächste Runde, solange nicht jeder aktive Spieler `minGamesPerPlayer` Spiele erreicht hat; ist das Ziel erreicht, landet man auf dem "Turnier beenden oder Weitere Runde generieren"-Screen. Pro Runde maximal `courtCount` Spiele.

Roster-Änderungen (Spieler hinzufügen/aktivieren/deaktivieren in `PlayerManagementView.vue`) lösen **keine** automatische Rundenneuberechnung mehr aus — Änderungen wirken sich erst ab der nächsten neu berechneten Runde aus. Der Button "Aktuelle Runde neu berechnen" im Reiter `RoundsView.vue` (Rundenverlauf; mit Bestätigungsdialog, da bereits eingetragene Ergebnisse verloren gehen, und `AppToast`-Feedback nach Abschluss) löscht gezielt die aktuell **laufende** Runde und berechnet sie unter derselben Rundennummer neu (`roundStore.regenerateCurrentRound()`).

### Fairness bei Sit-outs
Spieler mit den wenigsten bisherigen Pausen kommen zuerst dran (Sit-out-Counter wird getrackt). Bei Gleichstand zufälliger Tiebreak.

### Geschlechter-Balance bei Teamgenerierung
Beim Pairen von Teams wird versucht, gleich viele Frauen und Männer in gegenüberstehenden Teams zu haben.

### Teammate/Gegner-Fairness (`PairingHistory` in `teamGenerator.ts`)
`round.ts` baut vor jeder Rundengenerierung eine `PairingHistory` (Teammate-/Gegner-Zählung pro Spielerpaar) aus allen `finished`- und der aktuellen `active`-Runde. `formBalancedTeams()` füllt Team-Slots danach greedy: für jeden Slot wird der verbleibende Kandidat gewählt, der am wenigsten oft mit den aktuellen Team-Mitgliedern gespielt bzw. gegen das aktuelle Gegner-Team gespielt hat.

## Bekannte Einschränkungen dieser Umgebung

- **`npm install` funktioniert nicht** — kein Internetzugang, `node_modules` nicht installiert
- **`npm run build` / `vue-tsc` schlägt fehl** — Build-Validierung läuft nur über GitHub Actions CI
- **`git push` schlägt fehl** — Netzwerksperre (CONNECT tunnel 403). Push muss der User manuell ausführen: `! git -C /workspace/beachvb push`

## Datenmodell-Highlights

```ts
// Backward-Compat: match.sets ?? [] für alte localStorage-Daten ohne sets-Feld
// config?.setsPerMatch ?? 2 für alte Turnierdaten
// config?.pointsPerSet ?? 21 für alte Turnierdaten ohne dieses Feld
// player.hiddenInStandings ?? false für alte Spielerdaten ohne dieses Feld

interface SetResult { scoreA: number; scoreB: number }
interface Match {
  sets: SetResult[]
  scoreA: number | null  // = gewonnene Sätze Team A
  scoreB: number | null  // = gewonnene Sätze Team B
}
interface TournamentConfig {
  teamSize: 2 | 3 | 4; setsPerMatch: number; pointsPerSet: number
  minGamesPerPlayer: number; courtCount: number
}
```

## Store-Übersicht

| Store | Datei | Verantwortung |
|---|---|---|
| `useTournamentStore` | `stores/tournament.ts` | Turnier-Metadaten, Config, Status |
| `usePlayerStore` | `stores/player.ts` | Spieler CRUD, aktiv/inaktiv, Geschlecht |
| `useRoundStore` | `stores/round.ts` | Runden erstellen, Teams generieren |
| `useMatchStore` | `stores/match.ts` | Ergebnisse eintragen, Match abschließen |

Composable `usePlayerStats.ts` berechnet Tabellenwerte reaktiv aus den Stores (kein eigener Store).

## Routen

```
/#/setup                  → SetupView
/#/tournament/active      → ActiveRoundView
/#/tournament/scores      → ScoreEntryView
/#/tournament/rounds      → RoundsView
/#/tournament/standings   → StandingsView
/#/tournament/players     → PlayerManagementView
/#/tournament/info        → TournamentInfoView
```

## UI-Konventionen

- Tailwind-Farbschema: **amber** (Primär), **stone** (Neutral), **green** (Erfolg), **red** (Gefahr)
- Tablet-optimiert: Buttons mindestens `w-10 h-10`, Score-Inputs groß
- Komponenten: `AppButton`, `AppCard`, `AppBadge` aus `components/ui/`
- Tab-Navigation über `TabBar.vue` in `TournamentLayout.vue`

## GitHub

Repository: https://github.com/clamskemper-arch/beachvb  
Deploy: GitHub Actions → `gh-pages` Branch → GitHub Pages
