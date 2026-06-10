# Recent Changes and Updates

This document details the latest changes, features, and bug fixes applied to the Novox Edtech Dashboard in the recent commits.

## 🚀 Features & Enhancements

### 1. Modernized Courses UI & Employee Update Fixes (`9dad5ad9`)
- **Courses UI**: Modernized the Courses user interface and added side borders for better aesthetics and structure.
- **Seeding**: Added seed script for prices (`seed_courses.js`).
- **Employee Controller**: Fixed an employee update relational bug in the backend controller.
- **Email Utility**: Added a new `sendEmail.js` utility in the backend.

### 2. Employee & Admin Refactoring & Structure Updates (`95f11b28`)
- **Guardian Details**: Updated employee guardian details and administration seeding.
- **Cleanup**: Removed old, redundant seed files.
- **Component Restructuring**: Massively reorganized frontend components by separating them into distinct modular features (`auth`, `employee`, `admin`, `marketing`, `student`).
- **API Client**: Created a unified API client (`apiClient.js`) and Auth API (`authApi.js`).
- **Styles**: Removed old generic CSS (`index.css` bloated parts) and migrated to feature-based organization.

### 3. Branding & Favicon (`40e344fb`)
- **Favicon**: Updated the site favicon to the official Novox favicon.

## 🐛 Bug Fixes

### 1. Logo & Sidepanel Aesthetics (`8a8ad196`)
- Fixed awkward styling and sizing issues for the Novox Edtech Calicut logo and the side panel components (`Sidebar`, `Login`, `Signup`).

### 2. Single Name Error (`ecab9f5c`)
- Addressed an issue in `EmployeesContent.jsx` where a single name was causing errors or displaying incorrectly.

### 3. White Page Routing Issue (`7cb367ad`)
- Fixed a major white page routing issue that occurred upon hosting. Updates were made to `App.jsx`, `main.jsx`, and `package-lock.json` to correct the Vite/React routing behavior in production.

### 4. Sidebar Responsiveness (`e3cd276b` & `e2dcfe46`)
- Fixed overall responsiveness of the Sidebar component for smaller screens.
- Added a proper haburger menu icon to toggle the sidebar on mobile and tablet views.

---
*Note: This log reflects the most recent series of commits on the current branch. For a full history, please refer to the `git log`.*
