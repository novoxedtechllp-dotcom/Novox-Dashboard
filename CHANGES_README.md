# Current Changes README

This document outlines the recent modifications made to the Novox-Dashboard codebase, including schema updates, added debugging logs, and newly introduced database utilities.

## 1. Schema Modifications: Removal of `guardian_name`
The `guardian_name` field has been completely removed from the Student entity across the backend. 
- **`backend/src/controllers/student.controller.js`**: 
  - Removed `guardian_name` from the `studentSelectFields` string.
  - Removed `guardian_name` from the destructuring of `req.body` in both `createStudent` and `updateStudent` functions.
  - Removed `guardian_name` from the database `insert` payload in `createStudent`.
  - Removed the condition that updates `guardian_name` in `updateStudent`.
- **`backend/seed_students.js`**:
  - Removed the `guardian_name` parameter from the raw SQL `INSERT` query when seeding students.

## 2. Authentication Debugging
Added `console.log` statements to trace the login flow and diagnose authentication issues.
- **`backend/src/controllers/auth.controller.js`**: Added logs inside the `login` controller to indicate when the endpoint is hit and to log the incoming `email` and `password` payload.
- **`backend/src/services/auth.service.js`**: Added logs inside `loginUserService` to print the email being queried, as well as the results from the Supabase query (tracing the `error` object and whether a `user` was found).

## 3. Database Maintenance and Seeding Utilities
A number of new, untracked utility scripts were added to the `backend/` directory for database setup, maintenance, and testing.
- **`backend/check_admin.js`**: Script to verify admin user roles and records.
- **`backend/fix_db.js`**: Script intended to run database structural fixes.
- **`backend/seed_admin.js`**: Utility to seed the initial admin account.
- **`backend/seed_employees.js` & `backend/seed_real_employees.js`**: Scripts to seed dummy or real employee records into the database.
- **`backend/seed_whatsapp.js`**: Script for seeding WhatsApp integration data.
- **`backend/supabase/enable_rls.sql`**: A SQL migration script to enable Row Level Security (RLS) on Supabase tables.
