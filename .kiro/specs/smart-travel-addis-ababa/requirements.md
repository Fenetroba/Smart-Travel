# Requirements Document

## Introduction

Smart Travel Addis Ababa is a web application that helps travelers navigate Addis Ababa by comparing transport options (taxi, bus, walk), calculating optimal routes between hubs, and providing AI-powered destination recommendations. The app has two flows: a public Traveler UI (no login required) and a protected Admin Dashboard for managing hubs, transport modes, and routes. The frontend is built with React + Vite + Tailwind CSS + Leaflet, targeting a premium, map-centric, mobile-friendly experience.

---

## Glossary

- **App**: The Smart Travel Addis Ababa web application.
- **Traveler**: An end user who accesses the App without authentication to plan routes.
- **Admin**: An authenticated user who manages hubs, transport modes, and routes via the Admin Dashboard.
- **Hub**: A named geographic location in Addis Ababa (e.g., Kality, Megenagna, Sarbet) with associated coordinates.
- **Route**: A sequence of one or more Hubs connecting an origin to a destination.
- **Transport_Mode**: A method of travel (Taxi, Bus, or Walk) with associated price-per-km and speed settings.
- **Route_Analyzer**: The client-side module that computes route options given an origin, destination, and available Transport_Modes.
- **Map**: The interactive Leaflet map component rendered in the Traveler UI.
- **Results_Panel**: The bottom-sheet UI component that displays route analysis results to the Traveler.
- **Recommendation_Engine**: The client-side module that suggests next destinations based on the Traveler's current location.
- **Admin_Dashboard**: The protected multi-page UI for Admins to manage application data.
- **Hub_Manager**: The Admin Dashboard page for creating, editing, and deleting Hubs.
- **Transport_Manager**: The Admin Dashboard page for configuring Transport_Modes.
- **Route_Manager**: The Admin Dashboard page for managing Routes.
- **Analytics_View**: The Admin Dashboard page displaying system usage statistics.

---

## Requirements

### Requirement 1: Traveler Hero Section

**User Story:** As a Traveler, I want to see a clear, welcoming hero section when I open the App, so that I immediately understand the App's purpose and feel confident using it.

#### Acceptance Criteria

1. THE App SHALL display a hero section at the top of the Traveler UI containing the title "Find the Smartest Route in Addis Ababa" and the subtitle "Compare transport, cost, and time instantly".
2. THE App SHALL render the hero section with a visually distinct background using a gradient or subtle animated map effect.
3. THE App SHALL display the hero section on all viewport widths from 320px to 1920px without horizontal overflow.

---

### Requirement 2: Location Input Panel

**User Story:** As a Traveler, I want to enter my current location and destination in a prominent input panel, so that I can quickly initiate a route analysis.

#### Acceptance Criteria

1. THE App SHALL render a floating card with glassmorphism styling (blur background, soft shadow, rounded corners) containing a current-location input field, a destination input field, and an "Analyze Route" button.
2. WHEN the Traveler activates the auto-detect button (📍), THE App SHALL attempt to retrieve the Traveler's geographic coordinates using the browser Geolocation API and populate the current-location field with the nearest Hub name or coordinate string.
3. IF the browser Geolocation API returns an error, THEN THE App SHALL display an inline error message within the location input card without navigating away from the page.
4. WHEN the Traveler submits the form with both fields populated, THE App SHALL pass the origin and destination values to the Route_Analyzer.
5. IF the Traveler submits the form with one or both fields empty, THEN THE App SHALL display a validation error message adjacent to the empty field and prevent route analysis from starting.
6. THE App SHALL render the location input panel as a sticky element on mobile viewports (width < 768px) so that it remains accessible while scrolling.

---

### Requirement 3: Interactive Map

**User Story:** As a Traveler, I want to see my route visualized on an interactive map, so that I can understand the geographic path between my origin and destination.

#### Acceptance Criteria

1. THE Map SHALL render a full-width Leaflet map using OpenStreetMap tiles centered on Addis Ababa (coordinates 9.0054° N, 38.7636° E) at zoom level 12 on initial load.
2. WHEN a route analysis completes, THE Map SHALL place a marker at the origin Hub coordinates and a marker at the destination Hub coordinates.
3. WHEN a route analysis completes, THE Map SHALL draw a polyline connecting all Hub waypoints along the selected Route.
4. WHEN the Traveler selects a different Transport_Mode card in the Results_Panel, THE Map SHALL update the displayed polyline to reflect the waypoints of the newly selected route option.
5. THE Map SHALL support multi-stop routes by rendering intermediate Hub markers along the polyline.
6. THE Map SHALL be interactive: the Traveler SHALL be able to zoom and pan using standard touch and mouse gestures.
7. WHILE a route analysis is in progress, THE Map SHALL display an animated loading indicator overlaid on the map area.

---

### Requirement 4: Route Analysis and Results Panel

**User Story:** As a Traveler, I want to see a detailed breakdown of route options after analysis, so that I can choose the best transport method for my needs.

#### Acceptance Criteria

1. WHEN the Traveler clicks "Analyze Route", THE Route_Analyzer SHALL compute route options for Taxi, Bus, and Walk Transport_Modes and return results within a simulated delay of no more than 1000ms.
2. WHEN route analysis completes, THE App SHALL animate the Results_Panel into view from the bottom of the screen (slide-up transition).
3. THE Results_Panel SHALL display the step-by-step Hub path (e.g., "Kality → Megenagna → Sarbet"), total distance in kilometers, and estimated travel time for each Transport_Mode.
4. THE Results_Panel SHALL render one card per Transport_Mode showing: transport type label, price estimate, estimated time, and a brief description (e.g., "Fast, expensive" for Taxi).
5. THE Route_Analyzer SHALL mark the Transport_Mode with the lowest combined cost-and-time score as the "BEST OPTION" and THE Results_Panel SHALL highlight that card with the accent color (#10B981).
6. THE Results_Panel SHALL display a "Why this route was chosen" explanation section describing the scoring rationale for the recommended option.
7. THE Results_Panel SHALL display at least one alternative route option when multiple Hub paths exist between the origin and destination.
8. WHEN the Results_Panel is visible, THE App SHALL auto-scroll the viewport so the Results_Panel is fully visible.
9. WHEN the Traveler is on a mobile viewport (width < 768px), THE Results_Panel SHALL render as a bottom sheet with a drag handle, overlaying the Map rather than pushing page content down.

---

### Requirement 5: Next Destination Recommendations

**User Story:** As a Traveler, I want to see recommended nearby places after viewing my route, so that I can discover interesting destinations in Addis Ababa.

#### Acceptance Criteria

1. WHEN the Results_Panel is displayed, THE Recommendation_Engine SHALL generate exactly 3 place recommendations based on the destination Hub's location.
2. THE App SHALL render each recommendation as a card containing: place name, distance from destination (km), category label (e.g., Restaurant, Park, Museum), and a category icon.
3. WHEN the Traveler hovers over a recommendation card on a non-touch device, THE App SHALL apply a visual hover effect (elevation shadow increase or background color shift) within 150ms.
4. WHEN the Traveler clicks a recommendation card, THE App SHALL populate the destination input field with the selected place name and trigger a new route analysis from the current origin.

---

### Requirement 6: Animations and Loading States

**User Story:** As a Traveler, I want smooth visual feedback during interactions, so that the App feels fast and polished.

#### Acceptance Criteria

1. WHEN the App transitions between idle and results states, THE App SHALL apply fade and slide CSS transitions with a duration between 200ms and 400ms.
2. WHILE a route analysis is in progress, THE App SHALL display an animated "route building" loading indicator (e.g., animated dashes along the polyline or a spinner) and disable the "Analyze Route" button.
3. WHEN the route analysis completes, THE App SHALL remove the loading indicator and re-enable the "Analyze Route" button.
4. THE App SHALL apply hover transition effects to all interactive cards with a duration of no more than 200ms.

---

### Requirement 7: Mobile Responsiveness

**User Story:** As a Traveler using a mobile device, I want the App to be fully usable on small screens, so that I can plan routes on the go.

#### Acceptance Criteria

1. THE App SHALL render all Traveler UI components correctly on viewport widths from 320px to 767px without horizontal scrolling or overlapping elements.
2. WHEN the viewport width is less than 768px, THE App SHALL display the "Analyze Route" button as a full-width sticky element anchored to the bottom of the viewport.
3. WHEN the viewport width is less than 768px, THE App SHALL replace side panels with the bottom-sheet Results_Panel pattern.
4. THE App SHALL use touch-friendly tap targets with a minimum size of 44×44 CSS pixels for all interactive elements.

---

### Requirement 8: Admin Dashboard Layout

**User Story:** As an Admin, I want a clean dashboard layout with sidebar navigation, so that I can efficiently manage the App's data.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL render a persistent sidebar containing navigation links to: Dashboard, Manage Hubs, Manage Transport, Manage Routes, and Analytics.
2. WHEN the Admin clicks a sidebar navigation link, THE Admin_Dashboard SHALL render the corresponding page content in the main content area without a full page reload.
3. WHEN the viewport width is less than 1024px, THE Admin_Dashboard SHALL collapse the sidebar into a hamburger-menu-triggered drawer.
4. THE Admin_Dashboard SHALL display the currently active navigation item with a distinct visual indicator (e.g., highlighted background or left border accent).

---

### Requirement 9: Admin Dashboard Home

**User Story:** As an Admin, I want an overview of key system metrics on the dashboard home page, so that I can monitor the App's usage at a glance.

#### Acceptance Criteria

1. THE Admin_Dashboard home page SHALL display four summary stat cards: Total Routes, Total Hubs, Average Travel Time, and System Usage.
2. THE Analytics_View SHALL render a line or bar chart showing system usage over time using client-side chart data.
3. THE Admin_Dashboard home page SHALL update the stat card values to reflect the current count of Hubs and Routes stored in application state.

---

### Requirement 10: Hub Management

**User Story:** As an Admin, I want to create, edit, and delete Hubs, so that I can keep the list of locations accurate and up to date.

#### Acceptance Criteria

1. THE Hub_Manager SHALL display a table listing all Hubs with columns: Name, Latitude, Longitude, and Actions (Edit, Delete).
2. WHEN the Admin clicks "Add Hub", THE Hub_Manager SHALL display a modal form with fields for Hub name, latitude, and longitude, and a map picker that allows the Admin to click a point on the Map to populate the coordinate fields.
3. WHEN the Admin submits a valid Add Hub form, THE Hub_Manager SHALL add the new Hub to application state and close the modal.
4. IF the Admin submits the Add Hub form with an empty name or invalid coordinate values, THEN THE Hub_Manager SHALL display field-level validation error messages and keep the modal open.
5. WHEN the Admin clicks "Edit" on a Hub row, THE Hub_Manager SHALL open the modal pre-populated with that Hub's current values.
6. WHEN the Admin submits a valid Edit Hub form, THE Hub_Manager SHALL update the Hub in application state and close the modal.
7. WHEN the Admin clicks "Delete" on a Hub row, THE Hub_Manager SHALL display a confirmation dialog before removing the Hub from application state.

---

### Requirement 11: Transport Mode Management

**User Story:** As an Admin, I want to configure transport modes with price and speed settings, so that route cost and time estimates remain accurate.

#### Acceptance Criteria

1. THE Transport_Manager SHALL display configuration cards for Taxi, Bus, and Walk, each showing the current price-per-km and speed (km/h) values.
2. WHEN the Admin edits a price-per-km or speed value and saves, THE Transport_Manager SHALL update the Transport_Mode in application state and THE Route_Analyzer SHALL use the updated values for all subsequent route analyses.
3. IF the Admin enters a non-positive number for price-per-km or speed, THEN THE Transport_Manager SHALL display a validation error and reject the update.

---

### Requirement 12: Route Management

**User Story:** As an Admin, I want to define and manage routes between Hubs, so that the Route_Analyzer has accurate path data.

#### Acceptance Criteria

1. THE Route_Manager SHALL display a table listing all Routes with columns: Route Name, Hub Sequence, Distance (km), and Actions (Edit, Delete).
2. WHEN the Admin clicks "Add Route", THE Route_Manager SHALL display a form allowing the Admin to select an ordered sequence of Hubs from the existing Hub list and provide a route name.
3. WHEN the Admin submits a valid Add Route form, THE Route_Manager SHALL compute the total distance from Hub coordinates and add the Route to application state.
4. IF the Admin submits the Add Route form with fewer than two Hubs selected, THEN THE Route_Manager SHALL display a validation error and keep the form open.

---

### Requirement 13: Design System Compliance

**User Story:** As a developer, I want all UI components to follow the defined design system, so that the App has a consistent, premium visual identity.

#### Acceptance Criteria

1. THE App SHALL apply Tailwind CSS utility classes for all styling with the primary color #2563EB, accent color #10B981, and dark background #0F172A.
2. THE App SHALL use the Inter or Poppins font family loaded via a web font import for all text content.
3. THE App SHALL render glassmorphism cards using a backdrop-filter blur of at least 8px, a semi-transparent white or dark background, and a 1px border with low-opacity white.
4. THE App SHALL support a dark mode variant where background surfaces use #0F172A and text uses white or light-gray Tailwind classes.
