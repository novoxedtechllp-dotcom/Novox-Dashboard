# Novox Frontend Dashboard

A comprehensive and modern management dashboard built for educational institutions and organizations. The application provides dedicated modules for managing students, courses, employees, payroll, recruitment, CRM leads, and work reports. 

## Features

- **Student Management:** Track student enrollments, academic progress, attendance, and documents.
- **Course Administration:** Create and manage courses, curriculums, and schedules.
- **Employee Portal:** Manage staff profiles, attendance, leaves, and payroll records.
- **Sales CRM:** Manage incoming leads and track sales pipelines across different stages.
- **Recruitment:** Manage job applicants and schedule interviews efficiently.
- **Work Reports:** Track employee daily/weekly work reports and project statuses.

## Tech Stack

The application is built using modern frontend technologies designed for performance and developer experience:

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **PDF Generation:** [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Linting:** [ESLint](https://eslint.org/)

## Application Architecture

The application has been recently refactored to follow a strictly enforced **Feature-Based Architecture**, organized around specific user roles/domains. This ensures a clean separation of concerns and high scalability.

### Feature-Based Layers
The codebase is structured under `src/features/` with four primary modules:
1. **admin**: Handles global platform configuration, payroll, recruitment, and high-level management.
2. **employee**: Handles employee portal features like CRM, blogs, SEO, daily plans, and leaves.
3. **student**: Handles all student-facing portals including course consumption, job applications, and fee payments.
4. **auth**: Centralized login and registration workflows.

### Separation of Concerns (Inside each feature)
Each feature directory enforces a clean separation into the following layers:
- `components/`: Pure UI React components that receive data and display it. They do **not** contain raw `fetch` calls.
- `api/`: The network layer. All HTTP requests are abstracted here into reusable service functions (e.g., `studentApi.js`, `adminApi.js`). 
- `*Slice.js`: Redux Toolkit slices that manage global application state for that feature.

### Centralized API Client
All network requests are channeled through a single, centralized client located at `src/lib/apiClient.js`. 
- **No raw `fetch()` calls in components:** UI components must call functions from their respective `[feature]/api/` files.
- The `apiClient` automatically attaches authentication tokens and handles global network errors, ensuring consistent behavior across the application.

## Folder Structure

```text
FE/
├── public/                 # Static assets that bypass Vite's build process
├── src/                    # Main source code directory
│   ├── assets/             # Images, fonts, and other compiled assets
│   ├── components/         # Shared global components (e.g. Buttons, Modals, Loaders)
│   ├── features/           # Feature-based domain modules (Core Architecture)
│   │   ├── admin/          # Admin role features (api, components, redux slice)
│   │   ├── auth/           # Authentication workflows
│   │   ├── employee/       # Employee portal and marketing/CRM tools
│   │   └── student/        # Student portal and job application workflows
│   ├── lib/                # Core utilities (e.g., apiClient.js)
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions and helpers
│   ├── App.jsx             # Main application component and routing setup
│   ├── App.css             # Global CSS styles
│   ├── index.css           # Tailwind base styles and configurations
│   └── main.jsx            # Application entry point
├── .gitignore              # Git ignore configuration
├── eslint.config.js        # ESLint configuration rules
├── index.html              # Main HTML template
├── package.json            # Project dependencies and scripts
└── vite.config.js          # Vite configuration options
```

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/novoxedtechllp-dotcom/Novox-Frontend.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Novox-Frontend/FE
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server, run:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port specified in your terminal).

### Building for Production

To create a production-ready build, run:
```bash
npm run build
```
This will compile the application into the `dist` directory. You can preview the production build locally using:
```bash
npm run preview
```

### Linting the Code

To run ESLint and check for potential issues:
```bash
npm run lint
```

## Frontend Development Guidelines

### 1. The Four States Rule
Every screen has four states and all four must be designed before the backend touches it. If you only design the happy path, you will always have broken-looking screens in production.

1. **Loading State**: Skeleton cards or a spinner. Never a blank white screen. The user must know something is happening while data fetches.
2. **Success State with Data**: The main happy path. Student list loads, attendance marks show, fee records display. This is what you build with mock data first.
3. **Empty State**: No students enrolled yet. No fee payments recorded. No assignments created. Design a helpful empty state — not a blank table with no rows. Show a message and an action button.
4. **Error State**: API failed. Network down. Unauthorized. Design these screens too. A red error message with a retry button. Never let a broken API show a white crash screen to users.

### 2. Adding New Features
Every time a frontend developer adds a new feature, they must:
- Create the module inside the appropriate feature directory (`admin`, `employee`, `student`, or a new feature).
- Add all network endpoints to the `[feature]Api.js` file inside `src/features/[feature]/api/`.
- Ensure components contain NO direct `fetch` calls. Use the `apiClient.js` wrapper via your API service layer functions.
- Handle component local states (loading, errors) properly and rely on Redux slices for global data (like cached user permissions or global course lists).
- Ensure the screen and its components are fully responsive across all device sizes.
- Update this README with relevant architecture changes if adding new infrastructural standards.

## Latest Updates (Changelog)

### Version 2.0.0 - Feature-Based Architecture Migration
- **Refactored Architecture**: Migrated from a flat component structure to a feature-based domain architecture (`admin`, `employee`, `student`, `auth`).
- **Network Layer Centralization**: Replaced over 100+ raw `fetch()` calls scattered across UI components with dedicated API service functions (`adminApi.js`, `employeeApi.js`, `studentApi.js`, `authApi.js`).
- **Global `apiClient` Implementation**: Introduced `src/lib/apiClient.js` to automatically handle `Authorization` bearer tokens and global API error states.
- **Role Separation**: Cleanly separated employee functionalities (marketing, CRM, blog agent) from admin functionalities (payroll, master records) and student functionalities (job applications, daily schedules, learning).

