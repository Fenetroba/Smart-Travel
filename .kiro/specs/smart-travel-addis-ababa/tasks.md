# Implementation Plan: Smart Travel Addis Ababa

## Overview

Incremental build of the React + Vite + Tailwind CSS SPA. Each task wires new code into the running app before moving on. The order is: project scaffolding → core data/lib → traveler UI → admin dashboard → testing.

## Tasks

- [x] 1. Scaffold project structure and install dependencies
  - Add `react-router-dom` v6, `react-leaflet`, `leaflet`, `fast-check`, and `vitest` + `@testing-library/react` + `@testing-library/jest-dom` to `Client/package.json`
  - Create all empty directory stubs: `src/context/`, `src/data/`, `src/lib/`, `src/pages/admin/`, `src/components/traveler/`, `src/components/admin/`, `src/components/shared/`, `src/__tests__/lib/`, `src/__tests__/components/`, `src/__tests__/context/`, `src/__tests__/pages/admin/`
  - Add Vitest config to `vite.config.js` (jsdom environment, setupFiles for jest-dom)
  - Apply Leaflet default-icon asset fix in a `src/lib/leafletIconFix.js` module
  - Wire `<BrowserRouter>` into `src/main.jsx`
  - _Requirements: 13.1_

- [x] 2. Implement seed data and global AppContext
  - [x] 2.1 Create seed data modules
    - Write `src/data/hubs.js` with at least 8 Addis Ababa hubs (id, name, lat, lng)
    - Write `src/data/routes.js` with at least 4 routes referencing hub ids
    - Write `src/data/transportModes.js` with Taxi, Bus, Walk configs (pricePerKm, speedKmh, description, icon)
    - _Requirements: 10.1, 11.1, 12.1_

  - [x] 2.2 Implement AppContext
    - Create `src/context/AppContext.jsx` with `useState` for hubs, routes, transportModes initialized from seed data
    - Expose `addHub`, `updateHub`, `deleteHub`, `addRoute`, `updateRoute`, `deleteRoute`, `updateTransportMode` actions
    - Wrap app in `<AppContext.Provider>` inside `src/main.jsx`
    - _Requirements: 10.3, 10.6, 11.2, 12.3_

  - [ ]* 2.3 Write property tests for AppContext hub mutations
    - **Property 10: Hub mutation round-trip**
    - **Validates: Requirements 10.3, 10.6**

  - [ ]* 2.4 Write property tests for AppContext transport validation
    - **Property 13: Transport mode validation rejects non-positive values**
    - **Validates: Requirements 11.3**

  - [ ]* 2.5 Write property tests for AppContext route validation
    - **Property 15: Route form validation requires at least two hubs**
    - **Validates: Requirements 12.4**

- [x] 3. Implement geo utilities and route analyzer
  - [x] 3.1 Implement `src/lib/geoUtils.js`
    - Write `haversineKm(lat1, lng1, lat2, lng2)` pure function
    - Write `totalDistance(hubSequence, hubs)` that sums consecutive Haversine segments
    - Write `nearestHub(lat, lng, hubs)` for geolocation snap
    - _Requirements: 2.2, 12.3_

  - [ ]* 3.2 Write unit tests for geoUtils
    - Test known coordinate pairs against expected distances
    - Test `totalDistance` with 2-hub and 3-hub sequences
    - _Requirements: 12.3_

  - [x] 3.3 Implement `src/lib/routeAnalyzer.js`
    - Write `analyze(origin, destination, hubs, routes, transportModes)` pure core function
    - Implement hub resolution (case-insensitive name lookup), route matching, per-mode computation, min-max scoring, best selection, and explanation string generation
    - Export async `analyzeWithDelay()` wrapper that resolves after 200–800ms
    - _Requirements: 4.1, 4.5, 4.6_

  - [ ]* 3.4 Write property test for analysis time limit
    - **Property 2: Route analysis completes within time limit**
    - **Validates: Requirements 4.1**

  - [ ]* 3.5 Write property test for best option selection
    - **Property 5: Best option is the mode with the lowest composite score**
    - **Validates: Requirements 4.5**

  - [ ]* 3.6 Write property test for explanation non-empty
    - **Property 6: Analysis result always includes a non-empty explanation**
    - **Validates: Requirements 4.6**

  - [ ]* 3.7 Write property test for route distance accuracy
    - **Property 14: Route distance equals sum of Haversine segment distances**
    - **Validates: Requirements 12.3**

  - [ ]* 3.8 Write property test for transport mode propagation
    - **Property 12: Transport mode updates propagate to route analysis**
    - **Validates: Requirements 11.2**

- [x] 4. Implement recommendation engine
  - [x] 4.1 Create `src/lib/recommendationEngine.js`
    - Write static lookup table of nearby places keyed by hub id (at least 4 places per hub)
    - Write `getRecommendations(destinationHub, count = 3)` that returns exactly `count` items, padding with generic landmarks if needed
    - _Requirements: 5.1, 5.2_

  - [ ]* 4.2 Write property test for recommendation count and shape
    - **Property 7: Recommendation engine always returns exactly 3 items**
    - **Validates: Requirements 5.1, 5.2**

- [ ] 5. Checkpoint — Ensure all lib tests pass
  - Run `vitest --run` in `Client/`. All lib and context tests must be green before proceeding.

- [x] 6. Implement shared UI components and design system
  - [x] 6.1 Apply global design tokens
    - Add Inter/Poppins font import to `src/index.css`
    - Define Tailwind CSS custom color tokens (primary `#2563EB`, accent `#10B981`, background `#0F172A`) in `index.css` or `tailwind.config`
    - _Requirements: 13.1, 13.2_

  - [x] 6.2 Implement shared components
    - Create `src/components/shared/Modal.jsx` — accessible overlay with backdrop
    - Create `src/components/shared/ConfirmDialog.jsx` — modal with confirm/cancel buttons
    - Create `src/components/shared/LoadingOverlay.jsx` — absolute-positioned spinner with backdrop-blur
    - Create `src/components/shared/ValidationError.jsx` — inline error message component
    - _Requirements: 6.1, 10.7, 13.3_

- [x] 7. Implement Traveler UI components
  - [x] 7.1 Implement `HeroSection.jsx`
    - Render title "Find the Smartest Route in Addis Ababa" and subtitle
    - Apply gradient or animated map background
    - Ensure no horizontal overflow at 320px–1920px
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 7.2 Implement `LocationInputPanel.jsx`
    - Render glassmorphism floating card with origin input, destination input, 📍 auto-detect button, and "Analyze Route" button
    - Implement field-level validation (empty field error display, form submission blocked)
    - Wire geolocation: call `navigator.geolocation.getCurrentPosition`, snap to nearest hub via `geoUtils.nearestHub`, display inline error on failure
    - Disable "Analyze Route" button when `isAnalyzing` is true
    - Apply sticky positioning on mobile (< 768px)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 7.3 Write property test for form validation
    - **Property 1: Form validation rejects empty fields**
    - **Validates: Requirements 2.5**

  - [x] 7.4 Implement `MapView.jsx`
    - Wrap `react-leaflet` `<MapContainer>` centered on `[9.0054, 38.7636]` zoom 12
    - Apply Leaflet icon fix from `leafletIconFix.js`
    - Render `<Marker>` for origin and destination hubs when `selectedRoute` is set
    - Render intermediate hub markers for multi-stop routes
    - Render `<Polyline>` in `#2563EB` connecting all hub waypoints
    - Update polyline reactively when `selectedRoute` prop changes
    - Render `<LoadingOverlay>` inside map's parent container while `isAnalyzing`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 7.5 Write property test for hub waypoint markers
    - **Property 3: All hub waypoints receive map markers**
    - **Validates: Requirements 3.2, 3.3, 3.5**

  - [x] 7.6 Implement `TransportCard.jsx`
    - Render transport type label, price estimate, estimated time, description
    - Apply `#10B981` border and "BEST OPTION" badge when `isBest` is true
    - Apply selected-state ring when `isSelected` is true
    - Apply hover elevation effect within 150ms
    - _Requirements: 4.4, 4.5, 6.4_

  - [x] 7.7 Implement `RecommendationCard.jsx`
    - Render place name, distance from destination, category label, category icon
    - Apply hover effect (shadow increase or background shift) within 150ms
    - On click, call `onRecommendationClick(place.name)` to populate destination and trigger re-analysis
    - _Requirements: 5.2, 5.3, 5.4_

  - [x] 7.8 Implement `ResultsPanel.jsx`
    - Render hub path string (e.g., "Kality → Megenagna → Sarbet"), total distance, and one `<TransportCard>` per mode
    - Render "Why this route was chosen" explanation block
    - Render at least one alternative route option when multiple paths exist
    - Render 3 `<RecommendationCard>` components from `analysisResult.recommendations`
    - Apply slide-up CSS transition (300ms) on mount; auto-scroll panel into view
    - On mobile (< 768px) render as bottom sheet with drag handle overlaying the map
    - _Requirements: 4.2, 4.3, 4.4, 4.6, 4.7, 4.8, 4.9_

  - [ ]* 7.9 Write property test for results panel completeness
    - **Property 4: Results panel displays complete information for every mode**
    - **Validates: Requirements 4.3, 4.4**

- [x] 8. Implement TravelerPage and wire traveler flow
  - Create `src/pages/TravelerPage.jsx` owning local state: `origin`, `destination`, `analysisResult`, `isAnalyzing`, `geoError`
  - On "Analyze Route" submit: set `isAnalyzing = true`, call `analyzeWithDelay()`, set result, set `isAnalyzing = false`
  - Pass state and handlers down to `<HeroSection>`, `<LocationInputPanel>`, `<MapView>`, `<ResultsPanel>`
  - Handle recommendation card click: update destination and re-trigger analysis
  - Update `src/App.jsx` to use React Router routes: `/` → `TravelerPage`, `/admin/*` → `AdminLayout`
  - _Requirements: 2.4, 4.1, 4.2, 6.2, 6.3_

  - [ ]* 8.1 Write property test for loading state cleared after analysis
    - **Property 8: Loading state is cleared after analysis completes**
    - **Validates: Requirements 6.2, 6.3**

- [ ] 9. Checkpoint — Verify traveler UI end-to-end
  - Run `vitest --run` in `Client/`. All traveler component and page tests must pass.

- [x] 10. Implement Admin Dashboard layout and navigation
  - [x] 10.1 Implement `src/components/admin/Sidebar.jsx`
    - Render navigation links: Dashboard, Manage Hubs, Manage Transport, Manage Routes, Analytics
    - Highlight active link with left-border accent or background
    - On viewports < 1024px, render as a drawer toggled by a hamburger button
    - _Requirements: 8.1, 8.3, 8.4_

  - [x] 10.2 Implement `src/pages/admin/AdminLayout.jsx`
    - Render `<Sidebar>` + `<Outlet>` layout
    - Implement simple client-side PIN check (hardcoded PIN, stored in `sessionStorage`); redirect to `/` if not authenticated
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 11. Implement Admin Dashboard pages
  - [x] 11.1 Implement `DashboardHome.jsx`
    - Read `hubs.length` and `routes.length` from AppContext
    - Compute `avgTravelTime` from Bus mode across all routes
    - Render four `<StatCard>` components: Total Routes, Total Hubs, Average Travel Time, System Usage
    - _Requirements: 9.1, 9.3_

  - [ ]* 11.2 Write property test for dashboard stat card counts
    - **Property 9: Dashboard stat cards reflect current hub and route counts**
    - **Validates: Requirements 9.3**

  - [x] 11.3 Implement `Analytics.jsx` with `UsageChart.jsx`
    - Create `src/components/admin/UsageChart.jsx` as a lightweight SVG bar chart using static weekly usage data
    - Render chart inside `Analytics.jsx`
    - _Requirements: 9.2_

  - [x] 11.4 Implement `HubManager.jsx` and `HubModal.jsx`
    - Render `<HubTable>` listing all hubs with Name, Latitude, Longitude, and Actions columns
    - "Add Hub" opens `<HubModal>` in add mode; "Edit" opens it pre-populated
    - `<HubModal>` contains name, lat, lng fields plus an embedded mini `<MapContainer>` for coordinate picking via click
    - Validate: name non-empty, lat in [−90, 90], lng in [−180, 180]; show field-level errors, keep modal open on failure
    - On valid submit: dispatch `addHub` or `updateHub` to AppContext and close modal
    - "Delete" opens `<ConfirmDialog>`; on confirm dispatch `deleteHub`
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 11.5 Write property test for hub form validation
    - **Property 11: Hub form validation rejects invalid inputs**
    - **Validates: Requirements 10.4**

  - [x] 11.6 Implement `TransportManager.jsx` and `TransportConfigCard.jsx`
    - Render one `<TransportConfigCard>` per mode showing current pricePerKm and speedKmh
    - Inline editable inputs with save/cancel; validate values > 0, show inline error on failure
    - On valid save: dispatch `updateTransportMode` to AppContext
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 11.7 Implement `RouteManager.jsx` and `RouteForm.jsx`
    - Render `<RouteTable>` listing all routes with Route Name, Hub Sequence, Distance (km), Actions
    - "Add Route" opens `<RouteForm>` with ordered hub multi-select (sequential add)
    - Validate: at least 2 hubs selected; show error and keep form open on failure
    - On valid submit: compute `distanceKm` via `geoUtils.totalDistance`, dispatch `addRoute`
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 11.8 Write property test for route distance calculation
    - **Property 14: Route distance equals sum of Haversine segment distances**
    - **Validates: Requirements 12.3**

- [x] 12. Implement mobile responsiveness
  - Audit all Traveler UI components for 320px–767px viewports: no horizontal scroll, no overlapping elements
  - Ensure "Analyze Route" button is full-width sticky at bottom on mobile
  - Ensure all interactive elements have minimum 44×44px tap targets
  - Ensure Admin sidebar collapses to drawer on < 1024px
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 8.3_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Run `vitest --run` in `Client/`. All tests (unit, property) must be green.
  - Verify no TypeScript/ESLint errors via `npm run lint` in `Client/`.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` with `numRuns: 100` minimum
- All property tests are tagged: `// Feature: smart-travel-addis-ababa, Property N: <text>`
- The admin PIN check is client-side only — suitable for this spec's scope
