import React, { useState, useEffect } from 'react';
import { CreditCard, Receipt, IndianRupee } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';

const StudentFees = ({ userInfo }) => {
  const [studentFees, setStudentFees] = useState([]);
  const [feeTotals, setFeeTotals] = useState({ total: 0, paid: 0, balance: 0, currentDue: 0, planStatus: 'Pending' });
  const [loading, setLoading] = useState(true);
  const [transactionPage, setTransactionPage] = useState(1);
  const transactionsPerPage = 5;

  const studentId = userInfo?.student_profile_id || userInfo?.id;
  const token = userInfo?.token || sessionStorage.getItem('token');

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
          if (plans.length > 0) {
            const plan = plans[0];
            const payments = plan.payments || [];
            
            // Format payments for the transaction table
            const formattedPayments = payments.map(p => ({
              id: p.id,
              course: plan.courses?.name || 'Enrolled Course',
              date: new Date(p.paid_at).toLocaleDateString(),
              type: p.payment_method || 'CASH',
              amount: p.amount,
              paidAmount: p.amount,
              status: 'Paid'
            }));
            
            setStudentFees(formattedPayments);
            
            const total = parseFloat(plan.total_fee) || 0;
            const paid = plan.breakdown?.totalPaid || 0;
            setFeeTotals({
              total: total,
              paid: paid,
              balance: Math.max(0, total - paid),
              currentDue: plan.breakdown?.currentMonthDue || 0,
              planStatus: plan.status || 'Pending'
            });
          }
        }
      } catch (err) {
        console.error("Error fetching fees:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, [studentId, token]);

  const currentMonthFee = { 
    amount: feeTotals.currentDue || 0, 
    status: feeTotals.planStatus || 'Not Paid' 
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
                    </div>
                  </div>
                  <div>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      currentMonthFee.status === 'Paid' 
                        ? 'bg-[#E5F7ED] text-[#008A2E] border-[#008A2E]/20' 
                        : 'bg-[#FDE2E2] text-[#D80000] border-[#D80000]/20'
                    }`}>
                      {currentMonthFee.status}
                    </span>
                  </div>
                </div>
              </div>
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
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-black text-emerald-600">₹{(Number(fee.paidAmount) || 0).toLocaleString()}</span>
                              <span className={`text-[10px] font-black uppercase tracking-wider mt-1 ${fee.status === 'Paid' || fee.status === 'Full Paid' ? 'text-emerald-500' : fee.status === 'Partially Paid' ? 'text-amber-500' : 'text-rose-500'}`}>
                                {fee.status}
                              </span>
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
