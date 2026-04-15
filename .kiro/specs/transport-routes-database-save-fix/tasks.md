# Implementation Plan

## Phase 1: Bug Condition Exploration Tests

- [ ] 1. Write bug condition exploration test for routes API
  - **Property 1: Bug Condition** - Routes API 404 Errors
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Test concrete failing cases: GET/POST/DELETE to `/api/routes`
  - Test that GET `/api/routes` returns 404 (endpoint doesn't exist on server)
  - Test that POST `/api/routes` with valid route data returns 404
  - Test that DELETE `/api/routes/:id` returns 404
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL with 404 errors (this proves the bug exists)
  - Document counterexamples found (e.g., "GET /api/routes returns 404 instead of 200")
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2. Write bug condition exploration test for transport persistence
  - **Property 1: Bug Condition** - Transport Redux-Only Updates
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Demonstrate that transport updates don't persist to database
  - Test that `updateTransportMode` action only updates Redux state
  - Test that no API call is made when updating transport configuration
  - Test that after page reload, transport values revert to seed data
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (transport changes don't persist)
  - Document counterexamples found (e.g., "Taxi price change from 15 to 20 reverts to 15 after reload")
  - _Requirements: 1.4, 1.5_

## Phase 2: Preservation Property Tests

- [ ] 3. Write preservation property tests for route calculation endpoint
  - **Property 2: Preservation** - Route Calculation Endpoint
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: POST `/api/route/calculate` with start/destination returns route options on unfixed code
  - Write property-based test: for all valid start/destination pairs, route calculation returns same response
  - Verify test passes on UNFIXED code
  - This ensures the existing traveler route calculation feature remains unchanged
  - _Requirements: 3.1_

- [ ] 4. Write preservation property tests for transport analysis endpoint
  - **Property 2: Preservation** - Transport Analysis Endpoint
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: GET `/api/transport/analyze?distance=X` returns transport options on unfixed code
  - Write property-based test: for all valid distance values, transport analysis returns same response
  - Verify test passes on UNFIXED code
  - This ensures the existing transport analysis feature remains unchanged
  - _Requirements: 3.4_

- [ ] 5. Write preservation property tests for authentication
  - **Property 2: Preservation** - Authentication Protection
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: Admin endpoints return 401 without valid token on unfixed code
  - Write property-based test: for all admin endpoints without auth token, expect 401 response
  - Verify test passes on UNFIXED code
  - This ensures authentication protection remains intact
  - _Requirements: 3.3_

## Phase 3: Server-Side Implementation

- [ ] 6. Create Route model
  - [ ] 6.1 Create `Server/models/Route.js` with schema definition
    - Define schema with: name (String, required), hubSequence ([String], min 2), distanceKm (Number, required, min 0.1), estimatedTime (Number, optional)
    - Add timestamps
    - Add index on name field for efficient queries
    - _Bug_Condition: isBugCondition(input) where input.action IN ['createRoute', 'fetchRoutes', 'deleteRoute'] AND serverEndpointExists('/api/route') AND NOT serverEndpointExists('/api/routes')_
    - _Expected_Behavior: Route data persisted to database with MongoDB ObjectId_
    - _Preservation: RouteHistory model remains unchanged_
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 7. Create routes controller with CRUD operations
  - [ ] 7.1 Create `Server/controllers/routes.controller.js`
    - Implement `getAll` - GET /api/routes - fetch all routes sorted by createdAt
    - Implement `getOne` - GET /api/routes/:id - fetch single route by ID
    - Implement `create` - POST /api/routes - create new route with validation
    - Implement `update` - PUT /api/routes/:id - update existing route
    - Implement `remove` - DELETE /api/routes/:id - delete route
    - All methods return consistent JSON response format: `{ success: true, data: ... }`
    - _Bug_Condition: isBugCondition(input) where input.endpoint == '/api/routes' AND NOT serverEndpointExists('/api/routes')_
    - _Expected_Behavior: CRUD operations return appropriate responses with database IDs_
    - _Preservation: Existing route.controller.js for /api/route/calculate remains unchanged_
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 8. Create routes routes file with validation
  - [ ] 8.1 Create `Server/routes/routes.routes.js`
    - Import express, express-validator, controller, validate middleware
    - Define validation rules: name (required), hubSequence (array, min 2), distanceKm (positive number)
    - Register routes: GET /, GET /:id, POST /, PUT /:id, DELETE /:id
    - Apply validation middleware to POST and PUT routes
    - _Bug_Condition: isBugCondition(input) where input.action IN ['createRoute', 'fetchRoutes', 'deleteRoute']_
    - _Expected_Behavior: Validation errors return 400 with descriptive messages_
    - _Preservation: Existing route.routes.js remains unchanged_
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 9. Register /api/routes endpoint in app.js
  - [ ] 9.1 Update `Server/app.js` to register new routes endpoint
    - Import routesRoutes from './routes/routes.routes'
    - Add `app.use('/api/routes', protect, routesRoutes)` with other admin-protected endpoints
    - Ensure it's placed with other protected routes (transports, hubs, places)
    - _Bug_Condition: isBugCondition(input) where NOT serverEndpointExists('/api/routes')_
    - _Expected_Behavior: /api/routes endpoint accessible with authentication_
    - _Preservation: /api/route endpoint remains registered for route calculation_
    - _Requirements: 2.1, 2.2, 2.3_

## Phase 4: Client-Side Implementation

- [ ] 10. Add transport persistence thunks to transportSlice
  - [ ] 10.1 Update `Client/src/store/slices/transportSlice.js`
    - Add `fetchTransports` thunk to fetch transports from API on mount
    - Add `updateTransportConfig` thunk to persist updates via PUT /api/transports/:id
    - Add loading/error state management (loading, error fields in state)
    - Change initial state to empty array (fetch from API instead of seed data)
    - Map server field `speedKmPerHour` to client field `speedKmh` correctly
    - Add auth token helper to get token from sessionStorage
    - _Bug_Condition: isBugCondition(input) where input.action == 'updateTransport' AND input.apiCalled == false_
    - _Expected_Behavior: Transport updates persist to database via API call_
    - _Preservation: Existing transport analysis endpoint behavior unchanged_
    - _Requirements: 2.4, 2.5_

- [ ] 11. Update useTransport hook
  - [ ] 11.1 Update `Client/src/store/hooks/useTransport.js`
    - Import and expose `fetchTransports` thunk
    - Import and expose `updateTransportConfig` thunk (renamed from sync action)
    - Export loading and error state from slice
    - _Bug_Condition: isBugCondition(input) where input.persisted == false_
    - _Expected_Behavior: Hook provides async fetch and update functions_
    - _Preservation: Hook interface remains compatible with existing usage_
    - _Requirements: 2.4, 2.5_

- [ ] 12. Fetch transports on mount in TransportManager
  - [ ] 12.1 Update `Client/src/pages/admin/TransportManager.jsx`
    - Add useEffect to call `fetchTransports()` on component mount
    - Import useEffect from React
    - Destructure fetchTransports from useTransport hook
    - _Bug_Condition: isBugCondition(input) where input.reduxUpdated == true AND input.apiCalled == false_
    - _Expected_Behavior: Transports fetched from database on page load_
    - _Preservation: Component rendering logic unchanged_
    - _Requirements: 2.5_

- [ ] 13. Fix missing auth header in fetchRoutes
  - [ ] 13.1 Update `Client/src/store/slices/routesSlice.js`
    - Add Authorization header to fetchRoutes thunk
    - Use same auth token helper pattern as transportSlice
    - _Bug_Condition: isBugCondition(input) where input.action == 'fetchRoutes' AND auth header missing_
    - _Expected_Behavior: Routes fetch succeeds with valid authentication_
    - _Preservation: Existing routesSlice thunk structure unchanged_
    - _Requirements: 2.2_

## Phase 5: Fix Verification Tests

- [ ] 14. Verify bug condition exploration tests now pass
  - **Property 1: Expected Behavior** - Routes API CRUD Operations
  - **IMPORTANT**: Re-run the SAME tests from tasks 1 and 2 - do NOT write new tests
  - The tests from tasks 1 and 2 encode the expected behavior
  - When these tests pass, it confirms the expected behavior is satisfied
  - Run bug condition exploration tests from steps 1 and 2
  - **EXPECTED OUTCOME**: Tests PASS (confirms bug is fixed)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 15. Verify preservation tests still pass
  - **Property 2: Preservation** - Existing Endpoints
  - **IMPORTANT**: Re-run the SAME tests from tasks 3, 4, and 5 - do NOT write new tests
  - Run preservation property tests from steps 3, 4, and 5
  - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
  - Confirm all tests still pass after fix (no regressions)
  - _Requirements: 3.1, 3.3, 3.4_

## Phase 6: Checkpoint

- [ ] 16. Checkpoint - Ensure all tests pass
  - Run full test suite to verify all tests pass
  - Verify route CRUD operations work end-to-end
  - Verify transport configuration persists after page reload
  - Verify route calculation endpoint still works for travelers
  - Verify transport analysis endpoint still works
  - Verify authentication protection is intact
  - Ask the user if any questions arise
