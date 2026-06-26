import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getStudentAttendance, getStudentProfile, getStudentTasks, getCourseDetails, getStudentDailyPlan } from './api/studentApi';

export const fetchStudentDashboardData = createAsyncThunk(
  'student/fetchDashboardData',
  async (userInfo, { rejectWithValue }) => {
    try {
      const studentProfileId = userInfo?.student_profile_id || userInfo?.id;
      if (!studentProfileId) throw new Error('Student Profile ID missing');

      // 1. Fetch Attendance
      const attendanceData = await getStudentAttendance();
      let attendancePercent = 0;
      if (attendanceData && attendanceData.length > 0) {
        // Filter by user ID if necessary, but endpoint might return only their attendance
        const myAttendance = attendanceData.filter(a => a.student_id === studentProfileId || a.user_id === userInfo.id);
        if (myAttendance.length > 0) {
          const present = myAttendance.filter((r) => r.status === 'PRESENT').length;
          attendancePercent = Math.round((present / myAttendance.length) * 100);
        }
      }

      // 2. Fetch Tasks and Courses
      const stuData = await getStudentProfile(studentProfileId);
      const courseIds = stuData?.student_courses?.map((sc) => sc.course_id) || [];

      const tasksData = await getStudentTasks(stuData?.id || studentProfileId);
      let studentTasksMap = {};
      (tasksData || []).forEach((st) => {
        studentTasksMap[st.task_id] = st;
      });

      let allTasks = [];
      let completedCount = 0;
      let totalCount = 0;

      for (const cId of courseIds) {
        const course = await getCourseDetails(cId);
        if (course && course.course_modules) {
          course.course_modules.filter((m) => m.status === 'PUBLISHED').forEach((mod) => {
            mod.course_submodules?.forEach((sub) => {
              sub.course_tasks?.forEach((ct) => {
                totalCount++;
                const st = studentTasksMap[ct.id];
                let tStatus = st ? st.status : 'PENDING';
                let columnStatus = 'NOT STARTED';
                if (tStatus === 'IN_PROGRESS') columnStatus = 'IN PROGRESS';
                else if (tStatus === 'PENDING_REVIEW') columnStatus = 'PENDING REVIEW';
                else if (tStatus === 'APPROVED') columnStatus = 'APPROVED';
                else if (tStatus === 'SUBMITTED') columnStatus = 'SUBMITTED';

                if (columnStatus === 'APPROVED') {
                  completedCount++;
                } else if (columnStatus !== 'SUBMITTED' && columnStatus !== 'PENDING REVIEW') {
                  let dueText = 'No Date';
                  let rawDateVal = 8640000000000000;
                  let diffDays = null;

                  if (ct.due_date) {
                    rawDateVal = new Date(ct.due_date).getTime();
                    const dueDateObj = new Date(ct.due_date);
                    const today = new Date();
                    const diffTime = dueDateObj - today;
                    diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) dueText = 'Overdue';
                    else if (diffDays === 0) dueText = 'Due Today';
                    else if (diffDays === 1) dueText = 'Due Tomorrow';
                    else dueText = `${diffDays} Days Left`;
                  }

                  if (columnStatus === 'IN PROGRESS' || (diffDays !== null && diffDays <= 3)) {
                    allTasks.push({
                      title: ct.title,
                      dueTime: columnStatus,
                      courseName: course.name,
                      dueDate: dueText,
                      rawDate: rawDateVal,
                    });
                  }
                }
              });
            });
          });
        }
      }

      allTasks.sort((a, b) => a.rawDate - b.rawDate);
      const totalPendingTasks = allTasks.length;
      const pendingTasks = allTasks.slice(0, 5);
      const tasksDonePercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      // 3. Fetch Today's Classes
      const dateStr = new Date().toISOString().split('T')[0];
      const todaySessions = await getStudentDailyPlan(studentProfileId, dateStr);
      const currentModule =
        todaySessions.length > 0 && todaySessions[0].course_modules
          ? { title: todaySessions[0].course_modules.title }
          : null;

      return {
        attendancePercent,
        tasksDonePercent,
        totalPendingTasks,
        pendingTasks,
        todaySessions,
        currentModule,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  dashboard: {
    attendancePercent: 0,
    tasksDonePercent: 0,
    totalPendingTasks: 0,
    pendingTasks: [],
    todaySessions: [],
    currentModule: null,
  },
  loading: false,
  error: null,
};

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudentDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchStudentDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default studentSlice.reducer;
