import React, { useState, useEffect } from 'react';
import { Landmark, Download, FileText, CheckCircle, Calendar, IndianRupee } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const EmployeePayroll = () => {
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        const empId = userInfo?.employeeId || userInfo?.id;
        
        if (!empId) {
          showToast("User ID not found.");
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/v1/payroll/employee/${empId}`, {
          headers: { 'Authorization': `Bearer ${userInfo?.token}` }
        });
        const resData = await response.json();
        
        if (response.ok) {
          setPayslips(resData.data || []);
        } else {
          showToast(`Error: ${resData.message}`);
        }
      } catch (err) {
        showToast("Failed to fetch payslips.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const formatMonthDisplay = (year, month) => {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleDownloadInvoice = (payslip) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(0, 63, 135); // #003F87
    doc.text("NOVOX", 105, 20, null, null, "center");
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Salary Slip / Invoice", 105, 30, null, null, "center");
    
    doc.setFontSize(12);
    doc.text(`Month: ${formatMonthDisplay(payslip.year, payslip.month)}`, 105, 40, null, null, "center");
    
    doc.setLineWidth(0.5);
    doc.line(15, 45, 195, 45);

    // Employee Details
    doc.setFontSize(11);
    doc.text(`Employee Name: ${userInfo.name || 'Employee'}`, 15, 55);
    doc.text(`Payment Date: ${new Date(payslip.payment_date).toLocaleDateString()}`, 15, 65);
    doc.text(`Status: ${payslip.status}`, 15, 75);

    // Salary Table
    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Amount (INR)']],
      body: [
        ['Basic Salary', `Rs. ${Number(payslip.basic_salary).toLocaleString('en-IN', {minimumFractionDigits: 2})}`],
        ['Deductions (Absent Days & Half Days)', `- Rs. ${Number(payslip.deductions).toLocaleString('en-IN', {minimumFractionDigits: 2})}`],
        ['Bonus', `+ Rs. ${Number(payslip.bonus || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}`]
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 63, 135] }
    });

    const finalY = doc.lastAutoTable.finalY || 85;

    // Total
    doc.setFontSize(14);
    doc.setTextColor(0, 138, 46); // Green
    doc.text(`Net Payable: Rs. ${Number(payslip.net_salary).toLocaleString('en-IN', {minimumFractionDigits: 2})}`, 15, finalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("This is a computer generated document and requires no signature.", 105, 280, null, null, "center");

    doc.save(`Payslip_${formatMonthDisplay(payslip.year, payslip.month).replace(' ', '_')}.pdf`);
    showToast("Invoice downloaded successfully!");
  };

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 w-full relative bg-[#F8FAFC] min-h-screen">
      
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] bg-[#003F87] text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle size={16} />
          {toastMessage}
        </div>
      )}

      <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-[24px] font-bold text-[#003F87] leading-tight">My Payroll & Payslips</h1>
          <div className="hidden md:block h-6 w-[1px] bg-[#C2C6D4]"></div>
          <div className="flex items-center gap-1.5 text-slate-500 text-[13px] font-medium mt-0.5">
            <Landmark size={15} className="text-slate-400" />
            <span>View your historical payroll data and download invoices</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-medium">Loading your payslips...</div>
        ) : payslips.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Payslips Found</h3>
            <p className="text-slate-500 text-sm mt-1">Your generated payslips will appear here after they are processed by the Admin.</p>
          </div>
        ) : (
          payslips.map(payslip => (
            <div key={payslip.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent -mr-4 -mt-4 rounded-full opacity-50 pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#003F87]/10 flex items-center justify-center text-[#003F87]">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-slate-900">{formatMonthDisplay(payslip.year, payslip.month)}</h3>
                    <p className="text-[12px] text-slate-500 font-medium">Processed on {new Date(payslip.payment_date).toLocaleDateString()}</p>
                  </div>
                </div>
                {payslip.status === 'PAID' && (
                  <span className="bg-[#E5F7ED] text-[#008A2E] px-2.5 py-1 rounded-full text-[10px] font-bold">PAID</span>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">Base Salary</span>
                  <span className="font-semibold text-slate-800">₹{Number(payslip.basic_salary).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-slate-500">Deductions</span>
                  <span className="font-semibold text-red-500">-₹{Number(payslip.deductions).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between">
                  <span className="font-bold text-slate-900 text-[14px]">Net Paid</span>
                  <span className="font-black text-[#003F87] text-[16px]">₹{Number(payslip.net_salary).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
              </div>

              <button 
                onClick={() => handleDownloadInvoice(payslip)}
                className="w-full py-2.5 rounded-xl border-2 border-slate-100 hover:border-[#003F87] hover:bg-[#003F87] hover:text-white text-slate-600 font-bold flex items-center justify-center gap-2 transition-all text-[13px]"
              >
                <Download size={16} /> Download Invoice
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default EmployeePayroll;
