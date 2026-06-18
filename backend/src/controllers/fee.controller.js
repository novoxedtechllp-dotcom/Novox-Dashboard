import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// ==========================================
// HELPER: Calculate carry-forward balances
// ==========================================

/**
 * Calculates the month-by-month fee breakdown for a student's fee plan,
 * including carry-forward logic.
 * 
 * Business rules:
 * - Admission fee: ₹5,000 due in the enrollment month
 * - Monthly installment: ₹10,000 due every month after admission
 * - If a student pays less than the installment, the shortfall carries forward
 */
const calculateFeeBreakdown = (feePlan, payments, upToMonth, upToYear) => {
  const admissionFee = parseFloat(feePlan.admission_fee) || 5000;
  const monthlyInstallment = parseFloat(feePlan.monthly_installment) || 10000;
  const startMonth = feePlan.start_month;
  const startYear = feePlan.start_year;

  if (!startMonth || !startYear) {
    return {
      totalDue: 0,
      totalPaid: 0,
      remainingBalance: 0,
      currentMonthDue: 0,
      carryForward: 0,
      monthsElapsed: 0
    };
  }

  // Calculate months elapsed from start to the target month
  const monthsElapsed = (upToYear - startYear) * 12 + (upToMonth - startMonth);

  // Total due = admission fee + (months elapsed × monthly installment)
  // Months elapsed of 0 means the start month itself (only admission fee is due)
  // Months elapsed of 1+ means installments are due
  let totalDue = admissionFee;
  if (monthsElapsed > 0) {
    totalDue += monthsElapsed * monthlyInstallment;
  }

  // Cap total due at the total course fee if set
  const totalCourseFee = parseFloat(feePlan.total_fee) || 0;
  if (totalCourseFee > 0 && totalDue > totalCourseFee) {
    totalDue = totalCourseFee;
  }

  // Sum all payments
  const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const remainingBalance = Math.max(0, totalDue - totalPaid);

  // Current month's due = monthly installment + any carry-forward
  // carry-forward = total due up to previous month - total paid (if negative, that's overpayment)
  let dueUpToPreviousMonth = admissionFee;
  if (monthsElapsed > 1) {
    dueUpToPreviousMonth += (monthsElapsed - 1) * monthlyInstallment;
  }
  if (totalCourseFee > 0 && dueUpToPreviousMonth > totalCourseFee) {
    dueUpToPreviousMonth = totalCourseFee;
  }

  const carryForward = Math.max(0, dueUpToPreviousMonth - totalPaid);
  const currentMonthDue = monthsElapsed > 0
    ? monthlyInstallment + carryForward
    : admissionFee - totalPaid; // first month: just the admission fee minus what's paid

  return {
    totalDue,
    totalPaid,
    remainingBalance,
    currentMonthDue: Math.max(0, currentMonthDue),
    carryForward,
    monthsElapsed
  };
};

// ==========================================
// 1. CREATE FEE PLAN
// ==========================================

// @desc    Create a fee plan for a student-course enrollment
// @route   POST /api/v1/fees/plans
const createFeePlan = asyncHandler(async (req, res) => {
  const {
    student_id,
    course_id,
    admission_fee = 5000,
    monthly_installment = 10000,
    total_fee,
    discount = 0
  } = req.body;

  if (!student_id) throw new ApiError(400, "Please provide student_id");
  if (!course_id) throw new ApiError(400, "Please provide course_id");

  // Check if a plan already exists for this student-course combo
  const { data: existing } = await supabase
    .from("student_fee_plans")
    .select("id")
    .eq("student_id", student_id)
    .eq("course_id", course_id)
    .maybeSingle();

  if (existing) {
    throw new ApiError(409, "A fee plan already exists for this student-course combination");
  }

  const now = new Date();
  const finalFee = (total_fee || 0) - discount;

  const { data, error } = await supabase
    .from("student_fee_plans")
    .insert([{
      student_id,
      course_id,
      admission_fee,
      monthly_installment,
      total_fee: total_fee || 0,
      discount,
      final_fee: Math.max(0, finalFee),
      start_month: now.getMonth() + 1, // 1-indexed
      start_year: now.getFullYear(),
    }])
    .select(`
      *,
      students(id, first_name, last_name, student_code),
      courses(id, name, track)
    `);

  if (error) throw new ApiError(500, error.message || "Failed to create fee plan");

  return res.status(201).json(new ApiResponse(201, data[0], "Fee plan created successfully"));
});

// ==========================================
// 2. GET FEE PLANS
// ==========================================

// @desc    Get all fee plans (optionally filtered by student/course)
// @route   GET /api/v1/fees/plans
const getFeePlans = asyncHandler(async (req, res) => {
  const { studentId, courseId } = req.query;

  let query = supabase
    .from("student_fee_plans")
    .select(`
      *,
      students(id, first_name, last_name, student_code, avatar_url),
      courses(id, name, track)
    `)
    .order("created_at", { ascending: false });

  if (studentId) query = query.eq("student_id", studentId);
  if (courseId) query = query.eq("course_id", courseId);

  const { data, error } = await query;

  if (error) throw new ApiError(500, error.message || "Failed to fetch fee plans");

  return res.status(200).json(new ApiResponse(200, data, "Fee plans fetched successfully"));
});

// ==========================================
// 3. RECORD PAYMENT
// ==========================================

// @desc    Record a fee payment
// @route   POST /api/v1/fees/payments
const recordPayment = asyncHandler(async (req, res) => {
  const {
    student_id,
    fee_plan_id,
    amount,
    payment_method = "CASH",
    payment_type = "INSTALLMENT",
    month,
    year,
    transaction_reference,
    notes
  } = req.body;

  if (!student_id) throw new ApiError(400, "Please provide student_id");
  if (!fee_plan_id) throw new ApiError(400, "Please provide fee_plan_id");
  if (!amount || parseFloat(amount) <= 0) throw new ApiError(400, "Please provide a valid positive amount");

  // Verify the fee plan exists and belongs to the student
  const { data: plan } = await supabase
    .from("student_fee_plans")
    .select("id, student_id")
    .eq("id", fee_plan_id)
    .eq("student_id", student_id)
    .single();

  if (!plan) throw new ApiError(404, "Fee plan not found for this student");

  const now = new Date();
  const paymentMonth = month || (now.getMonth() + 1);
  const paymentYear = year || now.getFullYear();

  const { data, error } = await supabase
    .from("fee_payments")
    .insert([{
      fee_plan_id,
      student_id,
      amount: parseFloat(amount),
      payment_method: payment_method.toUpperCase(),
      payment_type,
      month: paymentMonth,
      year: paymentYear,
      transaction_reference: transaction_reference || null,
      notes: notes || null,
      paid_at: now.toISOString()
    }])
    .select(`
      *,
      students(id, first_name, last_name, student_code),
      student_fee_plans(id, course_id, courses(id, name))
    `);

  if (error) throw new ApiError(500, error.message || "Failed to record payment");

  return res.status(201).json(new ApiResponse(201, data[0], "Payment recorded successfully"));
});

// ==========================================
// 4. GET PAYMENTS (with filters)
// ==========================================

// @desc    Get fee payments with optional filters
// @route   GET /api/v1/fees/payments
const getPayments = asyncHandler(async (req, res) => {
  const { studentId, month, year, page = 1, limit = 50 } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const offset = (pageNum - 1) * limitNum;

  let query = supabase
    .from("fee_payments")
    .select(`
      *,
      students(id, first_name, last_name, student_code, avatar_url),
      student_fee_plans(id, course_id, admission_fee, monthly_installment, total_fee, courses(id, name, track))
    `, { count: "exact" })
    .order("paid_at", { ascending: false })
    .range(offset, offset + limitNum - 1);

  if (studentId) query = query.eq("student_id", studentId);
  if (month) query = query.eq("month", parseInt(month, 10));
  if (year) query = query.eq("year", parseInt(year, 10));

  const { data, error, count } = await query;

  if (error) throw new ApiError(500, error.message || "Failed to fetch payments");

  return res.status(200).json(new ApiResponse(200, {
    payments: data,
    total: count,
    page: pageNum,
    limit: limitNum
  }, "Payments fetched successfully"));
});

// ==========================================
// 5. GET STUDENT BALANCES (with carry-forward)
// ==========================================

// @desc    Get all student balances with carry-forward calculation
// @route   GET /api/v1/fees/balances
const getStudentBalances = asyncHandler(async (req, res) => {
  const { month, year, status: filterStatus, search } = req.query;

  const now = new Date();
  const targetMonth = month ? parseInt(month, 10) : (now.getMonth() + 1);
  const targetYear = year ? parseInt(year, 10) : now.getFullYear();

  // 1. Get all fee plans with student & course info
  const { data: feePlans, error: planError } = await supabase
    .from("student_fee_plans")
    .select(`
      *,
      students(id, first_name, last_name, student_code, avatar_url, status),
      courses(id, name, track)
    `);

  if (planError) throw new ApiError(500, planError.message || "Failed to fetch fee plans");

  if (!feePlans || feePlans.length === 0) {
    return res.status(200).json(new ApiResponse(200, [], "No fee plans found"));
  }

  // 2. Get all payments
  const studentIds = [...new Set(feePlans.map(fp => fp.student_id))];
  const { data: allPayments, error: payError } = await supabase
    .from("fee_payments")
    .select("*")
    .in("student_id", studentIds);

  if (payError) throw new ApiError(500, payError.message || "Failed to fetch payments");

  // 3. Calculate balances for each fee plan
  const balances = feePlans.map(plan => {
    const studentPayments = (allPayments || []).filter(p => p.fee_plan_id === plan.id);
    const breakdown = calculateFeeBreakdown(plan, studentPayments, targetMonth, targetYear);

    const totalCourseFeeVal = parseFloat(plan.total_fee) || 0;
    const remainingCourseFee = Math.max(0, totalCourseFeeVal - breakdown.totalPaid);

    let paymentStatus = 'Pending';
    if (remainingCourseFee === 0 && totalCourseFeeVal > 0) {
      paymentStatus = 'Full Paid';
    } else if (breakdown.totalPaid > 0 && breakdown.totalPaid < 10000) {
      paymentStatus = 'Partially Paid';
    } else {
      paymentStatus = 'Pending';
    }

    // Total paid this specific month
    const monthPayments = studentPayments.filter(
      p => p.month === targetMonth && p.year === targetYear
    );
    const paidThisMonth = monthPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return {
      id: plan.id,
      studentId: plan.student_id,
      studentCode: plan.students?.student_code || '',
      name: `${plan.students?.first_name || ''} ${plan.students?.last_name || ''}`.trim(),
      initials: `${plan.students?.first_name?.[0] || ''}${plan.students?.last_name?.[0] || ''}`.toUpperCase() || 'ST',
      avatarUrl: plan.students?.avatar_url || null,
      course: plan.courses?.name || 'Unknown Course',
      courseId: plan.course_id,
      admissionFee: parseFloat(plan.admission_fee) || 5000,
      monthlyInstallment: parseFloat(plan.monthly_installment) || 10000,
      totalCourseFee: parseFloat(plan.total_fee) || 0,
      totalDue: breakdown.totalDue,
      totalPaidOverall: breakdown.totalPaid,
      paidThisMonth,
      remainingBalance: breakdown.remainingBalance,
      currentMonthDue: breakdown.currentMonthDue,
      carryForward: breakdown.carryForward,
      monthsElapsed: breakdown.monthsElapsed,
      status: paymentStatus,
      feePlanId: plan.id
    };
  });

  // 4. Apply filters
  let filtered = balances;

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.studentCode.toLowerCase().includes(q)
    );
  }

  if (filterStatus && filterStatus !== 'All') {
    filtered = filtered.filter(b => b.status === filterStatus);
  }

  return res.status(200).json(new ApiResponse(200, filtered, "Student balances fetched successfully"));
});

// ==========================================
// 6. GET STUDENT FEE DETAILS
// ==========================================

// @desc    Get detailed fee info for a single student
// @route   GET /api/v1/fees/students/:studentId
const getStudentFeeDetails = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Resolve studentId in case it's a user_id
  const { data: student } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_code, avatar_url")
    .or(`id.eq.${studentId},user_id.eq.${studentId}`)
    .single();

  if (!student) throw new ApiError(404, "Student not found");

  const actualStudentId = student.id;

  // Get fee plans
  const { data: feePlans, error: planError } = await supabase
    .from("student_fee_plans")
    .select(`
      *,
      courses(id, name, track)
    `)
    .eq("student_id", actualStudentId);

  if (planError) throw new ApiError(500, planError.message || "Failed to fetch fee plans");

  // Get all payments
  const { data: payments, error: payError } = await supabase
    .from("fee_payments")
    .select("*")
    .eq("student_id", actualStudentId)
    .order("paid_at", { ascending: false });

  if (payError) throw new ApiError(500, payError.message || "Failed to fetch payments");

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Calculate breakdowns for each plan
  const plans = (feePlans || []).map(plan => {
    const planPayments = (payments || []).filter(p => p.fee_plan_id === plan.id);
    const breakdown = calculateFeeBreakdown(plan, planPayments, currentMonth, currentYear);

    const totalCourseFeeVal = parseFloat(plan.total_fee) || 0;
    const remainingCourseFee = Math.max(0, totalCourseFeeVal - breakdown.totalPaid);

    let paymentStatus = 'Pending';
    if (remainingCourseFee === 0 && totalCourseFeeVal > 0) {
      paymentStatus = 'Full Paid';
    } else if (breakdown.totalPaid > 0 && breakdown.totalPaid < 10000) {
      paymentStatus = 'Partially Paid';
    } else {
      paymentStatus = 'Pending';
    }

    // Upcoming installment logic
    let upcomingInstallment = null;
    const enrollmentDateStr = plan.created_at;
    
    if (enrollmentDateStr) {
      const enrollmentDate = new Date(enrollmentDateStr);
      const dueDay = enrollmentDate.getDate();
      const currentDay = now.getDate();
      
      // Calculate how many months have passed since enrollment
      const monthsSinceEnrollment = (currentYear - enrollmentDate.getFullYear()) * 12 + (currentMonth - (enrollmentDate.getMonth() + 1));
      
      // Only show upcoming installment if at least 1 month has passed (due after a month)
      if (monthsSinceEnrollment >= 1 || (monthsSinceEnrollment === 0 && currentDay >= dueDay - 5)) {
        // We consider the due date "near" if we are within 5 days before the due day,
        // or up to the due day itself.
        const daysUntilDue = dueDay - currentDay;
        
        // If due date is near (within 5 days) and the balance hasn't maxed out the course fee
        if (daysUntilDue >= 0 && daysUntilDue <= 5) {
          // Check if there's any remaining balance after the upcoming installment
          const remainingTotal = (parseFloat(plan.total_fee) || 0) - breakdown.totalPaid;
          const monthlyAmount = parseFloat(plan.monthly_installment) || 10000;
          
          if (remainingTotal > 0 && remainingTotal > breakdown.totalDue - breakdown.totalPaid) {
             const amountDue = Math.min(monthlyAmount, remainingTotal);
             
             // Construct the due date for this month
             const dueDate = new Date(currentYear, currentMonth - 1, dueDay);
             
             upcomingInstallment = {
               amount: amountDue,
               dueDate: dueDate.toISOString(),
               daysRemaining: daysUntilDue
             };
          }
        }
      }
    }

    return {
      ...plan,
      payments: planPayments,
      breakdown,
      status: paymentStatus,
      upcomingInstallment
    };
  });

  return res.status(200).json(new ApiResponse(200, {
    student,
    plans,
    totalPayments: payments?.length || 0
  }, "Student fee details fetched successfully"));
});

// ==========================================
// 7. DELETE PAYMENT
// ==========================================

// @desc    Delete a payment record
// @route   DELETE /api/v1/fees/payments/:paymentId
const deletePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  const { data, error } = await supabase
    .from("fee_payments")
    .delete()
    .eq("id", paymentId)
    .select();

  if (error) throw new ApiError(500, error.message || "Failed to delete payment");
  if (!data || data.length === 0) throw new ApiError(404, "Payment not found");

  return res.status(200).json(new ApiResponse(200, {}, "Payment deleted successfully"));
});

// ==========================================
// 8. UPDATE PAYMENT
// ==========================================

// @desc    Update a payment record
// @route   PUT /api/v1/fees/payments/:paymentId
const updatePayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { amount, payment_method, payment_type, month, year, transaction_reference, notes } = req.body;

  const updates = {};
  if (amount !== undefined) {
    if (parseFloat(amount) <= 0) throw new ApiError(400, "Amount must be positive");
    updates.amount = parseFloat(amount);
  }
  if (payment_method !== undefined) updates.payment_method = payment_method.toUpperCase();
  if (payment_type !== undefined) updates.payment_type = payment_type;
  if (month !== undefined) updates.month = month;
  if (year !== undefined) updates.year = year;
  if (transaction_reference !== undefined) updates.transaction_reference = transaction_reference;
  if (notes !== undefined) updates.notes = notes;

  const { data, error } = await supabase
    .from("fee_payments")
    .update(updates)
    .eq("id", paymentId)
    .select(`
      *,
      students(id, first_name, last_name, student_code),
      student_fee_plans(id, course_id, courses(id, name))
    `);

  if (error) throw new ApiError(500, error.message || "Failed to update payment");
  if (!data || data.length === 0) throw new ApiError(404, "Payment not found");

  return res.status(200).json(new ApiResponse(200, data[0], "Payment updated successfully"));
});

// ==========================================
// 9. GET FEE SUMMARY (Dashboard Stats)
// ==========================================

// @desc    Get fee summary stats for dashboard
// @route   GET /api/v1/fees/summary
const getFeeSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Get all payments
  const { data: allPayments, error: payError } = await supabase
    .from("fee_payments")
    .select("amount, month, year, paid_at");

  if (payError) throw new ApiError(500, payError.message || "Failed to fetch payments");

  // Get all fee plans for outstanding calculation
  const { data: feePlans, error: planError } = await supabase
    .from("student_fee_plans")
    .select("*, students(status)");

  if (planError) throw new ApiError(500, planError.message || "Failed to fetch fee plans");

  // Calculate stats
  let thisMonthCollections = 0;
  let totalYearlyCollections = 0;

  (allPayments || []).forEach(payment => {
    const amt = parseFloat(payment.amount) || 0;
    if (payment.month === currentMonth && payment.year === currentYear) {
      thisMonthCollections += amt;
    }
    if (payment.year === currentYear) {
      totalYearlyCollections += amt;
    }
  });

  // Calculate outstanding fees
  let outstandingFees = 0;
  let outstandingCount = 0;

  (feePlans || []).forEach(plan => {
    // Only count active students
    if (plan.students?.status !== 'ACTIVE') return;

    const planPayments = (allPayments || []).filter(p => {
      // We need fee_plan_id but we only selected amount/month/year
      // Let's recalculate based on student payments
      return true; // include all for now
    });

    // Get payments for this specific plan
    const studentPlanPayments = [];
    // We need a better query — let's compute from fee plans
    const totalDue = calculateSimpleTotalDue(plan, currentMonth, currentYear);
    const studentPayments = (allPayments || []).filter(p => {
      // This is a simplified approach; the balances endpoint has full accuracy
      return false;
    });

    // For summary, we use a simpler calculation
    const admissionFee = parseFloat(plan.admission_fee) || 5000;
    const monthlyInstallment = parseFloat(plan.monthly_installment) || 10000;
    const startMonth = plan.start_month;
    const startYear = plan.start_year;

    if (startMonth && startYear) {
      const monthsElapsed = (currentYear - startYear) * 12 + (currentMonth - startMonth);
      let totalDueForPlan = admissionFee;
      if (monthsElapsed > 0) {
        totalDueForPlan += monthsElapsed * monthlyInstallment;
      }
      const totalCourseFee = parseFloat(plan.total_fee) || 0;
      if (totalCourseFee > 0 && totalDueForPlan > totalCourseFee) {
        totalDueForPlan = totalCourseFee;
      }

      // We can't easily get per-plan payments in this simplified query
      // The accurate calculation happens in getStudentBalances
      // For summary, we'll compute it differently
    }
  });

  // Better approach: Get balances data using the same logic
  const { data: allPaymentsDetailed, error: payDetailError } = await supabase
    .from("fee_payments")
    .select("amount, fee_plan_id, month, year");

  if (!payDetailError && feePlans) {
    outstandingFees = 0;
    outstandingCount = 0;

    feePlans.forEach(plan => {
      if (plan.students?.status !== 'ACTIVE') return;

      const planPayments = (allPaymentsDetailed || []).filter(p => p.fee_plan_id === plan.id);
      const breakdown = calculateFeeBreakdown(plan, planPayments, currentMonth, currentYear);

      if (breakdown.remainingBalance > 0) {
        outstandingFees += breakdown.remainingBalance;
        outstandingCount += 1;
      }
    });
  }

  return res.status(200).json(new ApiResponse(200, {
    thisMonthCollections,
    totalYearlyCollections,
    outstandingFees,
    outstandingCount,
    currentMonth,
    currentYear
  }, "Fee summary fetched successfully"));
});

// Simple total due calculator (used internally)
function calculateSimpleTotalDue(plan, month, year) {
  const admissionFee = parseFloat(plan.admission_fee) || 5000;
  const monthlyInstallment = parseFloat(plan.monthly_installment) || 10000;
  const startMonth = plan.start_month;
  const startYear = plan.start_year;

  if (!startMonth || !startYear) return 0;

  const monthsElapsed = (year - startYear) * 12 + (month - startMonth);
  let totalDue = admissionFee;
  if (monthsElapsed > 0) {
    totalDue += monthsElapsed * monthlyInstallment;
  }

  const totalCourseFee = parseFloat(plan.total_fee) || 0;
  if (totalCourseFee > 0 && totalDue > totalCourseFee) {
    totalDue = totalCourseFee;
  }

  return totalDue;
}

export {
  createFeePlan,
  getFeePlans,
  recordPayment,
  getPayments,
  getStudentBalances,
  getStudentFeeDetails,
  deletePayment,
  updatePayment,
  getFeeSummary
};
