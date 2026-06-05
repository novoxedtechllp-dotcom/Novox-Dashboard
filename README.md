# 🚀 Novox Edtech Dashboard

<div align="center">

<img src="https://raw.githubusercontent.com/novoxedtechllp-dotcom/Novox-Dashboard/main/frontend/src/assets/Screenshot%202026-06-05%20130238.png" alt="Novox Logo" width="180" />

### Your all-in-one hub for educational management, administration, and student operations.

![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge\&logo=react)
![Vite](https://img.shields.io/badge/Vite-8.0-purple?style=for-the-badge\&logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?style=for-the-badge\&logo=tailwind-css)
![Express](https://img.shields.io/badge/Express.js-5.2-lightgrey?style=for-the-badge\&logo=express)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge\&logo=supabase)

</div>

---

## 🌟 Overview

**Novox Edtech Dashboard** is a full-stack administrative platform designed to streamline educational institution operations. It provides modules for student management, employee administration, attendance tracking, payroll processing, recruitment, CRM, course management, and analytics through a secure role-based system.

---

## ✨ Key Features

* 🛡️ **Role-Based Access Control (RBAC)**

  * Separate dashboards and permissions for Admin, HR, Design, Development, and Staff.

* 👥 **Employee & Student Management**

  * Centralized profiles, records, and performance tracking.

* 📅 **Attendance & Leave Management**

  * Daily attendance monitoring and leave request workflows.

* 💰 **Payroll & Fee Tracking**

  * Employee payroll processing and student fee management.

* 📈 **CRM & Recruitment**

  * Lead management and hiring pipeline tracking.

* 🤖 **Automation Tools**

  * SEO management and WhatsApp communication support.

* 🎓 **Course & Content Management**

  * Manage courses, blogs, and educational content.

* 📊 **Analytics Dashboard**

  * Visual insights into operations and performance.

---

## 🛠️ Technology Stack

### Frontend

Located in the `frontend/` directory.

* React 19
* Vite
* Tailwind CSS 4
* React Router DOM
* Lucide React
* React Icons
* ReactJS Popup
* jsPDF
* jsPDF-Autotable

### Backend

Located in the `backend/` directory.

* Node.js
* Express.js
* PostgreSQL (Supabase)
* JWT Authentication
* bcryptjs
* Zod Validation
* CORS
* Multer
* Cloudinary

---

## 📂 Project Structure

```text
Novox-Dashboard/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── supabase/
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

* Node.js v18+
* npm or yarn
* Supabase Project
* Cloudinary Account

### 1. Clone the Repository

```bash
git clone https://github.com/novoxedtechllp-dotcom/Novox-Dashboard.git
cd Novox-Dashboard
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
CLOUDINARY_URL=your_cloudinary_url
```

Start the backend server:

```bash
# Development
npm run dev

# Production
npm start
```

Backend runs at:

```text
http://localhost:5000
```

---

## 🔐 Authentication & Roles

The application provides role-based routing and access control.

### Admin

* Full access to all modules and settings.

### HR

* Recruitment Management
* Employee Records
* Payroll
* Leave Management

### Design Team

* Assigned Tasks
* Project Tracking
* Workflow Management

### Development Team

* Task Management
* Project Monitoring
* Technical Operations

### Staff

* Attendance
* Leave Requests
* Personal Dashboard Access

---

## 📄 License

This project is developed for educational and organizational management purposes.

---
