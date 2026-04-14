# Design Document: Smart Travel Addis Ababa

## Overview

Smart Travel Addis Ababa is a client-side React + Vite single-page application that helps travelers navigate Addis Ababa by comparing transport options, visualizing routes on an interactive Leaflet map, and surfacing destination recommendations. There is no backend — all state lives in React (useState/useContext), and all data is seeded from static JavaScript modules.

The app has two top-level experiences:

- **Traveler UI** (`/`) — public, no auth required. Hero section, location input panel, Leaflet map, results panel, and recommendation cards.
- **Admin Dashboard** (`/admin/*`) — protected by a simple client-side PIN check. Sidebar navigation with four sub-pages: Hub Manager, Transport Manager, Route Manager, and Analytics.

React Router v6 handles all navigation. Tailwind CSS v4 (via `@tailwindcss/vite`) handles all styling. The design system uses a dark-first palette with glassmorphism cards and smooth CSS transitions.

---

## Architecture

### High-Level Structure

```
Client/src/
├── main.jsx                  # ReactDOM.createRoot, Router wrapper
├── App.jsx                   # Route definitions (React Router)
├── context/
│   └── AppContext.jsx         # Global state provider (hubs, routes, transport modes)
├── data/
│   ├── hubs.js               # Seed hub data (name, lat, lng, id)
│   ├── routes.js             # Seed route data (id, name, hubSequence[])
│   └── transportModes.js     # Seed transport config (taxi, bus, walk)
├── lib/
│   ├── routeAnalyzer.js      # Pure scoring/analysis functions
│   ├── recommendationEngine.js # Pure recommendation functions
│   └── geoUtils.js           # Haversine distance, nearest-hub lookup
├── pages/
│   ├── TravelerPage.jsx      # Full traveler experience
│   └── admin/
│       ├── AdminLayout.jsx   # Sidebar + outlet wrapper
│       ├── DashboardHome.jsx
│       ├── HubManager.jsx
│       ├── TransportManager.jsx
│       ├── RouteManager.jsx
│       └── Analytics.jsx
└── components/
    ├── traveler/
    │   ├── HeroSection.jsx
    │   ├── LocationInputPanel.jsx
    │   ├── MapView.jsx
    │   ├── ResultsPanel.jsx
    │   ├── TransportCard.jsx
    │   └── RecommendationCard.jsx
    ├── admin/
    │   ├── Sidebar.jsx
    │   ├── StatCard.jsx
    │   ├── HubTable.jsx
    │   ├── HubModal.jsx
    │   ├── TransportConfigCard.jsx
    │   ├── RouteTable.jsx
    │   ├── RouteForm.jsx
    │   └── UsageChart.jsx
    └── shared/
        ├── Modal.jsx
        ├── ConfirmDialog.jsx
        ├── LoadingOverlay.jsx
        └── ValidationError.jsx
```

### Routing

```
/                     → TravelerPage
/admin                → redirect to /admin/dashboard
/admin/dashboard      → AdminLayout > DashboardHome
/admin/hubs           → AdminLayout > HubManager
/admin/transport      → AdminLayout > TransportManager
/admin/routes         → AdminLayout > RouteManager
/admin/analytics      → AdminLayout > Analytics
```

React Router's `<Outlet>` pattern is used inside `AdminLayout` so the sidebar persists across all admin sub-pages without re-mounting.

---

## Components and Interfaces

### AppContext

Central state store. Provides and manages:

```js
{
  hubs: Hub[],
  routes: Route[],
  transportModes: TransportMode[],
  // Dispatch actions
  addHub(hub), updateHub(id, hub), deleteHub(id),
  addRoute(route), updateRoute(id, route), deleteRoute(id),
  updateTransportMode(id, config),
}
```

Initialized from seed data in `data/`. All mutations go through context actions so every consumer re-renders correctly.

### TravelerPage

Orchestrates the traveler experience. Owns local state:

```js
{
  origin: string,
  destination: string,
  analysisResult: AnalysisResult | null,
  isAnalyzing: boolean,
  geoError: string | null,
}
```

Calls `routeAnalyzer.analyze(origin, destination, hubs, routes, transportModes)` on form submit. Passes results down to `MapView` and `ResultsPanel`.

### LocationInputPanel

Props: `{ origin, destination, onOriginChange, onDestinationChange, onAnalyze, onGeoDetect, isAnalyzing, geoError }`

Renders the glassmorphism floating card. Handles its own field-level validation display. The "Analyze Route" button is disabled while `isAnalyzing` is true.

### MapView

Props: `{ hubs, selectedRoute: RouteOption | null, isAnalyzing }`

Wraps `react-leaflet`. Renders:
- `<TileLayer>` with OpenStreetMap
- `<Marker>` for origin and destination hubs
- `<Polyline>` for the selected route's hub waypoints
- `<LoadingOverlay>` while `isAnalyzing`

Center: `[9.0054, 38.7636]`, default zoom: `12`.

### ResultsPanel

Props: `{ result: AnalysisResult, onSelectMode, selectedMode, onRecommendationClick }`

Renders as a slide-up bottom sheet on mobile (`< 768px`) or an inline panel on desktop. Contains:
- Hub path string
- `<TransportCard>` for each mode (taxi, bus, walk)
- "Why this route" explanation block
- `<RecommendationCard>` × 3

### TransportCard

Props: `{ mode: TransportModeResult, isBest: boolean, isSelected: boolean, onSelect }`

Highlights with `#10B981` border/badge when `isBest`. Applies selected state ring when `isSelected`.

### AdminLayout

Renders `<Sidebar>` on the left and `<Outlet>` on the right. On viewports `< 1024px`, sidebar collapses to a drawer toggled by a hamburger button.

### HubModal

Props: `{ hub: Hub | null, onSave, onClose }`

`hub === null` → Add mode. `hub !== null` → Edit mode (pre-populated). Contains an embedded mini `<MapContainer>` for coordinate picking via click.

---

## Data Models

### Hub

```ts
interface Hub {
  id: string;           // uuid or slug, e.g. "kality"
  name: string;         // Display name, e.g. "Kality"
  lat: number;          // Latitude, e.g. 8.9806
  lng: number;          // Longitude, e.g. 38.7578
}
```

### TransportMode

```ts
interface TransportMode {
  id: "taxi" | "bus" | "walk";
  label: string;        // "Taxi" | "Bus" | "Walk"
  pricePerKm: number;   // ETB per km, e.g. 15
  speedKmh: number;     // Average speed, e.g. 40
  description: string;  // "Fast, expensive" etc.
  icon: string;         // Emoji or icon key
}
```

### Route

```ts
interface Route {
  id: string;
  name: string;         // e.g. "Kality–Megenagna Express"
  hubSequence: string[]; // Ordered array of Hub ids
  distanceKm: number;   // Computed from hub coordinates via Haversine
}
```

### AnalysisResult

```ts
interface TransportModeResult {
  mode: TransportMode;
  route: Route;
  distanceKm: number;
  durationMin: number;  // distanceKm / speedKmh * 60
  price: number;        // distanceKm * pricePerKm
  score: number;        // Composite score (lower = better)
  isBest: boolean;
}

interface AnalysisResult {
  origin: Hub;
  destination: Hub;
  options: TransportModeResult[];  // One per transport mode
  bestOption: TransportModeResult;
  explanation: string;
  recommendations: Recommendation[];
}
```

### Recommendation

```ts
interface Recommendation {
  name: string;
  distanceKm: number;
  category: "Restaurant" | "Park" | "Museum" | "Market" | "Hotel";
  icon: string;         // Emoji
}
```

---

## Route Analysis Algorithm

The `routeAnalyzer.analyze()` function is a pure function (no side effects, no async I/O beyond the simulated delay wrapper).

### Steps

1. **Hub resolution** — Look up origin and destination Hub objects by name (case-insensitive). If either is not found, throw a validation error.
2. **Route matching** — Find all Routes whose `hubSequence` contains both the origin hub id and the destination hub id (in order). If no direct route exists, fall back to any route containing both hubs.
3. **Distance calculation** — Sum Haversine distances between consecutive hubs in the matched route's `hubSequence`.
4. **Per-mode computation** — For each `TransportMode`, compute:
   - `durationMin = (distanceKm / speedKmh) * 60`
   - `price = distanceKm * pricePerKm`
   - `score = normalizedPrice * 0.5 + normalizedDuration * 0.5` (min-max normalized across modes)
5. **Best selection** — The mode with the lowest `score` is marked `isBest`.
6. **Explanation** — A human-readable string is generated: `"${bestMode.label} was chosen because it offers the best balance of cost (${price} ETB) and travel time (${duration} min)."`.

### Scoring Formula

```
score(mode) = 0.5 * (price - minPrice) / (maxPrice - minPrice)
            + 0.5 * (duration - minDuration) / (maxDuration - minDuration)
```

When all modes have identical price or duration (e.g., only one mode), the normalized component defaults to 0.

### Simulated Delay

The public `analyze()` wrapper returns a `Promise` that resolves after `Math.random() * 600 + 200` ms (200–800ms), satisfying the ≤ 1000ms requirement.

---

## Recommendation Engine

`recommendationEngine.getRecommendations(destinationHub, count = 3)` is a pure function that returns `count` `Recommendation` objects from a static lookup table keyed by hub id.

Each hub has a pre-defined list of nearby places. If a hub has fewer than `count` entries, the engine pads with generic Addis Ababa landmarks. The function always returns exactly `count` items.

---

## Leaflet Map Integration

- `react-leaflet` v4 is used. The `<MapContainer>` is rendered once and never unmounted to avoid re-initialization cost.
- Markers use the default Leaflet icon (with the known Vite asset path fix applied via `L.Icon.Default.mergeOptions`).
- The polyline color is `#2563EB` (primary) for the default route and updates reactively when `selectedRoute` prop changes.
- The `<LoadingOverlay>` is a `position: absolute` div with `backdrop-blur` and a CSS spinner, rendered inside the map's parent container (not inside `<MapContainer>` itself, to avoid Leaflet DOM conflicts).
- The admin `HubModal` uses a separate lightweight `<MapContainer>` instance for coordinate picking. Clicks on this map fire `map.on('click', e => setCoords(e.latlng))`.

---

## Admin Dashboard Pages

### DashboardHome

Reads `hubs.length`, `routes.length` from context. Computes `avgTravelTime` by averaging `durationMin` across all routes for the Bus mode (representative). Renders four `<StatCard>` components and a `<UsageChart>`.

### HubManager

Full CRUD table. "Add Hub" and "Edit" open `<HubModal>`. "Delete" opens `<ConfirmDialog>`. All mutations dispatch to `AppContext`.

### TransportManager

Three `<TransportConfigCard>` components (one per mode). Each card has inline editable inputs for `pricePerKm` and `speedKmh` with save/cancel buttons. Validation rejects values ≤ 0.

### RouteManager

Table + "Add Route" form. The form uses a multi-select hub picker (ordered drag-and-drop or sequential add). On submit, `distanceKm` is computed client-side via `geoUtils.totalDistance(hubSequence, hubs)`.

### Analytics

`<UsageChart>` renders a bar chart using static time-series data (simulated weekly usage counts). Implemented with a lightweight SVG bar chart component — no external chart library needed to keep the bundle lean.

---

## Design System Tokens

| Token | Value |
|---|---|
| Primary | `#2563EB` |
| Accent | `#10B981` |
| Background | `#0F172A` |
| Surface | `rgba(255,255,255,0.05)` |
| Border | `rgba(255,255,255,0.1)` |
| Text Primary | `#F8FAFC` |
| Text Secondary | `#94A3B8` |
| Error | `#EF4444` |
| Font | Inter, Poppins (fallback: system-ui) |

### Glassmorphism Card Pattern

```css
backdrop-filter: blur(12px);
background: rgba(255, 255, 255, 0.05);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 1rem;
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

Applied via a shared Tailwind utility class composition: `backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl`.

---

## Animation Strategy

| Interaction | Technique | Duration |
|---|---|---|
| Results panel slide-up | `translate-y-full → translate-y-0` CSS transition | 300ms |
| Card hover elevation | `shadow-md → shadow-xl` + `scale-[1.02]` | 150ms |
| Loading spinner | CSS `@keyframes spin` | continuous |
| Polyline update | React re-render (Leaflet handles DOM diff) | ~16ms |
| Page fade-in | `opacity-0 → opacity-100` on mount | 200ms |
| Button press | `active:scale-95` Tailwind class | 100ms |

All transitions use `transition-all ease-out` or `transition-transform ease-out` Tailwind classes. No external animation library is needed.

---

## Error Handling

| Scenario | Handling |
|---|---|
| Geolocation API denied/unavailable | Inline error in `LocationInputPanel`, no navigation |
| Empty origin or destination | Field-level validation error, form submission blocked |
| No route found between hubs | `AnalysisResult` with empty `options[]`, Results panel shows "No route found" message |
| Invalid hub coordinates in Admin | Field-level validation in `HubModal`, modal stays open |
| Non-positive transport values | Inline error in `TransportConfigCard`, save blocked |
| Route with < 2 hubs | Validation error in `RouteForm`, form stays open |

All errors are displayed inline (no toast/snackbar) to keep the UX calm and accessible.


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Form validation rejects empty fields

*For any* combination of origin and destination values where at least one is empty or whitespace-only, submitting the location input form SHALL display a validation error and SHALL NOT invoke the Route_Analyzer.

**Validates: Requirements 2.5**

---

### Property 2: Route analysis completes within time limit

*For any* valid origin and destination hub pair, the `routeAnalyzer.analyze()` promise SHALL resolve within 1000 milliseconds.

**Validates: Requirements 4.1**

---

### Property 3: All hub waypoints receive map markers

*For any* completed route analysis result, every hub in the selected route's `hubSequence` (including origin, destination, and all intermediate hubs) SHALL have a corresponding marker rendered on the map.

**Validates: Requirements 3.2, 3.3, 3.5**

---

### Property 4: Results panel displays complete information for every mode

*For any* analysis result, the Results_Panel SHALL render one card per transport mode, and each card SHALL contain the transport type label, price estimate, estimated time, and description. The hub path string and total distance SHALL also be present.

**Validates: Requirements 4.3, 4.4**

---

### Property 5: Best option is the mode with the lowest composite score

*For any* set of transport mode results computed by the Route_Analyzer, exactly one mode SHALL be marked `isBest`, and it SHALL be the mode with the lowest composite score (0.5 × normalized price + 0.5 × normalized duration). No other mode with a strictly lower score SHALL exist in the result set.

**Validates: Requirements 4.5**

---

### Property 6: Analysis result always includes a non-empty explanation

*For any* valid analysis result produced by the Route_Analyzer, the `explanation` field SHALL be a non-empty string that references the best mode's label, price, and duration.

**Validates: Requirements 4.6**

---

### Property 7: Recommendation engine always returns exactly 3 items

*For any* hub in the system passed to `recommendationEngine.getRecommendations()`, the function SHALL return an array of exactly 3 `Recommendation` objects, each with a non-empty `name`, a non-negative `distanceKm`, a valid `category`, and a non-empty `icon`.

**Validates: Requirements 5.1, 5.2**

---

### Property 8: Loading state is cleared after analysis completes

*For any* valid analysis invocation, once the `analyze()` promise resolves (success or error), the `isAnalyzing` state SHALL be `false` and the "Analyze Route" button SHALL be re-enabled.

**Validates: Requirements 6.2, 6.3**

---

### Property 9: Dashboard stat cards reflect current hub and route counts

*For any* application state containing N hubs and M routes, the DashboardHome stat cards SHALL display N as the "Total Hubs" value and M as the "Total Routes" value.

**Validates: Requirements 9.3**

---

### Property 10: Hub mutations round-trip through application state

*For any* valid hub data object, adding it to application state via `addHub()` SHALL make it retrievable from the `hubs` array with all fields preserved. Editing it via `updateHub()` SHALL update only the specified hub while leaving all other hubs unchanged.

**Validates: Requirements 10.3, 10.6**

---

### Property 11: Hub form validation rejects invalid inputs

*For any* hub form submission where the name is empty or the latitude/longitude values are outside valid geographic ranges (lat: −90 to 90, lng: −180 to 180), the Hub_Manager SHALL display a field-level validation error and SHALL NOT add or update the hub in application state.

**Validates: Requirements 10.4**

---

### Property 12: Transport mode updates propagate to route analysis

*For any* valid `pricePerKm` and `speedKmh` values saved via `updateTransportMode()`, all subsequent calls to `routeAnalyzer.analyze()` SHALL use the updated values when computing price and duration for that mode.

**Validates: Requirements 11.2**

---

### Property 13: Transport mode validation rejects non-positive values

*For any* transport mode update where `pricePerKm` ≤ 0 or `speedKmh` ≤ 0, the Transport_Manager SHALL display a validation error and SHALL NOT update the transport mode in application state.

**Validates: Requirements 11.3**

---

### Property 14: Route distance equals sum of Haversine segment distances

*For any* route with a valid `hubSequence` of length ≥ 2, the `distanceKm` stored in application state SHALL equal the sum of Haversine distances between each consecutive pair of hubs in the sequence, within a tolerance of 0.01 km.

**Validates: Requirements 12.3**

---

### Property 15: Route form validation requires at least two hubs

*For any* route form submission where fewer than two hubs are selected, the Route_Manager SHALL display a validation error and SHALL NOT add the route to application state.

**Validates: Requirements 12.4**

---

## Testing Strategy

### Dual Testing Approach

Both unit/example tests and property-based tests are used. Unit tests cover specific interactions, rendering checks, and integration points. Property tests verify universal algorithmic invariants across many generated inputs.

### Property-Based Testing Library

**[fast-check](https://github.com/dubzzz/fast-check)** is used for all property-based tests. It is the standard PBT library for JavaScript/TypeScript, supports React Testing Library integration, and runs in Vitest.

Install: `npm install --save-dev fast-check`

Each property test is configured to run a minimum of **100 iterations** (`numRuns: 100`).

### Tag Format

Each property test is tagged with a comment:

```js
// Feature: smart-travel-addis-ababa, Property N: <property_text>
```

### Unit / Example Tests

Focus areas:
- `LocationInputPanel` renders correctly and calls handlers
- `MapView` initializes with correct center/zoom
- `ResultsPanel` renders slide-up animation class on mount
- `TransportCard` highlights correctly when `isBest=true`
- `HubModal` pre-populates fields in edit mode
- Admin sidebar navigation renders active state
- `ConfirmDialog` blocks deletion until confirmed
- Geolocation success and error paths in `TravelerPage`

### Property Tests

| Property | Arbitraries | Assertion |
|---|---|---|
| P1: Form validation | `fc.string()` pairs with at least one empty | No analyzer call, error visible |
| P2: Analysis time limit | `fc.constantFrom(...hubPairs)` | Promise resolves < 1000ms |
| P3: Hub waypoint markers | `fc.constantFrom(...validRoutes)` | Marker count = hubSequence.length |
| P4: Results panel completeness | `fc.record(...)` for AnalysisResult | All fields present in DOM |
| P5: Best option selection | `fc.array(fc.record({price, duration}))` | isBest on min-score item only |
| P6: Explanation non-empty | `fc.constantFrom(...validHubPairs)` | explanation.length > 0 |
| P7: Recommendation count | `fc.constantFrom(...hubs)` | result.length === 3, all fields valid |
| P8: Loading state cleared | `fc.constantFrom(...validHubPairs)` | isAnalyzing=false after resolve |
| P9: Stat card counts | `fc.array(hubArb)`, `fc.array(routeArb)` | Displayed N and M match array lengths |
| P10: Hub mutation round-trip | `fc.record({name, lat, lng})` | Hub retrievable with all fields intact |
| P11: Hub validation | Invalid hub records | Error shown, state unchanged |
| P12: Transport mode propagation | `fc.float({min:0.01})` pairs | Analyzer uses updated values |
| P13: Transport validation | `fc.float({max:0})` values | Error shown, state unchanged |
| P14: Route distance | `fc.array(hubArb, {minLength:2})` | distanceKm = Σ Haversine(consecutive) |
| P15: Route hub count | `fc.array(hubArb, {maxLength:1})` | Error shown, state unchanged |

### Test File Structure

```
Client/src/
└── __tests__/
    ├── lib/
    │   ├── routeAnalyzer.test.js      # P2, P5, P6, P12, P14
    │   ├── recommendationEngine.test.js # P7
    │   └── geoUtils.test.js           # Haversine unit tests
    ├── components/
    │   ├── LocationInputPanel.test.jsx # P1, unit tests
    │   ├── MapView.test.jsx            # P3, unit tests
    │   ├── ResultsPanel.test.jsx       # P4, unit tests
    │   ├── TransportCard.test.jsx      # P5 (rendering), unit tests
    │   └── RecommendationCard.test.jsx # P7 (rendering)
    ├── context/
    │   └── AppContext.test.jsx         # P8, P9, P10, P11, P13, P15
    └── pages/
        ├── TravelerPage.test.jsx       # Integration: geo, analysis flow
        └── admin/
            ├── DashboardHome.test.jsx  # P9
            ├── HubManager.test.jsx     # P10, P11
            ├── TransportManager.test.jsx # P12, P13
            └── RouteManager.test.jsx   # P14, P15
```

### Coverage Goals

- All 15 correctness properties covered by at least one property-based test
- All acceptance criteria covered by at least one test (unit or property)
- `lib/` modules: 100% branch coverage target (pure functions, easy to test)
- Components: render + interaction coverage for all user-facing behaviors
