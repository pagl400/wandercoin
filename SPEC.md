# Build-Spezifikation: Währungsrechner-App (React Native)

> **Hinweis für Claude Code:** Diese Datei ist die einzige Quelle der Wahrheit für das Projekt. Lies sie vollständig, bevor du anfängst. Arbeite phasenweise, frage nach, bevor du eine Phase verlässt, und mache Git-Commits in sinnvollen Einheiten (ein Commit = ein abgeschlossener logischer Schritt, nicht ein Commit pro Datei).

---

## 1. Projekt-Überblick

**Was:** Native Mobile-App zur Umrechnung von Währungen mit historischen Kursverläufen.
**Plattformen:** iOS und Android (eine Codebase via React Native + Expo).
**Distribution:** Apple App Store und Google Play Store.
**Monetarisierung:** Einmaliger Kaufpreis (Pricing-Tier wird später im Store festgelegt — keine In-App-Käufe, keine Abos, keine Werbung).
**Backend:** Keines. Die App spricht direkt mit der Frankfurter API. Alle Daten werden lokal auf dem Gerät zwischengespeichert.
**Ziel-Nutzer:** Reisende, Online-Shopper, gelegentliche Investoren — Leute, die schnell und werbefrei einen Kurs sehen und den Verlauf der letzten Monate prüfen wollen.

---

## 2. Tech-Stack

Wenn nicht anders angegeben: jeweils aktuelle stabile Version verwenden.

| Komponente | Wahl | Begründung |
|---|---|---|
| Runtime | Node.js LTS (v20+) | — |
| Framework | **Expo (Managed Workflow)** | Kein natives Setup nötig, EAS Build für Store-Builds |
| Sprache | **TypeScript** (strict mode) | Typsicherheit, Self-Documentation |
| Navigation | `@react-navigation/native` + `native-stack` | De-facto Standard |
| State Management | **Zustand** + `zustand/middleware/persist` | Winzig, kein Boilerplate, persistiert via AsyncStorage |
| Storage | `@react-native-async-storage/async-storage` | Cache + Settings |
| HTTP | `fetch` (kein Axios nötig) | Native, eine Abhängigkeit weniger |
| Charts | **`react-native-gifted-charts`** | Moderne API, gute Animationen, aktiv gepflegt |
| Datum | `date-fns` | Tree-shakeable, kein Locale-Ballast |
| Icons | `@expo/vector-icons` (kommt mit Expo) | — |
| Linting | ESLint + Prettier (Expo-Defaults) | — |

**Bewusst NICHT verwendet:**
- Redux/MobX (Zustand reicht)
- Axios (fetch reicht)
- Reanimated / Gesture Handler manuell (Expo bringt's mit, kein Custom-Setup nötig)
- SQLite im MVP (AsyncStorage reicht, da Daten klein und flach sind)

---

## 3. Datenquelle: Frankfurter API

**Base URL:** `https://api.frankfurter.dev/v1`
**Kein API-Key, kein Account, kein Rate-Limit-Header.** Daten kommen von der Europäischen Zentralbank, Update täglich gegen 16:00 CET.

**Genutzte Endpoints:**

```
GET /latest?from=EUR&to=USD,GBP,JPY
→ aktueller Kurs

GET /currencies
→ Liste aller verfügbaren Währungen mit Klarnamen
→ Antwort-Beispiel: { "EUR": "Euro", "USD": "United States Dollar", ... }

GET /{startDate}..{endDate}?from=EUR&to=USD
→ Zeitreihe zwischen zwei Daten
→ Beispiel: /2025-01-01..2026-01-01?from=EUR&to=USD

GET /{date}?from=EUR&to=USD
→ Historischer Einzelkurs an einem Datum
```

**Wichtig:** ECB liefert KEINE Wochenend-Daten. Beim Charten muss die App damit umgehen (entweder Lücken zulassen oder den vorherigen Werktag verwenden — siehe Phase 2).

**Verfügbare Währungen:** ~31 Hauptwährungen (EUR, USD, GBP, JPY, CHF, CAD, AUD, CNY, INR, BRL, ZAR, MXN, etc.). Keine Krypto, keine Edelmetalle. Bei Bedarf später Paid-Provider, dann aber mit Backend-Proxy (außerhalb Scope dieses MVP).

---

## 4. Architektur & Projektstruktur

```
currency-app/
├── app.json                       Expo-Konfiguration
├── eas.json                       EAS Build / Submit Profile
├── package.json
├── tsconfig.json                  strict: true
├── App.tsx                        Root, NavigationContainer, Theme
├── assets/
│   ├── icon.png                   1024x1024
│   ├── adaptive-icon.png          Android Adaptive Icon Foreground
│   └── splash.png
└── src/
    ├── screens/
    │   ├── ConverterScreen.tsx
    │   ├── ChartScreen.tsx
    │   ├── CurrencyPickerScreen.tsx     Modal-Style, sucht in Liste
    │   └── SettingsScreen.tsx
    ├── components/
    │   ├── AmountInput.tsx
    │   ├── CurrencyButton.tsx           zeigt Code + Flag, öffnet Picker
    │   ├── SwapButton.tsx
    │   ├── ResultDisplay.tsx
    │   ├── MiniChart.tsx                kleine Vorschau auf Converter-Screen
    │   ├── TimeRangeTabs.tsx
    │   └── ErrorBanner.tsx
    ├── services/
    │   ├── frankfurterApi.ts            alle API-Calls
    │   └── cache.ts                     AsyncStorage-Wrapper mit TTL
    ├── store/
    │   └── useAppStore.ts               Zustand-Store (persistiert)
    ├── hooks/
    │   ├── useLatestRate.ts
    │   ├── useTimeSeries.ts
    │   └── useCurrencies.ts
    ├── types/
    │   └── currency.ts
    ├── utils/
    │   ├── format.ts                    Number-Formatting nach Locale
    │   ├── dates.ts                     Zeitbereich-Berechnung
    │   └── flags.ts                     ISO-Code → Emoji-Flagge
    └── theme/
        ├── colors.ts                    Light + Dark Palettes
        └── typography.ts
```

---

## 5. Feature-Spezifikation

### 5.1 Converter-Screen (Hauptbildschirm)

Layout von oben nach unten:

1. **Header** mit App-Name links, Settings-Icon rechts.
2. **Betrag-Eingabe** (großes Numpad-Feld, dezimaler Punkt nach Locale).
3. **"Von"-Währungs-Button** — zeigt Flagge + ISO-Code + Klarname, beim Tippen öffnet sich der `CurrencyPickerScreen`.
4. **Swap-Button** — kreisrund, dreht Pfeil-Icon animiert (300ms), tauscht Von/Nach. Haptic-Feedback auf iOS.
5. **"Nach"-Währungs-Button** — analog.
6. **Ergebnis-Anzeige** — große Zahl, klein darunter der Kurs ("1 EUR = 1,0823 USD").
7. **Mini-Chart** der letzten 30 Tage — beim Antippen → `ChartScreen`.
8. **Footer** — "Daten: EZB · Stand: heute 16:00" (Datum dynamisch).

Verhalten:
- Tippen auf "Von" oder "Nach" öffnet Picker mit Suchfeld
- Während Kurs geladen wird: dezenter Skeleton-Loader im Ergebnis-Bereich
- Wenn Cache verfügbar, sofort rendern und im Hintergrund refreshen
- Bei Netzwerk-Fehler: `ErrorBanner` oben, Werte aus Cache mit Hinweis "Offline"

### 5.2 Chart-Screen

- Großes Line-Chart in der Mitte
- Zeitbereich-Tabs darüber: **1W | 1M | 3M | 6M | 1J | 5J** (Max wurde durch 5J ersetzt — 27 Jahre EZB-Historie ist unnötig groß; Update 2026-05-14)
- Tooltip beim Tippen auf einen Punkt: Datum + Kurs
- Unter dem Chart: Min / Max / Durchschnitt für gewählten Bereich
- Wochenend-Lücken: Linie verbindet durch (kein optisches Stolpern)
- Cache-Strategie: einmal geladene historische Bereiche werden zusammengeführt und behalten (ECB-Historie ist immutable)

### 5.3 Currency-Picker-Screen (Modal)

- Suchfeld oben (filtert auf Code + Klarname, case-insensitive)
- Liste aller verfügbaren Währungen
- Ganz oben: Sektion "Favoriten" (default: EUR, USD, GBP, JPY, CHF)
- Tippen auf eine Währung → schließt Modal, setzt Auswahl im Store

### 5.4 Settings-Screen

- Theme: System / Hell / Dunkel
- Dezimalstellen: 2 / 4 / 6
- Favoriten verwalten
- "Über die App" mit Datenquelle und Version
- Datenschutz-Link (URL noch zu definieren)
- Reset-Cache-Button (debug-freundlich)

---

## 6. Implementierungs-Phasen

**Wichtig:** Am Ende jeder Phase: `npx tsc --noEmit` muss fehlerfrei durchlaufen und die App in Expo Go muss starten. **Nicht in die nächste Phase übergehen, ohne dass der Nutzer per Auge bestätigt hat, dass die aktuelle Phase wie erwartet funktioniert.**

### Phase 0: Setup
- `npx create-expo-app currency-app --template blank-typescript`
- Alle Dependencies installieren (siehe Tech-Stack)
- ESLint + Prettier konfigurieren
- `tsconfig.json` auf `"strict": true`
- Ordnerstruktur anlegen
- `app.json`: Name, Slug, Bundle Identifier (iOS) + Package Name (Android) festlegen — **vor erstem Commit Nutzer fragen!**
- Erster Commit: "chore: initial project setup"

### Phase 1: Datenschicht
- `src/types/currency.ts` definieren (Rate, TimeSeries, Currency types)
- `src/services/frankfurterApi.ts` mit allen drei Endpoint-Funktionen + sauberem Error-Handling
- `src/services/cache.ts` als generischer TTL-Cache über AsyncStorage
- Unit-Test-Approach: zumindest `frankfurterApi.ts` manuell im `App.tsx` einmal aufrufen und Ergebnis loggen — bevor UI dazukommt
- Acceptance: Console zeigt aktuellen EUR→USD-Kurs

### Phase 2: Converter-Screen MVP
- `useAppStore` (Zustand mit persist)
- `useLatestRate`-Hook
- `useCurrencies`-Hook (lange Cache-TTL, ~30 Tage)
- `AmountInput`, `CurrencyButton`, `SwapButton`, `ResultDisplay` als simple Komponenten
- Converter-Screen ohne Picker noch (Währungen hardcoded EUR/USD)
- Acceptance: Betrag eingeben → korrekte Umrechnung sichtbar, Swap funktioniert

### Phase 3: Currency-Picker
- `CurrencyPickerScreen` als Modal-Route
- Suchfeld, Liste, Favoriten-Sektion
- Anbindung an Converter-Screen
- Acceptance: Beliebige Währung auswählbar, Auswahl persistiert nach App-Neustart

### Phase 4: Charts
- `useTimeSeries`-Hook mit Zeitbereich als Parameter
- `MiniChart` auf Converter-Screen (30 Tage, kleines Format, nicht interaktiv)
- `ChartScreen` voll: Tabs, Tooltip, Stats
- Wochenend-Lücken-Handling
- Acceptance: Alle Zeitbereich-Tabs funktionieren, Tooltip zeigt korrekte Werte

### Phase 5: Settings + Theming
- Settings-Screen
- Theme-System mit Context + AsyncStorage-Persistenz
- Dark Mode für alle Screens durchziehen
- Dezimalstellen-Setting wirkt auf `ResultDisplay`
- Acceptance: Theme-Wechsel sofort sichtbar, alle Screens dunkel-tauglich

### Phase 6: Polish + Edge Cases
- Skeleton-Loader während erstem Fetch
- Offline-Banner mit Stand-Zeit
- Empty-States im Picker (Suche ohne Treffer)
- Haptic Feedback an Swap-Button (iOS)
- App-Icon + Splash Screen finalisieren
- Performance-Check: lange Listen flüssig? Charts butterweich?
- Acceptance: Drei verschiedene "Misuse"-Szenarien (Flugmodus, langsames Netz, ungültige Eingabe) sehen sauber aus

### Phase 7: Store-Vorbereitung
- `eas.json` mit `preview` und `production` Profilen
- iOS Build via `eas build --platform ios --profile preview` testen
- Android Build analog
- TestFlight / Internal Testing Setup
- Diese Phase **macht der Nutzer**, Claude Code begleitet beratend

---

## 7. Coding-Standards

- **TypeScript strict** überall, keine `any` außer mit Kommentar warum
- **Komponenten als Function Components** mit explizit getypten Props
- **Keine Default-Exports** in Komponenten (Named Exports → bessere Refactor-Sicherheit)
- **Styling:** StyleSheet.create am Datei-Ende, keine inline Styles außer für dynamische Werte
- **Hooks am Anfang** der Komponente, dann Handler, dann Return
- **Async-Fehler** immer fangen und zu typisierten Result-Werten oder Banner-Nachrichten umwandeln
- **Konstanten** (Cache-TTLs, Default-Werte) in `src/constants.ts`, nicht magisch verstreut
- **Dateinamen:** PascalCase für Komponenten, camelCase für alles andere

---

## 8. Was NICHT zu tun

- **Kein Backend bauen.** Falls die Diskussion aufkommt, ablehnen — das ist eine bewusste Architektur-Entscheidung.
- **Keine Authentifizierung, keine User-Accounts, kein Login.**
- **Keine Analytics oder Tracking** im MVP (Privacy-First ist Teil der App-Positionierung).
- **Keine In-App-Purchases.** Die App ist Paid-Download, fertig.
- **Keine Push-Notifications** im MVP (potenziell Phase 2 für Kurs-Alerts, aber nicht jetzt).
- **Keine Krypto, keine Edelmetalle.** Frankfurter hat sie nicht, Provider-Wechsel ist Out-of-Scope.
- **Keine eigene Übersetzung** im MVP — App ist erstmal Deutsch + Englisch nach Device-Locale, mehr Sprachen später.
- **Keine Charts-Library, die WebView nutzt.** Nur native Rendering.

---

## 9. Code-Skelette als Anker

Diese Snippets sind die verbindliche Stilreferenz. Größere Abweichungen bitte mit dem Nutzer abklären.

### `src/services/frankfurterApi.ts`

```typescript
const BASE = 'https://api.frankfurter.dev/v1';

export type RateMap = Record<string, number>;

export class FrankfurterError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
  }
}

export async function fetchLatest(from: string, to: string[]): Promise<{
  date: string;
  rates: RateMap;
}> {
  try {
    const url = `${BASE}/latest?from=${from}&to=${to.join(',')}`;
    const res = await fetch(url);
    if (!res.ok) throw new FrankfurterError(`HTTP ${res.status}`);
    const data = await res.json();
    return { date: data.date, rates: data.rates };
  } catch (e) {
    throw new FrankfurterError('Could not fetch latest rates', e);
  }
}

export async function fetchCurrencies(): Promise<Record<string, string>> {
  const res = await fetch(`${BASE}/currencies`);
  if (!res.ok) throw new FrankfurterError(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchTimeSeries(
  from: string,
  to: string,
  start: string,
  end: string
): Promise<Record<string, number>> {
  const url = `${BASE}/${start}..${end}?from=${from}&to=${to}`;
  const res = await fetch(url);
  if (!res.ok) throw new FrankfurterError(`HTTP ${res.status}`);
  const data = await res.json();
  return Object.fromEntries(
    Object.entries(data.rates as Record<string, RateMap>).map(
      ([date, rates]) => [date, rates[to]]
    )
  );
}
```

### `src/store/useAppStore.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'system' | 'light' | 'dark';

interface AppState {
  from: string;
  to: string;
  amount: string;
  favorites: string[];
  theme: Theme;
  decimals: 2 | 4 | 6;

  setFrom: (c: string) => void;
  setTo: (c: string) => void;
  setAmount: (a: string) => void;
  swap: () => void;
  toggleFavorite: (c: string) => void;
  setTheme: (t: Theme) => void;
  setDecimals: (d: 2 | 4 | 6) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      from: 'EUR',
      to: 'USD',
      amount: '100',
      favorites: ['EUR', 'USD', 'GBP', 'JPY', 'CHF'],
      theme: 'system',
      decimals: 2,

      setFrom: (c) => set({ from: c }),
      setTo: (c) => set({ to: c }),
      setAmount: (a) => set({ amount: a }),
      swap: () => set((s) => ({ from: s.to, to: s.from })),
      toggleFavorite: (c) =>
        set((s) => ({
          favorites: s.favorites.includes(c)
            ? s.favorites.filter((x) => x !== c)
            : [...s.favorites, c],
        })),
      setTheme: (t) => set({ theme: t }),
      setDecimals: (d) => set({ decimals: d }),
    }),
    {
      name: 'currency-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
```

---

## 10. Zusammenarbeit mit Claude Code

- **Plane jede Phase bevor du Code schreibst.** Liste die Dateien auf, die du anfassen/erstellen wirst, und warte auf Bestätigung bei größeren Phasen (3+).
- **Frage, wenn etwas in dieser Spec unklar ist.** Nicht raten.
- **Mach Vorschläge, wenn dir was Besseres einfällt** — aber implementier es nicht ohne Rückmeldung. Begründung kurz nennen.
- **Vermeide es, mehrere Phasen auf einmal abzuarbeiten.** Eine Phase = ein Sub-Ziel = ein oder mehrere Commits = eine Bestätigungsrunde.
- **Logge Annahmen explizit.** Wenn du irgendwo einen Default setzt (z.B. Mini-Chart-Höhe, Animations-Dauer), schreib's in einen Kommentar.
- **Testing:** Manuell in Expo Go ist ok für diesen Scope. Keine Jest/Detox-Tests erzwingen, außer der Nutzer fragt explizit.

---

## 11. Erste Schritte

Wenn du das hier liest, beginne mit:

1. **Lies die gesamte Spec.**
2. **Fasse in 5 Sätzen zusammen**, was du verstanden hast, und stelle 2–3 Klärungsfragen, falls vorhanden.
3. **Schlage Bundle Identifier / Package Name vor** (z.B. `com.<deinname>.currencyapp`) und frage den Nutzer.
4. **Schlage einen App-Namen vor** (kurz, store-tauglich, nicht "Currency Converter" — das gibt's 50× im Store).
5. Erst dann: Phase 0.

---

**Stand der Spec:** Erstversion. Änderungen am Scope bitte zusammen mit dem Nutzer in dieses Dokument einarbeiten, nicht stillschweigend abweichen.
