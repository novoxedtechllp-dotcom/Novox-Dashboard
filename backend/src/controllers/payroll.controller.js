import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Helper: Get business days in a given month and year
const getBusinessDays = (year, month) => {
  let count = 0;
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const day = date.getDay();
    if (day !== 0 && day !== 6) { // Exclude Sunday (0) and Saturday (6)
      count++;
    }
  }
  return count;
};

// @desc    Get Payroll data for a specific month
// @route   GET /api/v1/payroll?month=YYYY-MM
export const getPayroll = asyncHandler(async (req, res) => {
  const { month } = req.query; // format YYYY-MM
  if (!month) throw new ApiError(400, "Month parameter is required (YYYY-MM)");

  const [yearStr, monthStr] = month.split("-");
  const targetYear = parseInt(yearStr);
  const targetMonth = parseInt(monthStr); // 1-12

  const businessDays = getBusinessDays(targetYear, targetMonth);
  const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString();
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();

  // Fetch all active employees
  const { data: employees, error: empError } = await supabase
    .from("employee_profiles")
    .select(`
      id,
      first_name,
      last_name,
      employee_code,
      salary,
      avatar_url,
      employee_roles(role_name)
    `)
    .eq("status", "ACTIVE");

  if (empError) throw new ApiError(500, empError.message);

  // Fetch existing payroll records for this month
  const { data: payrollRecords, error: prError } = await supabase
    .from("payroll")
    .select("*")
    .eq("month", targetMonth)
    .eq("year", targetYear);

  if (prError) throw new ApiError(500, prError.message);

  const payrollMap = {};
  payrollRecords?.forEach(pr => {
    payrollMap[pr.employee_id] = pr;
  });

  // Fetch employee attendance for this month
  const { data: attendanceRecords, error: attError } = await supabase
    .from("employee_attendance")
    .select("employee_id, status, attendance_date")
    .gte("attendance_date", startDate.split("T")[0])
    .lte("attendance_date", endDate.split("T")[0]);

  if (attError) throw new ApiError(500, attError.message);

  const attendanceMap = {}; // { employee_id: { present: 0, halfDay: 0 } }
  attendanceRecords?.forEach(record => {
    if (!attendanceMap[record.employee_id]) {
      attendanceMap[record.employee_id] = { present: 0, halfDay: 0 };
    }
    // LATE and PRESENT count as full present day
    if (record.status === "PRESENT" || record.status === "LATE") {
      attendanceMap[record.employee_id].present += 1;
    } else if (record.status === "HALF_DAY") {
      attendanceMap[record.employee_id].halfDay += 1;
    }
  });

  // Compute final payload
  const result = employees.map(emp => {
    const existingPr = payrollMap[emp.id];
    
    const att = attendanceMap[emp.id] || { present: 0, halfDay: 0 };
    const presentCount = att.present;
    const halfDayCount = att.halfDay;
    
    // totalAbsentDays includes unpunched days
    const totalAbsentDays = Math.max(0, businessDays - presentCount - halfDayCount);
    
    // 1 Paid leave logic: deduct 1 from absent days
    const unpaidAbsentDays = Math.max(0, totalAbsentDays - 1);
    
    // Penalty days = unpaid absent days + (half days * 0.5)
    const penaltyDays = unpaidAbsentDays + (halfDayCount * 0.5);

    if (existingPr) {
      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        code: emp.employee_code,
        role: emp.employee_roles?.role_name || 'Employee',
        avatar: emp.avatar_url,
        baseSalary: Number(existingPr.basic_salary),
        netPayable: Number(existingPr.net_salary),
        deductions: Number(existingPr.deductions),
        leaves: totalAbsentDays,
        halfDays: halfDayCount,
        penaltyDays, // Added to show the calculation
        missedWorkReports: 0, // No longer using work reports
        status: existingPr.status,
        payrollId: existingPr.id
      };
    }

    const baseSalary = Number(emp.salary) || 0;
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    
    // Deduction formula
    const dailyRate = baseSalary / daysInMonth;
    const deductions = Number((dailyRate * penaltyDays).toFixed(2));
    const netPayable = Math.max(0, baseSalary - deductions);

    return {
      id: emp.id,
      name: `${emp.first_name} ${emp.last_name}`,
      code: emp.employee_code,
      role: emp.employee_roles?.role_name || 'Employee',
      avatar: emp.avatar_url,
      baseSalary,
      netPayable,
      deductions,
      leaves: totalAbsentDays,
      halfDays: halfDayCount,
      missedWorkReports: 0,
      penaltyDays,
      status: "PENDING"
    };
  });

  return res.status(200).json(new ApiResponse(200, result, "Payroll data fetched successfully"));
});

// @desc    Process/Disburse Payroll for specific employees
// @route   POST /api/v1/payroll/process
export const processPayroll = asyncHandler(async (req, res) => {
  const { month, employeeIds } = req.body;
  if (!month) throw new ApiError(400, "Month is required (YYYY-MM)");
  if (!employeeIds || !Array.isArray(employeeIds)) throw new ApiError(400, "employeeIds array is required");

  const [yearStr, monthStr] = month.split("-");
  const targetYear = parseInt(yearStr);
  const targetMonth = parseInt(monthStr);

  // We need to re-calculate their deductions just to be safe, or we can trust a robust calculation
  // To avoid duplicating logic, we will fetch the data similarly as getPayroll and insert
  const businessDays = getBusinessDays(targetYear, targetMonth);
  const startDate = new Date(targetYear, targetMonth - 1, 1).toISOString();
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59).toISOString();

  const { data: employees } = await supabase
    .from("employee_profiles")
    .select("id, salary")
    .in("id", employeeIds);

  const { data: attendanceRecords } = await supabase
    .from("employee_attendance")
    .select("employee_id, status, attendance_date")
    .in("employee_id", employeeIds)
    .gte("attendance_date", startDate.split("T")[0])
    .lte("attendance_date", endDate.split("T")[0]);

  const attendanceMap = {};
  attendanceRecords?.forEach(record => {
    if (!attendanceMap[record.employee_id]) {
      attendanceMap[record.employee_id] = { present: 0, halfDay: 0 };
    }
    if (record.status === "PRESENT" || record.status === "LATE") {
      attendanceMap[record.employee_id].present += 1;
    } else if (record.status === "HALF_DAY") {
      attendanceMap[record.employee_id].halfDay += 1;
    }
  });

  const payrollInserts = [];
  const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();

  employees?.forEach(emp => {
    const baseSalary = Number(emp.salary) || 0;
    
    const att = attendanceMap[emp.id] || { present: 0, halfDay: 0 };
    const presentCount = att.present;
    const halfDayCount = att.halfDay;
    
    const totalAbsentDays = Math.max(0, businessDays - presentCount - halfDayCount);
    const unpaidAbsentDays = Math.max(0, totalAbsentDays - 1);
    const penaltyDays = unpaidAbsentDays + (halfDayCount * 0.5);
    
    const dailyRate = baseSalary / daysInMonth;
    const deductions = Number((dailyRate * penaltyDays).toFixed(2));
    const netSalary = Math.max(0, baseSalary - deductions);

    payrollInserts.push({
      employee_id: emp.id,
      month: targetMonth,
      year: targetYear,
      basic_salary: baseSalary,
      deductions: deductions,
      net_salary: netSalary,
      status: "PAID",
      payment_date: new Date().toISOString()
    });
  });

  if (payrollInserts.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No employees processed"));
  }

  // Insert or Update payroll (Supabase upsert on unique constraints)
  // Our schema says UNIQUE (employee_id, month, year)
  const { data, error } = await supabase
    .from("payroll")
    .upsert(payrollInserts, { onConflict: 'employee_id,month,year' })
    .select();

  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, data, "Payroll processed successfully"));
});

// @desc    Get all payslips for an employee
// @route   GET /api/v1/payroll/employee/:employeeId
export const getEmployeePayslips = asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  // Resolve user_id if needed
  let empId = employeeId;
  const { data: profile } = await supabase.from("employee_profiles").select("id").eq("id", employeeId).single();
  if (!profile) {
    const { data: profileByUser } = await supabase.from("employee_profiles").select("id").eq("user_id", employeeId).single();
    if (profileByUser) empId = profileByUser.id;
  }

  const { data, error } = await supabase
    .from("payroll")
    .select("*")
    .eq("employee_id", empId)
    .order("year", { ascending: false })
    .order("month", { ascending: false });

  if (error) throw new ApiError(500, error.message);

  return res.status(200).json(new ApiResponse(200, data, "Payslips fetched successfully"));
});
