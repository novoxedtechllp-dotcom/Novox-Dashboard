import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployees, getCourses, getStudents } from './api/adminApi';
import { mapEmployeeFromApi, mapCourseFromApi } from '../../utils/mappers';

// Async Thunks
export const fetchEmployees = createAsyncThunk('admin/fetchEmployees', async (_, { rejectWithValue }) => {
  try {
    const data = await getEmployees();
    return data.map(mapEmployeeFromApi);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchCourses = createAsyncThunk('admin/fetchCourses', async (_, { rejectWithValue }) => {
  try {
    const data = await getCourses();
    return data.map(mapCourseFromApi);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchStudents = createAsyncThunk('admin/fetchStudents', async (_, { rejectWithValue }) => {
  try {
    const data = await getStudents();
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const initialState = {
  employees: [],
  courses: [],
  students: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Synchronous actions if needed
  },
  extraReducers: (builder) => {
    builder
      // Fetch Employees
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload || [];
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Courses
      .addCase(fetchCourses.pending, (state) => { state.loading = true; })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload || [];
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Students
      .addCase(fetchStudents.pending, (state) => { state.loading = true; })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.students = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adminSlice.reducer;
