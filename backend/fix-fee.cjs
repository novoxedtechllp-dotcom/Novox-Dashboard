const fs = require('fs');
let content = fs.readFileSync('src/controllers/fee.controller.js', 'utf8');
const startIdx = content.indexOf('// 9. GET FEE SUMMARY');

if (startIdx !== -1) {
  const cleanContent = content.substring(0, startIdx);
  const newFunction = `// 9. GET FEE SUMMARY (Dashboard Stats)
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
    .select("amount, month, year, paid_at, student_id, fee_plan_id");

  if (payError) throw new ApiError(500, payError.message || "Failed to fetch payments");

  // Get all student courses (enrollments)
  const { data: enrollments, error: enrollError } = await supabase
    .from("student_courses")
    .select("student_id, course_id, enrolled_at, courses!inner(total_fee), students!inner(status)");

  if (enrollError) throw new ApiError(500, enrollError.message || "Failed to fetch enrollments");

  const { data: feePlans } = await supabase.from("student_fee_plans").select("*");

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

  (enrollments || []).forEach(enrollment => {
    if (enrollment.students?.status !== 'ACTIVE') return;

    let plan = (feePlans || []).find(fp => fp.student_id === enrollment.student_id && fp.course_id === enrollment.course_id);
    const courseFeeStr = enrollment.courses?.total_fee ? String(enrollment.courses.total_fee).replace(/[^0-9.]/g, '') : '0';
    const defaultTotalFee = parseFloat(courseFeeStr) || 0;

    if (!plan) {
      plan = {
        id: \`virtual-\${enrollment.student_id}-\${enrollment.course_id}\`,
        student_id: enrollment.student_id,
        course_id: enrollment.course_id,
        total_fee: defaultTotalFee,
        admission_fee: 5000,
        monthly_installment: 10000,
        created_at: enrollment.enrolled_at || new Date().toISOString()
      };
    } else if (!plan.total_fee) {
      plan.total_fee = defaultTotalFee;
    }

    const planPayments = (allPayments || []).filter(p => p.student_id === enrollment.student_id && p.fee_plan_id === plan.id);
    const breakdown = calculateFeeBreakdown(plan, planPayments, currentMonth, currentYear);

    if (breakdown.totalDue > breakdown.totalPaid) {
      outstandingFees += (breakdown.totalDue - breakdown.totalPaid);
      outstandingCount++;
    }
  });

  return res.status(200).json(new ApiResponse(200, {
    thisMonthCollections,
    totalYearlyCollections,
    outstandingFees,
    outstandingCount
  }, "Fee summary fetched successfully"));
});

export {
  calculateSimpleTotalDue,
  calculateFeeBreakdown,
  createFeePlan,
  recordPayment,
  getStudentBalances,
  getStudentFeeDetails,
  deletePayment,
  updatePayment,
  getFeeSummary
};
`;
  fs.writeFileSync('src/controllers/fee.controller.js', cleanContent + newFunction);
  console.log('Fixed');
}
