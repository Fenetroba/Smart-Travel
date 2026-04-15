# Bugfix Requirements Document

## Introduction

This bugfix addresses the issue where Transport and Routes management features are not saving to the database. Users cannot create new transports or routes through the admin interface because the data is not persisting in the database. The root causes are:
1. Missing `/api/routes` endpoint on the server (only `/api/route` exists)
2. Transport updates only modify Redux state without making API calls to persist changes

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an admin user attempts to create a new route through the RouteManager interface THEN the system returns a 404 error because the frontend calls `/api/routes` but the server only has `/api/route` endpoint registered

1.2 WHEN an admin user attempts to fetch existing routes from the database THEN the system returns a 404 error because the frontend calls GET `/api/routes` but no such endpoint exists on the server

1.3 WHEN an admin user attempts to delete a route through the RouteManager interface THEN the system returns a 404 error because the frontend calls DELETE `/api/routes/:id` but no such endpoint exists on the server

1.4 WHEN an admin user updates transport mode configuration (price or speed) through the TransportConfigCard THEN the system only updates the Redux store state without making any API call to persist the change to the database

1.5 WHEN the application reloads after transport configuration changes THEN the system displays the original seed data values because changes were never persisted to the database

### Expected Behavior (Correct)

2.1 WHEN an admin user attempts to create a new route through the RouteManager interface THEN the system SHALL successfully save the route to the database via POST `/api/routes` and return the created route with its database ID

2.2 WHEN an admin user attempts to fetch existing routes from the database THEN the system SHALL successfully retrieve all routes via GET `/api/routes` and display them in the RouteManager interface

2.3 WHEN an admin user attempts to delete a route through the RouteManager interface THEN the system SHALL successfully delete the route from the database via DELETE `/api/routes/:id`

2.4 WHEN an admin user updates transport mode configuration (price or speed) through the TransportConfigCard THEN the system SHALL persist the change to the database via PUT `/api/transports/:id`

2.5 WHEN the application reloads after transport configuration changes THEN the system SHALL display the persisted values from the database instead of seed data

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a traveler user calculates a route via the traveler interface THEN the system SHALL CONTINUE TO use the existing POST `/api/route/calculate` endpoint for route calculations

3.2 WHEN an admin user views the transport management page THEN the system SHALL CONTINUE TO display all transport modes (taxi, bus, walk) with their current configuration

3.3 WHEN an unauthenticated user attempts to access admin endpoints THEN the system SHALL CONTINUE TO reject the request with a 401 Unauthorized error

3.4 WHEN the transport analysis endpoint is called THEN the system SHALL CONTINUE TO return transport options based on distance via GET `/api/transport/analyze`
