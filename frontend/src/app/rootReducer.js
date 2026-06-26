import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import adminReducer from '../features/admin/adminSlice';
import employeeReducer from '../features/employee/employeeSlice';
import studentReducer from '../features/student/studentSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  admin: adminReducer,
  employee: employeeReducer,
  student: studentReducer,
});

export default rootReducer;
