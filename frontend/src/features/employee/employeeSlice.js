import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getEmployeeAttendance, employeePunchIn, employeePunchOut } from './api/employeeApi';

// Async Thunks
export const fetchMyAttendance = createAsyncThunk(
  'employee/fetchMyAttendance',
  async (userInfo, { rejectWithValue }) => {
    try {
      const data = await getEmployeeAttendance();
      // Filter for the current user
      const myAttendance = data.filter(
        (a) => a.employee_id === userInfo.id || a.employee_id === userInfo.employee_profile_id
      );
      return myAttendance;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const punchIn = createAsyncThunk(
  'employee/punchIn',
  async (_, { rejectWithValue }) => {
    try {
      const data = await employeePunchIn();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const punchOut = createAsyncThunk(
  'employee/punchOut',
  async (_, { rejectWithValue }) => {
    try {
      const data = await employeePunchOut();
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  myAttendance: [],
  currentRecord: null,
  monthlyStats: { present: 0, halfDay: 0, late: 0, absent: 0 },
  loading: false,
  error: null,
};

const calculateStatsAndRecord = (attendanceArray) => {
  const now = new Date();
  const today = now.toLocaleDateString('en-CA');
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const record = attendanceArray.find(
    (a) => a.attendance_date === today || a.attendance_date?.startsWith(today)
  );

  let present = 0, halfDay = 0, late = 0, absent = 0;
  attendanceArray.forEach((a) => {
    if (!a.attendance_date) return;
    const d = new Date(a.attendance_date);
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      if (a.status === 'PRESENT') present++;
      else if (a.status === 'HALF_DAY') halfDay++;
      else if (a.status === 'LATE') late++;
      else if (a.status === 'ABSENT') absent++;
    }
  });

  return { record: record || null, stats: { present, halfDay, late, absent } };
};

const employeeSlice = createSlice({
  name: 'employee',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch My Attendance
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.myAttendance = action.payload;
        const { record, stats } = calculateStatsAndRecord(action.payload);
        state.currentRecord = record;
        state.monthlyStats = stats;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Punch In
      .addCase(punchIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(punchIn.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
        // Optionally add to myAttendance if needed, but usually a re-fetch is better or we just trust currentRecord
      })
      .addCase(punchIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Punch Out
      .addCase(punchOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(punchOut.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(punchOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default employeeSlice.reducer;
