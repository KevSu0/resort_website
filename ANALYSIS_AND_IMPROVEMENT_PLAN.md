# Application Analysis and Improvement Plan

This document provides a detailed analysis of the current state of the application and outlines a Scrum-based plan for its improvement.

## 1. Current State Analysis

The application is in an early, incomplete stage of development. While the basic UI structure for a multi-property resort website is in place, the core functionality is either non-existent, broken, or relies on static, hardcoded data.

The application was initially **non-functional** due to a critical flaw in its data-fetching logic. The data layer has been refactored to get the application running in a local development environment using mock data, which allowed for this analysis.

### 1.1. Summary of Findings

*   **Data Layer:** Was fundamentally broken. Now refactored to support mock data for development.
*   **Public Site:** UI is partially built, but key components are missing data and functionality.
*   **Admin Section:** Almost entirely a static mockup. The login is non-functional, and the dashboard displays hardcoded data.
*   **Overall Status:** The application is **not in a usable state** and requires significant development work.

### 1.2. Detailed Bug Report

| ID  | Severity | Feature Area      | Bug / Issue Description                                                                              |
| --- | -------- | ----------------- | ---------------------------------------------------------------------------------------------------- |
| C-01| Critical | Admin Dashboard   | The entire dashboard is a static mockup. It uses hardcoded data and none of the buttons are functional. |
| C-02| Critical | Login             | Login is not implemented, making the admin section inaccessible without a workaround.                  |
| C-03| Critical | Property Cards    | Property cards are missing essential data like price, rating, and amenities.                         |
| C-04| Critical | Booking Form      | The booking form on the property page uses hardcoded data for price and guest numbers.               |
| C-05| Critical | Booking Submission| The booking form does not submit data to any backend; it only logs to the console.                   |
| M-01| Major    | Navigation        | The "Book Now" button on property cards leads to a 404 error page.                                   |
| M-02| Major    | Navigation        | Breadcrumbs on the property page are static and do not use the dynamic data available.               |

---

## 2. Scrum-Based Improvement Plan

This plan breaks down the required work into a prioritized backlog and a series of Sprints, each with a clear goal.

### 2.1. Product Backlog

This backlog contains user stories derived from the analysis. They are prioritized based on business value and dependency.

| ID   | Priority | User Story                                                                                             |
| ---- | -------- | ------------------------------------------------------------------------------------------------------ |
| US-01| High     | As a user, I want to see price and rating on a property card so I can evaluate properties at a glance.     |
| US-02| High     | As a user, I want to see accurate price and guest info on the booking form so I can make a real booking. |
| US-03| High     | As an admin, I want to see real data on my dashboard so I can monitor my business.                         |
| US-04| High     | As a user, I want to submit a booking and have it recorded by the system.                                |
| US-05| High     | As an admin, I want to log in to the application securely to access the admin panel.                     |
| US-06| Medium   | As an admin, I want to be able to add, view, and edit properties in the admin panel.                      |
| US-07| Medium   | As a user, I want the "Book Now" button to take me to a functional booking page.                           |
| US-08| Low      | As a user, I want the breadcrumb navigation to accurately reflect my position on the site.                 |
| US-09| Low      | As an admin, I want the "View All" and "Quick Action" buttons on the dashboard to be functional.           |


### 2.2. Sprint Plan

#### **Sprint 1: Core Functionality & Data Integrity**
*   **Sprint Goal:** Make the application minimally functional and data-driven. Address the most critical bugs to create a usable (though incomplete) user flow.

| User Story | Tasks                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **US-01**  | - Modify the `Property` type to include price, rating, etc. <br> - Update `mockData.ts` to provide this data. <br> - Update `PropertyCard.tsx` to display the new data. |
| **US-02**  | - Remove hardcoded values from the `BookingSidebar` component. <br> - Fetch and display dynamic price/guest info based on the property/stay type. |
| **US-03**  | - Remove hardcoded data from `AdminDashboard.tsx`. <br> - Implement data fetching to populate the dashboard with real (mock) data from the services. |
| **US-04**  | - Create a new `enquiries` collection in Firestore (and mock equivalent). <br> - Implement logic in the `BookingSidebar` to save a new enquiry document when submitted. |

#### **Sprint 2: Authentication & Admin Features**
*   **Sprint Goal:** Implement a working authentication system and build out the core property management features for administrators.

| User Story | Tasks                                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **US-05**  | - Implement Firebase Authentication for email/password login. <br> - Create `useAuth` hook for managing user state. <br> - Remove the auth bypass from the `adminLoader`. |
| **US-06**  | - Build the "Properties" page in the admin section to list all properties. <br> - Create a form for adding a new property. <br> - Create a form for editing an existing property. |
| **US-07**  | - Create a new `/properties/:slug/book` route and page. <br> - Link the "Book Now" button to this new page. |

#### **Sprint 3: User Experience & Polish**
*   **Sprint Goal:** Address the remaining bugs, improve usability, and flesh out the remaining parts of the application.

| User Story | Tasks                                                                                                                              |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **US-08**  | - Refactor the `PropertyPage` to use the dynamic breadcrumb data provided by its route loader.                                     |
| **US-09**  | - Link the "View All" buttons on the admin dashboard to the relevant pages (e.g., Bookings, Properties). <br> - Implement the "Quick Action" button functionality. |
| **TBD**    | - Analyze and implement the remaining admin pages (Cities, Enquiries, Offers, Users, Settings).                                    |
