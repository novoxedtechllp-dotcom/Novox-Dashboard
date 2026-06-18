import cron from "node-cron";
import { supabase } from "../config/supabase.js";

// Run every day at 11:59 PM
// Using server local time, ensure the server is running in IST or adjust accordingly.
// node-cron supports timezone passing.
export const startAttendanceCron = () => {
  cron.schedule("59 23 * * *", async () => {
    try {
      console.log("Running Nightly Attendance Cron Job...");

      // Get current IST date
      const now = new Date();
      const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const parts = formatter.formatToParts(now);
      const istDateStr = `${parts.find(p => p.type === 'year').value}-${parts.find(p => p.type === 'month').value}-${parts.find(p => p.type === 'day').value}`;

      // Skip weekends (Saturday & Sunday)
      const weekday = parts.find(p => p.type === 'weekday').value;
      if (weekday === 'Sat' || weekday === 'Sun') {
        console.log(`[Attendance Cron] Skipping — ${weekday} is a weekend.`);
        return;
      }

      // Get all active employees
      const { data: employees, error: empError } = await supabase
        .from('employee_profiles')
        .select('id')
        .eq('status', 'ACTIVE');

      if (empError) {
        console.error("Cron Error: Failed to fetch employees", empError);
        return;
      }

      // Get all attendance records for today
      const { data: attendance, error: attError } = await supabase
        .from('employee_attendance')
        .select('employee_id')
        .eq('attendance_date', istDateStr);

      if (attError) {
        console.error("Cron Error: Failed to fetch attendance", attError);
        return;
      }

      const presentEmployeeIds = new Set(attendance.map(a => a.employee_id));

      // Find employees who haven't checked in
      const absentEmployees = employees.filter(emp => !presentEmployeeIds.has(emp.id));

      if (absentEmployees.length === 0) {
        console.log("Cron: All employees checked in today.");
        return;
      }

      const payloads = absentEmployees.map(emp => ({
        employee_id: emp.id,
        attendance_date: istDateStr,
        status: 'ABSENT'
      }));

      // Insert ABSENT records
      const { error: insertError } = await supabase
        .from('employee_attendance')
        .upsert(payloads, { onConflict: 'employee_id,attendance_date' });

      if (insertError) {
        console.error("Cron Error: Failed to mark employees absent", insertError);
      } else {
        console.log(`Cron: Successfully marked ${absentEmployees.length} employees as ABSENT for ${istDateStr}`);
      }

    } catch (error) {
      console.error("Nightly Attendance Cron Job Error:", error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
};
