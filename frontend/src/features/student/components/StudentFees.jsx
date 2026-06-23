import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, IndianRupee, Download } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const StudentFees = ({ userInfo }) => {
  const [allPlans, setAllPlans] = useState([]);
  const [activePlanIdx, setActivePlanIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionsPerPage = 5;

  const studentId = userInfo?.student_profile_id || userInfo?.id;
  const token = userInfo?.token || sessionStorage.getItem('token');

  const handleDownloadInvoice = (fee) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(0, 63, 135);
    doc.text('Novox EdTech', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Payment Receipt', 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.text(`Date: ${fee.date}`, 140, 22);
    doc.text(`Receipt ID: ${fee.id}`, 140, 30);

    // Student Info
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Student Details', 14, 45);
    doc.setFontSize(10);
    const studentName = userInfo?.first_name 
      ? `${userInfo.first_name} ${userInfo.last_name || ''}`.trim() 
      : 'Student';
    doc.text(`Name: ${studentName}`, 14, 52);
    doc.text(`Course: ${fee.course || 'N/A'}`, 14, 58);
    
    // Payment Details
    doc.setFontSize(14);
    doc.text('Payment Details', 14, 75);
    
    autoTable(doc, {
      startY: 82,
      head: [['Description', 'Payment Method', 'Amount Paid']],
      body: [
        [`Fee Payment - ${fee.status}`, fee.type || 'Cash', `Rs. ${(fee.paidAmount || 0).toLocaleString()}`]
      ],
      headStyles: { fillColor: [0, 63, 135] }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text('Thank you for your payment.', 14, finalY + 20);
    doc.text('This is a computer-generated receipt and requires no signature.', 14, finalY + 26);
    
    doc.save(`Receipt_${studentName.replace(/\s+/g, '_')}_${fee.id}.pdf`);
  };

  useEffect(() => {
    const fetchFees = async () => {
      if (!studentId || !token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/v1/fees/students/${studentId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const feesData = await res.json();
          const plans = feesData.data?.plans || [];
          setAllPlans(plans);
        }
      } catch (err) {
        console.error("Error fetching fees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [studentId, token]);

  const activePlan = allPlans[activePlanIdx] || null;

  const studentFees = activePlan?.payments 
    ? activePlan.payments.map(p => ({
        id: p.id,
        course: activePlan.courses?.name || 'Enrolled Course',
        date: new Date(p.paid_at).toLocaleDateString(),
        type: p.payment_method || 'CASH',
        amount: p.amount,
        paidAmount: p.amount,
        status: 'Paid'
      })) 
    : [];

  const feeTotals = activePlan 
    ? {
        total: parseFloat(activePlan.total_fee) || 0,
        paid: activePlan.breakdown?.totalPaid || 0,
        balance: Math.max(0, (parseFloat(activePlan.total_fee) || 0) - (activePlan.breakdown?.totalPaid || 0)),
        currentDue: activePlan.breakdown?.currentMonthDue || 0,
        nextDueDate: activePlan.dueDate || null,
        planStatus: activePlan.status || 'Pending'
      }
    : { total: 0, paid: 0, balance: 0, currentDue: 0, planStatus: 'Pending' };

  let upcomingSchedule = [];
  if (activePlan) {
    const instAmt = parseFloat(activePlan.monthly_installment) || 10000;
    let tempRem = feeTotals.balance;
    let currentDueAmt = activePlan.breakdown?.currentMonthDue || 0;
    let firstDate = activePlan.dueDate ? new Date(activePlan.dueDate) : new Date();

    if (currentDueAmt > 0) {
      upcomingSchedule.push({
        date: firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: Math.min(tempRem, currentDueAmt),
        status: 'Due Now'
      });
      tempRem -= currentDueAmt;
    } else if (tempRem > 0 && activePlan.upcomingInstallment?.dueDate) {
      firstDate = new Date(activePlan.upcomingInstallment.dueDate);
      const amt = Math.min(tempRem, instAmt);
      upcomingSchedule.push({
        date: firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: amt,
        status: 'Upcoming'
      });
      tempRem -= amt;
    }

    let baseCycleDate = activePlan.breakdown?.nextDueDate ? new Date(activePlan.breakdown.nextDueDate) : firstDate;
    let step = currentDueAmt > 0 ? 0 : 1;
    
    while (tempRem > 0 && upcomingSchedule.length < 5) {
      const nextDate = new Date(baseCycleDate.getTime() + (step * 28 * 24 * 60 * 60 * 1000));
      const amt = Math.min(tempRem, instAmt);
      upcomingSchedule.push({
        date: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: amt,
        status: 'Upcoming'
      });
      tempRem -= amt;
      step++;
    }
  }

  const currentMonthFee = { 
    amount: feeTotals.currentDue || 0, 
    status: feeTotals.planStatus || 'Not Paid',
    nextDate: feeTotals.nextDueDate ? new Date(feeTotals.nextDueDate).toLocaleDateString() : null
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFBFC] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full pb-10">
        
        {/* Header Section */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Financial Overview</h1>
            <p className="text-slate-500 mt-1">View your course fees, tracking remaining balances, and recent payments.</p>
          </div>
        </div>

        {!loading && allPlans.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
            {allPlans.map((plan, idx) => (
              <button
                key={plan.id}
                onClick={() => { setActivePlanIdx(idx); setTransactionPage(1); }}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-bold text-sm transition-all ${
                  activePlanIdx === idx 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {plan.courses?.name || 'Enrolled Course'}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex-1 min-h-[300px] flex flex-col relative rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden">
            <LoadingSpinner text="Loading financial details..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Summary */}
            <div className="lg:col-span-1 flex flex-col gap-4 h-full">
              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Course Fees</p>
                    <h4 className="text-lg font-black text-slate-800">₹{feeTotals.total.toLocaleString()}</h4>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <IndianRupee size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Amount Paid</p>
                    <h4 className="text-lg font-black text-emerald-600">₹{feeTotals.paid.toLocaleString()}</h4>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Remaining Balance</p>
                    <h4 className="text-lg font-black text-slate-800">₹{feeTotals.balance.toLocaleString()}</h4>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex-1 flex flex-col justify-center">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <Receipt size={20} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This Month's Fee</p>
                      <h4 className="text-lg font-black text-slate-800">₹{currentMonthFee.amount.toLocaleString()}</h4>
                      {currentMonthFee.nextDate && (
                        <p className="text-xs text-slate-500 mt-1 font-medium">Due: {currentMonthFee.nextDate}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      currentMonthFee.status === 'Paid' || currentMonthFee.status === 'Full Paid'
                        ? 'bg-[#E5F7ED] text-[#008A2E] border-[#008A2E]/20' 
                        : currentMonthFee.status === 'Partially Paid'
                        ? 'bg-[#FFF4E5] text-[#B26E00] border-[#B26E00]/20'
                        : 'bg-[#FDE2E2] text-[#D80000] border-[#D80000]/20'
                    }`}>
                      {currentMonthFee.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Dues Schedule */}
              {upcomingSchedule.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col mt-2">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-4">Upcoming Schedule</h4>
                  <div className="flex flex-col gap-3">
                    {upcomingSchedule.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.date}</p>
                          <p className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${item.status === 'Due Now' ? 'text-[#D80000]' : 'text-slate-400'}`}>
                            {item.status}
                          </p>
                        </div>
                        <span className="text-sm font-black text-slate-800">₹{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Transaction History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-full flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Recent Transactions</h4>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  {studentFees.length > 0 ? (
                    <div className="flex flex-col h-full">
                      <div className="flex flex-col gap-3 min-h-[340px]">
                        {studentFees.slice((transactionPage - 1) * transactionsPerPage, transactionPage * transactionsPerPage).map((fee, idx) => (
                          <div key={fee.id || idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-slate-50/50">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-800">{fee.course} Fee Payment</span>
                              <span className="text-xs font-medium text-slate-500 mt-0.5">{fee.date} • {fee.type}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-emerald-600">₹{(Number(fee.paidAmount) || 0).toLocaleString()}</span>
                                <span className={`text-[10px] font-black uppercase tracking-wider mt-1 ${fee.status === 'Paid' || fee.status === 'Full Paid' ? 'text-emerald-500' : fee.status === 'Partially Paid' ? 'text-amber-500' : 'text-rose-500'}`}>
                                  {fee.status}
                                </span>
                              </div>
                              <button 
                                onClick={() => handleDownloadInvoice(fee)} 
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#003F87] hover:border-[#003F87] hover:bg-blue-50 transition-all"
                                title="Download Receipt"
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {studentFees.length > transactionsPerPage && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center items-center gap-2">
                          <button 
                            onClick={() => setTransactionPage(p => Math.max(1, p - 1))}
                            disabled={transactionPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                          >&lt;</button>
                          {Array.from({ length: Math.ceil(studentFees.length / transactionsPerPage) }, (_, i) => i + 1).map(page => (
                            <button 
                              key={page}
                              onClick={() => setTransactionPage(page)}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg border font-bold transition-colors ${
                                transactionPage === page 
                                  ? 'bg-[#003F87] border-[#003F87] text-white' 
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button 
                            onClick={() => setTransactionPage(p => Math.min(Math.ceil(studentFees.length / transactionsPerPage), p + 1))}
                            disabled={transactionPage === Math.ceil(studentFees.length / transactionsPerPage)}
                            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                          >&gt;</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8">
                      <Receipt size={32} className="mb-3 text-slate-300" />
                      <p className="text-sm font-bold">No transactions found</p>
                      <p className="text-xs text-slate-400 mt-1">There are no fee records available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFees;
