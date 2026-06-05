<div align="center">
  <img src="https://via.placeholder.com/150/003F87/FFFFFF?text=Novox" alt="Novox Logo" width="120" />
  <h1>Novox Edtech Dashboard</h1>
  <p><strong>Your all-in-one hub for educational management, administration, and student operations.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Vite-8.0-purple?style=for-the-badge&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Express.js-5.2-lightgrey?style=for-the-badge&logo=express" alt="Express" />
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  </p>
</div>

---

## 🌟 Overview

The **Novox Edtech Dashboard** is a comprehensive, full-stack administrative suite designed to streamline operations for educational institutions. From handling student enrollment and fee tracking to managing employee payroll and recruitment, Novox provides real-time analytics, secure protocols, and a highly responsive user interface tailored to specific departmental roles.

---

## ✨ Key Features

- **🛡️ Role-Based Access Control (RBAC)**: Secure, distinct views and permissions for Admin, HR, Design, Development, and Staff.
- **👥 Employee & Student Management**: Centralized directories with profiles, performance tracking, and academic journey mapping.
- **📅 Attendance & Leave Tracking**: Streamlined tracking of daily attendance and employee leave requests.
- **💰 Payroll & Fees Management**: Automated tracking of student tuition fees and employee payroll processing.
- **📈 Sales CRM & Recruitment**: Integrated tools to manage incoming leads and track the hiring pipeline.
- **🤖 Specialized Agents**: Built-in SEO management and WhatsApp automation agents to handle marketing and communications.
- **🎓 Course & Blog Management**: Easily create, update, and manage educational courses and platform content.

---

## 🛠️ Technology Stack

### Frontend Architecture
Located in the `/frontend` directory, the client application is built for speed and aesthetics:
- **Core**: React 19, Vite
- **Styling**: TailwindCSS 4.3
- **Routing**: React Router DOM (v7)
- **Icons & UI Elements**: Lucide React, React Icons, ReactJS Popup
- **Reporting**: jsPDF & jsPDF-Autotable for generating quick PDF reports

### Backend Architecture
Located in the `/backend` directory, the server follows a robust MVC (Model-View-Controller) pattern:
- **Core Engine**: Express.js (v5) running on Node.js
- **Database & Auth**: PostgreSQL managed via [Supabase](https://supabase.com/)
- **Security**: JWT (JSON Web Tokens), bcryptjs, CORS
- **Data Validation**: Zod
- **Media Storage**: Cloudinary (via Multer)

---

## 📂 Project Structure

```text
Novox-Dashboard/
├── frontend/                 # React frontend application
│   ├── public/               # Static assets & icons
│   ├── src/                  
│   │   ├── components/       # Reusable React components & Pages
│   │   ├── hooks/            # Custom React hooks (e.g. useClickOutside)
│   │   ├── App.jsx           # Main Application & Router setup
│   │   └── main.jsx          # React Entry point
│   └── package.json
│
└── backend/                  # Express.js backend application
    ├── src/
    │   ├── config/           # Database and Cloudinary configurations
    │   ├── constants/        # System constants and roles
    │   ├── controllers/      # Route controllers (Auth, Students, HR, etc.)
    │   ├── middlewares/      # JWT validation, Role authorization
    │   ├── routes/           # Express API endpoints mapping
    │   ├── services/         # Core business logic
    │   ├── utils/            # Error handlers, async wrappers
    │   └── server.js         # Express Server Entry point
    ├── supabase/             # Supabase specific configurations
    └── package.json
🚀 Getting Started
Prerequisites
Node.js (v18 or higher)
npm or yarn
Supabase Project & Cloudinary Account (for backend environment variables)
1. Clone the repository
```bash git clone https://github.com/novoxedtechllp-dotcom/Novox-Dashboard.git cd Novox-Dashboard ```

2. Frontend Setup
```bash cd frontend npm install npm run dev ``` The frontend will start running on http://localhost:5173

3. Backend Setup
```bash cd ../backend npm install ```

Create a .env file in the backend/ directory based on the provided .env.sample: ```env PORT=5000 SUPABASE_URL=your_supabase_url SUPABASE_ANON_KEY=your_supabase_anon_key JWT_SECRET=your_jwt_secret CLOUDINARY_URL=your_cloudinary_url ```

Start the backend server: ```bash

For development with auto-reload
npm run dev

For production
npm start ``` The backend API will start running on http://localhost:5000

🔐 Authentication & Roles
The application intelligently routes users based on their assigned role upon login. Test accounts can be configured in the database to mimic:

Admin: Full access to all modules.
HR: Access strictly to Recruitment, Employee Tracking, Payroll, and Leaves.
Design/Development: Access to Tasks, Projects, and designated workflows.
Built by the Novox Edtech Team.

```
