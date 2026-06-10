# Novox Dashboard API Reference

This document contains a comprehensive list of all backend APIs with their expected request bodies.

**Base URL**: `http://localhost:3000/api/v1`

---

## 1. Auth APIs (`/api/v1/auth`)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/register` | Register a new user | `{ "email": "user@example.com", "password": "password123", "role": "STUDENT" }` |
| **POST** | `/login` | User login | `{ "email": "user@example.com", "password": "password123" }` |
| **POST** | `/logout` | User logout | *None* |
| **GET** | `/me` | Get current user | *None* |
| **POST** | `/change-password` | Change user password | `{ "oldPassword": "old", "newPassword": "new" }` |

---

## 2. Student APIs (`/api/v1/students`)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get all students | *None* |
| **GET** | `/reports` | Get student reports | *None* |
| **GET** | `/:studentId` | Get student by ID | *None* |
| **GET** | `/:studentId/daily-plan` | Get student daily plan | *None* |
| **POST** | `/` | Create a student | `{ "first_name": "", "last_name": "", "phone": "", "parent_phone": "", "guardian_name": "", "address": "", "status": "", "avatar_url": "", "email": "" }` |
| **PUT** | `/:studentId` | Update student details | *(same as POST)* |
| **DELETE** | `/:studentId` | Delete a student | *None* |
| **POST** | `/:studentId/courses` | Assign course | `{ "course_id": "uuid" }` |
| **PUT** | `/:studentId/courses/:courseId` | Update course progress | `{ "progress_percentage": 50, "completion_status": "IN_PROGRESS" }` |
| **DELETE** | `/:studentId/courses/:courseId` | Remove course | *None* |
| **GET** | `/:studentId/progress` | Get progress | *None* |
| **GET** | `/:studentId/tasks` | Get student tasks | *None* |
| **PUT** | `/:studentId/tasks/:taskId` | Update task | `{ "status": "", "submission_url": "", "grade": "", "feedback": "" }` |
| **GET** | `/:studentId/documents` | Get documents | *None* |
| **POST** | `/:studentId/documents` | Add document | `{ "document_type": "", "document_url": "" }` |
| **DELETE** | `/:studentId/documents/:documentId` | Delete document | *None* |

---

## 3. Employee APIs (`/api/v1/employees`)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get all employees | *None* |
| **GET** | `/reports` | Get employee reports | *None* |
| **GET** | `/:employeeId` | Get employee by ID | *None* |
| **GET** | `/:employeeId/daily-plan` | Get employee daily plan | *None* |
| **GET** | `/:employeeId/available-topics`| Get available topics | *None* |
| **PATCH** | `/:employeeId/topics/:submoduleId/schedule` | Schedule topic | `{ "scheduled_date": "2024-01-01" }` |
| **POST** | `/` | Create employee | `{ "first_name": "", "last_name": "", "phone": "", "designation": "", "status": "", "joining_date": "", "role_id": "", "employee_role": "", "department": "", "salary": 0, "avatar_url": "", "email": "", "course_ids": [], "guardian_name": "", "guardian_phone": "" }` |
| **PUT** | `/:employeeId` | Update employee | *(same as POST)* |
| **DELETE** | `/:employeeId` | Delete employee | *None* |
| **POST** | `/:employeeId/documents` | Add document | `{ "document_name": "", "cloudinary_url": "" }` |
| **DELETE** | `/:employeeId/documents/:docId` | Delete document | *None* |
| **POST** | `/:employeeId/courses` | Assign course | `{ "course_id": "uuid" }` |
| **DELETE** | `/:employeeId/courses/:courseId` | Remove course | *None* |

---

## 4. Course APIs (`/api/v1/courses`)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get courses | *None* |
| **GET** | `/daily-plan` | Get admin daily plan | *None* |
| **GET** | `/:courseId` | Get course by ID | *None* |
| **GET** | `/:courseId/students` | Get course students | *None* |
| **GET** | `/:courseId/employees` | Get course employees| *None* |
| **POST** | `/` | Create a course | `{ "name": "", "description": "", "track": "", "duration_months": 3, "capacity": 30, "status": "", "instructor_id": "", "employee_id": "", "thumbnail_url": "" }` |
| **PUT** | `/:courseId` | Update a course | *(same as POST)* |
| **DELETE** | `/:courseId` | Delete a course | *None* |
| **PATCH** | `/:courseId/publish` | Publish course | *None* |
| **PATCH** | `/:courseId/archive` | Archive course | *None* |
| **POST** | `/:courseId/modules` | Add module | `{ "title": "", "description": "", "sequence_order": 1 }` |
| **PUT** | `/:courseId/modules/:moduleId` | Update module | *(same as POST)* |
| **DELETE** | `/:courseId/modules/:moduleId` | Delete module | *None* |
| **POST** | `/:courseId/modules/:moduleId/submodules`| Add submodule | `{ "title": "", "description": "", "sequence_order": 1 }` |
| **PUT** | `/:courseId/modules/:moduleId/submodules/:submoduleId`| Update submodule | *(same as POST)* |
| **DELETE** | `/:courseId/modules/:moduleId/submodules/:submoduleId`| Delete submodule | *None* |
| **POST** | `/:courseId/modules/:moduleId/submodules/:submoduleId/tasks`| Add task | `{ "title": "", "description": "", "sequence_order": 1, "task_type": "", "due_date": "" }` |
| **PUT** | `/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/:taskId`| Update task | *(same as POST)* |
| **DELETE** | `/:courseId/modules/:moduleId/submodules/:submoduleId/tasks/:taskId`| Delete task | *None* |
| **POST** | `/:courseId/schedule-plan` | Auto schedule plan | `{ "start_date": "", "end_date": "", "days_of_week": [], "start_time": "", "end_time": "", "topics_per_day": 2 }` |
| **POST** | `/:courseId/schedule-plan/preview` | Preview auto schedule | *(same as POST)* |
| **POST** | `/:courseId/reschedule` | Reschedule plan | *None / TBD* |
| **POST** | `/:courseId/schedules` | Add schedule | `{ "title": "", "description": "", "sequence_order": 1, "scheduled_date": "" }` |
| **DELETE** | `/:courseId/schedules/:scheduleId`| Delete schedule | *None* |
| **POST** | `/:courseId/students/batch-assign`| Batch assign students | `{ "studentIds": ["id1", "id2"] }` |
| **POST** | `/:courseId/instructors` | Assign instructor | `{ "employee_id": "" }` |
| **DELETE** | `/:courseId/instructors/:instructorId`| Remove instructor | *None* |

---

## 5. Attendance APIs (`/api/v1/attendance`)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Mark attendance | `{ "userId": "", "date": "", "status": "", "check_in": "", "check_out": "", "remarks": "", "type": "student/employee" }` |
| **POST** | `/bulk` | Mark bulk attendance | `{ "records": [{ "userId": "...", "status": "..." }], "type": "student/employee" }` |
| **GET** | `/reports` | Get attendance reports| *None* |

---

## 6. Work Reports APIs (`/api/v1/work-reports`)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get work reports | *None* |
| **GET** | `/:reportId` | Get specific report | *None* |
| **POST** | `/` | Submit work report | `{ "project_id": "", "report_type": "", "work_done": "", "blockers": "" }` |
| **PATCH** | `/:reportId/approve` | Approve report | *None* |
| **PATCH** | `/:reportId/reject` | Reject report | *None* |

---

## 7. Profile APIs (`/api/v1/profile`)

| Method | Endpoint | Description | Request Body (Form Data) |
| :--- | :--- | :--- | :--- |
| **GET** | `/me` | Get own profile | *None* |
| **PUT** | `/me` | Update own profile | Form Data with file `avatar`, and `{ "first_name": "", "last_name": "", "phone": "", "password": "" }` |

---

## 8. Upload APIs (`/api/v1/upload`)

| Method | Endpoint | Description | Request Body (Form Data) |
| :--- | :--- | :--- | :--- |
| **POST** | `/` | Upload a file | Form Data: `file` (multipart/form-data) |

---

## 9. Gallery APIs (`/api/gallery`)

| Method | Endpoint | Description | Request Body (Form Data) |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get gallery images | *None* |
| **POST** | `/upload` | Upload gallery image | Form Data with file `image` and `{ "category": "" }` |

---

## 10. User APIs (`/api/v1/users`)

| Method | Endpoint | Description | Request Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Get all users | *None* |
| **POST** | `/` | Create a user | `{ "email": "", "password": "", "role": "", "status": "" }` |

---
