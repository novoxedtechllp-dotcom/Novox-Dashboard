import React, { useState, useMemo, useEffect } from 'react';
import { Download, Plus, DollarSign, Briefcase, MoreVertical, TrendingUp, CheckCircle, Eye, Edit, Trash2, Filter, Calendar, CreditCard, User, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const FeesContent = ({ searchQuery = '', setSearchQuery }) => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [feesList, setFeesList] = useState([]);
  const [studentBalancesList, setStudentBalancesList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollectionsMonth: 0,
    totalCollectionsYear: 0,
    outstandingFees: 0,
    outstandingCount: 0
  });

  // Filter state
  const [activeTab, setActiveTab] = useState('MONTH_TRANSACTIONS'); 
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) return;
      const headers = { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };

      // 1. Fetch Students
      let fetchedStudents = [];
      try {
        const studentsRes = await fetch('/api/v1/students?limit=1000', { headers });
        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          fetchedStudents = studentsData.data?.students || studentsData.data || [];
        }
      } catch (e) { console.warn(e); }
      setStudentsList(fetchedStudents);

      // 2. Fetch Courses
      let fetchedCourses = [];
      try {
        const coursesRes = await fetch('/api/v1/courses', { headers });
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          fetchedCourses = coursesData.data || [];
        }
      } catch (e) { console.warn(e); }
      setCoursesList(fetchedCourses);

      // 3. Fetch Summary Stats
      try {
        const summaryRes = await fetch(`/api/v1/fees/summary?month=${filterMonth + 1}&year=${filterYear}`, { headers });
        if (summaryRes.ok) {
          const d = await summaryRes.json();
          if (d.success && d.data) {
            setStats({
              totalCollectionsMonth: d.data.thisMonthCollections || 0,
              totalCollectionsYear: d.data.totalYearlyCollections || 0,
              outstandingFees: d.data.outstandingFees || 0,
              outstandingCount: d.data.outstandingCount || 0
            });
          }
        }
      } catch (e) { console.warn(e); }

      // 4. Fetch Student Balances FIRST so we can merge it
      let balancesMap = {};
      try {
        const balRes = await fetch(`/api/v1/fees/balances?month=${filterMonth + 1}&year=${filterYear}`, { headers });
        if (balRes.ok) {
          const d = await balRes.json();
          if (d.success && d.data) {
            const mappedBalances = (d.data || []).map(b => ({
              id: `bal-${b.id}`,
              feePlanId: b.feePlanId || (String(b.id).startsWith('virtual') ? null : b.id),
              studentId: b.studentId,
              studentCode: b.studentCode,
              name: b.name,
              initials: b.initials,
              course: b.course,
              totalCourseFee: b.totalCourseFee,
              totalPaidOverall: b.totalPaidOverall,
              remainingBalance: b.remainingBalance,
              currentMonthDue: b.currentMonthDue,
              paidThisMonth: b.paidThisMonth,
              status: b.status,
              courseId: b.courseId,
              dueDate: b.dueDate
            }));
            setStudentBalancesList(mappedBalances);
            balancesMap = mappedBalances.reduce((acc, b) => {
              acc[`${b.studentId}-${b.courseId}`] = b;
              return acc;
            }, {});
          }
        }
      } catch(e) { console.warn(e); }

      // 5. Fetch Month Transactions
      try {
        const payRes = await fetch(`/api/v1/fees/payments?month=${filterMonth + 1}&year=${filterYear}&limit=1000`, { headers });
        if (payRes.ok) {
          const d = await payRes.json();
          if (d.success && d.data) {
            const mappedFees = (d.data.payments || []).map(p => {
              const student = p.students || {};
              const plan = p.student_fee_plans || {};
              const courseName = plan.courses?.name || 'Unknown Course';
              const amount = parseFloat(p.amount) || 0;
              const totalCourseFee = parseFloat(plan.total_fee) || parseFloat(plan.admission_fee || 0) + parseFloat(plan.monthly_installment || 0); 
              const bal = balancesMap[`${p.student_id}-${plan.course_id}`];
              
              return {
                id: p.id,
                feePlanId: p.fee_plan_id,
                studentId: p.student_id,
                name: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
                initials: `${student.first_name?.[0] || ''}${student.last_name?.[0] || ''}`.toUpperCase() || 'ST',
                course: courseName,
                courseId: plan.course_id,
                type: p.payment_type || 'Installment',
                paymentMethod: p.payment_method || 'Cash',
                totalAmount: totalCourseFee,
                dueThisMonth: bal ? bal.currentMonthDue : null,
                paidAmount: amount,
                remainingBalance: Math.max(0, totalCourseFee - amount),
                amount: `₹${amount.toLocaleString()}`,
                date: new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: (amount > 0 && amount < 10000) ? 'Partially Paid' : 'Paid', 
                statusColor: (amount > 0 && amount < 10000) ? 'yellow' : 'green',
                numericAmount: amount
              };
            });
            setFeesList(mappedFees);
          }
        }
      } catch(e) { console.warn(e); }

    } catch (error) {
      console.error('Error fetching fees page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, [filterMonth, filterYear]);

  // Form states for Recording Fee Payment
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [paymentType, setPaymentType] = useState('Installment');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [totalAmountInput, setTotalAmountInput] = useState('');
  const [paidAmountInput, setPaidAmountInput] = useState('');

  const formatMonthDisplay = (monthIndex, yearValue) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[monthIndex]} ${yearValue}`;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.action-dropdown-container') && !e.target.closest('.action-dropdown-btn')) {
        setActiveDropdown(null);
      }
    };
    if (activeDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editBillingDateItem, setEditBillingDateItem] = useState(null);
  const [newBillingDate, setNewBillingDate] = useState('');
  const [editDueDateItem, setEditDueDateItem] = useState(null);
  const [newOverrideDate, setNewOverrideDate] = useState('');

  // Find selected student details to see their courses
  const selectedStudent = useMemo(() => {
    return studentsList.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, studentsList]);

  // Find their balance for the selected course
  const selectedStudentBalance = useMemo(() => {
    return studentBalancesList.find(b => String(b.studentId) === String(selectedStudentId) && String(b.courseId) === String(selectedCourseId));
  }, [selectedStudentId, selectedCourseId, studentBalancesList]);

  // Find their enrolled courses
  const studentCourses = useMemo(() => {
    if (!selectedStudent) return [];
    if (!selectedStudent.student_courses) return [];
    
    return selectedStudent.student_courses.map(sc => {
      const courseDetails = coursesList.find(c => c.id === sc.course_id);
      return {
        id: sc.course_id,
        name: courseDetails?.name || courseDetails?.title || 'Unknown Course'
      };
    });
  }, [selectedStudent, coursesList]);

  // If a student has no courses enrolled, fallback to all courses
  const coursesToSelect = useMemo(() => {
    if (studentCourses.length > 0) {
      return studentCourses;
    }
    return coursesList.map(c => ({ id: c.id, name: c.name || c.title || 'Unknown Course' }));
  }, [studentCourses, coursesList]);

  // Keep selected course ID in sync with the list
  useEffect(() => {
    if (coursesToSelect.length > 0) {
      const exists = coursesToSelect.some(c => c.id === selectedCourseId);
      if (!exists) {
        setSelectedCourseId(coursesToSelect[0].id);
      }
    } else {
      setSelectedCourseId('');
    }
  }, [coursesToSelect, selectedCourseId]);

  // Automatically fetch the total fee from the backend data when student/course changes
  useEffect(() => {
    if (selectedCourseId && selectedStudentId) {
      const student = studentsList.find(s => s.id === selectedStudentId);
      if (student) {
        const studentCourse = student.student_courses?.find(sc => sc.course_id === selectedCourseId);
        let totalCourseFee = 0;
        if (studentCourse) {
          const courseDetails = coursesList.find(c => c.id === studentCourse.course_id);
          totalCourseFee = parseInt(String(courseDetails?.total_fee || courseDetails?.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
        } else {
          const courseDetails = coursesList.find(c => c.id === selectedCourseId);
          totalCourseFee = parseInt(String(courseDetails?.total_fee || courseDetails?.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
        }
        setTotalAmountInput(totalCourseFee.toString());
      }
    } else {
      setTotalAmountInput('');
    }
  }, [selectedCourseId, selectedStudentId, studentsList, coursesList]);

  // Dynamic status previews inside Record Fee Payment modal
  const computedStatus = useMemo(() => {
    const total = parseFloat(totalAmountInput) || 0;
    const paid = parseFloat(paidAmountInput) || 0;
    if (total <= 0) return 'Pending';
    if (paid >= total) return 'Full Paid';
    if (paid > 0 && paid < 10000) return 'Partially Paid';
    if (paid >= 10000) return 'Paid';
    return 'Pending';
  }, [totalAmountInput, paidAmountInput]);

  const editComputedStatus = useMemo(() => {
    if (!editItem) return 'Pending';
    const total = parseFloat(editItem.totalAmount) || 0;
    const paid = parseFloat(editItem.paidAmount) || 0;
    if (total <= 0) return 'Pending';
    if (paid >= total) return 'Full Paid';
    if (paid > 0 && paid < 10000) return 'Partially Paid';
    if (paid >= 10000) return 'Paid';
    return 'Pending';
  }, [editItem?.totalAmount, editItem?.paidAmount]);

  const filteredData = useMemo(() => {
    if (activeTab === 'MONTH_TRANSACTIONS') {
      let filteredList = feesList;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        filteredList = filteredList.filter(item => {
          return item.name ? item.name.toLowerCase().includes(q) : false;
        });
      }
      // Note: filterStatus not very useful here since we just record payments, but we'll apply it if not 'All'
      // We'll leave it as is.
      return filteredList;
    } else {
      let filteredList = studentBalancesList;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        filteredList = filteredList.filter(item => {
          const matchesName = item.name ? item.name.toLowerCase().includes(q) : false;
          const matchesCode = item.studentCode ? item.studentCode.toLowerCase().includes(q) : false;
          return matchesName || matchesCode;
        });
      }
      if (filterStatus !== 'All') {
        filteredList = filteredList.filter(item => item.status === filterStatus);
      }
      return filteredList;
    }
  }, [feesList, studentBalancesList, activeTab, filterStatus, searchQuery]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const submitFees = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert("Please select a student");
      return;
    }
    const paidAmt = parseFloat(paidAmountInput) || 0;
    if (paidAmt <= 0) {
       alert("Amount must be positive");
       return;
    }

    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
      
      // We need a fee_plan_id. Try finding it from studentBalancesList
      let planId = null;
      const existingBal = studentBalancesList.find(b => String(b.studentId) === String(selectedStudentId) && String(b.courseId) === String(selectedCourseId));
      if (existingBal && existingBal.feePlanId && !String(existingBal.feePlanId).startsWith('virtual')) {
        planId = existingBal.feePlanId;
      }

      // If no planId, we must create a fee plan first
      if (!planId) {
        const planPayload = {
          student_id: selectedStudentId,
          course_id: selectedCourseId,
          total_fee: parseFloat(totalAmountInput) || 0
        };
        const planRes = await fetch('/api/v1/fees/plans', { method: 'POST', headers, body: JSON.stringify(planPayload) });
        if (!planRes.ok) {
           alert("Failed to create fee plan for student");
           return;
        }
        const planData = await planRes.json();
        planId = planData.data.id;
      }

      // Now record payment
      const paymentPayload = {
        student_id: selectedStudentId,
        fee_plan_id: planId,
        amount: paidAmt,
        payment_method: paymentMethod,
        payment_type: paymentType,
        month: filterMonth + 1,
        year: filterYear
      };

      const payRes = await fetch('/api/v1/fees/payments', { method: 'POST', headers, body: JSON.stringify(paymentPayload) });
      if (payRes.ok) {
        alert("Fees recorded successfully!");
        setIsModalOpen(false);
        setSelectedStudentId('');
        setTotalAmountInput('');
        setPaidAmountInput('');
        setPaymentType('Installment');
        setPaymentMethod('Cash');
        fetchBackendData(); // refresh all data
      } else {
        const err = await payRes.json();
        alert(err.message || "Failed to record payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing payment");
    }
  };

  const toggleDropdown = (id) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  const handleDelete = async (id) => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo.token}` };
      
      const res = await fetch(`/api/v1/fees/payments/${id}`, { method: 'DELETE', headers });
      if (res.ok) {
         alert("Record deleted successfully!");
         setActiveDropdown(null);
         fetchBackendData();
      } else {
         alert("Failed to delete payment");
      }
    } catch(err) {
      alert("Error deleting record");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
      
      const paidAmt = parseFloat(editItem.paidAmount) || 0;
      if (paidAmt <= 0) {
         alert("Amount must be positive");
         return;
      }

      const payload = {
        amount: paidAmt,
        payment_type: editItem.type,
      };

      const res = await fetch(`/api/v1/fees/payments/${editItem.id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      if (res.ok) {
         alert("Record updated successfully!");
         setEditItem(null);
         fetchBackendData();
      } else {
         alert("Failed to update payment");
      }
    } catch (err) {
       alert("Error updating payment");
    }
  };

  const handleEditBillingDateSubmit = async (e) => {
    e.preventDefault();
    if (!editBillingDateItem) return;
    
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
      
      let targetPlanId = editBillingDateItem.feePlanId;
      
      // Auto-create plan if missing
      if (!targetPlanId) {
        const createPayload = {
          student_id: editBillingDateItem.studentId,
          course_id: editBillingDateItem.courseId,
          total_fee: editBillingDateItem.totalCourseFee || 0,
          admission_fee: 5000,
          monthly_installment: 10000
        };
        const createRes = await fetch(`/api/v1/fees/plans`, { method: 'POST', headers, body: JSON.stringify(createPayload) });
        if (createRes.ok) {
          const resData = await createRes.json();
          targetPlanId = resData.data.id;
        } else {
          alert("Failed to initialize fee plan for this student.");
          return;
        }
      }
      
      const payload = { start_date: newBillingDate };
      const res = await fetch(`/api/v1/fees/plans/${targetPlanId}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      if (res.ok) {
        alert("Billing date updated successfully!");
        setEditBillingDateItem(null);
        setNewBillingDate('');
        fetchBackendData();
      } else {
        alert("Failed to update billing date");
      }
    } catch (err) {
      alert("Error updating billing date");
    }
  };

  const handleEditDueDateOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!editDueDateItem) return;
    
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const headers = { 'Authorization': `Bearer ${userInfo.token}`, 'Content-Type': 'application/json' };
      
      let targetPlanId = editDueDateItem.feePlanId;
      
      // Auto-create plan if missing
      if (!targetPlanId) {
        const createPayload = {
          student_id: editDueDateItem.studentId,
          course_id: editDueDateItem.courseId,
          total_fee: editDueDateItem.totalCourseFee || 0,
          admission_fee: 5000,
          monthly_installment: 10000
        };
        const createRes = await fetch(`/api/v1/fees/plans`, { method: 'POST', headers, body: JSON.stringify(createPayload) });
        if (createRes.ok) {
          const resData = await createRes.json();
          targetPlanId = resData.data.id;
        } else {
          alert("Failed to initialize fee plan for this student.");
          return;
        }
      }
      
      const payload = { 
        month: filterMonth + 1, 
        year: filterYear, 
        due_date: newOverrideDate 
      };
      const res = await fetch(`/api/v1/fees/plans/${targetPlanId}/due-date`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      if (res.ok) {
        alert("Due date updated successfully!");
        setEditDueDateItem(null);
        setNewOverrideDate('');
        fetchBackendData();
      } else {
        alert("Failed to update due date");
      }
    } catch (err) {
      alert("Error updating due date");
    }
  };

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
    doc.text(`Name: ${fee.name || 'Student'}`, 14, 52);
    doc.text(`Course: ${fee.course || 'N/A'}`, 14, 58);
    
    // Payment Details
    doc.setFontSize(14);
    doc.text('Payment Details', 14, 75);
    
    autoTable(doc, {
      startY: 82,
      head: [['Description', 'Payment Method', 'Amount Paid']],
      body: [
        [`Fee Payment - ${fee.type}`, fee.paymentMethod || 'Cash', `Rs. ${(fee.paid || fee.paidAmount || 0).toLocaleString()}`]
      ],
      headStyles: { fillColor: [0, 63, 135] }
    });
    
    // Footer
    const finalY = doc.lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text('Thank you for your payment.', 14, finalY + 20);
    doc.text('This is a computer-generated receipt and requires no signature.', 14, finalY + 26);
    
    doc.save(`Receipt_${fee.name ? fee.name.replace(/\s+/g, '_') : 'Student'}_${fee.id}.pdf`);
    setActiveDropdown(null);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Financial Dashboard - Fees Report", 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableColumn = ["Student Name", "Course", "Payment Type", "Payment Method", "Total Fee", "Paid Amount", "Remaining Balance", "Date", "Status"];
    const tableRows = filteredData.map(fee => {
      const total = typeof fee.totalAmount === 'number' 
        ? fee.totalAmount 
        : (typeof fee.numericAmount === 'number' ? fee.numericAmount : (parseInt(String(fee.amount || '').replace(/[^0-9]/g, ''), 10) || 0));
      const paid = typeof fee.paidAmount === 'number' 
        ? fee.paidAmount 
        : (fee.status === 'Pending' ? 0 : total);
      const balance = typeof fee.remainingBalance === 'number' 
        ? fee.remainingBalance 
        : Math.max(0, total - paid);
      
      return [
        fee.name,
        fee.course,
        fee.type,
        fee.paymentMethod || 'Cash',
        `INR ${total.toLocaleString()}`,
        `INR ${paid.toLocaleString()}`,
        `INR ${balance.toLocaleString()}`,
        fee.date,
        fee.status
      ];
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [0, 63, 135] }
    });
    
    doc.save(`fees_report_${new Date().getTime()}.pdf`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading fees data..." />;
  }

  return (
    <div className="p-[24px] flex flex-col gap-[24px] w-full relative bg-[#FAFBFC] min-h-full">
      {toast && (
        <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-xl font-bold text-sm transform transition-all duration-300 translate-y-0 opacity-100 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
          {toast.message}
        </div>
      )}
      {/* Header Container */}
      <div className="w-full flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Fee Management</h1>
          <p className="text-slate-500 mt-1">Track student payments, dues, and financial records.</p>
        </div>
        <div className="flex items-center gap-[12px]">
          <button onClick={handleExportPDF} className="bg-white border border-[#C2C6D4] shadow-sm text-[#555F6B] px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Download size={16} /> Export Summary
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-[#003F87] text-white px-[16px] py-[8px] rounded-[6px] text-[13px] font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors shadow-sm">
            <CreditCard size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col xl:flex-row items-start xl:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:border-blue-300 transition-colors w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-3 shrink-0">Status</span>
            <select 
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer relative py-0.5"
            >
              <option value="All">All Statuses</option>
              <option value="Full Paid">Fully Paid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Pending">Pending / Not Paid</option>
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 hover:border-blue-300 transition-colors w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-3 shrink-0">Month</span>
            <div className="relative">
              <button 
                type="button"
                onClick={() => {
                  setPickerYear(filterYear);
                  setIsDatePickerOpen(!isDatePickerOpen);
                }}
                className="flex items-center bg-transparent outline-none text-[13px] font-bold text-slate-700 justify-between gap-2 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>{formatMonthDisplay(filterMonth, filterYear)}</span>
                </div>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {isDatePickerOpen && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setIsDatePickerOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 bg-white border border-[#C2C6D4] rounded-xl shadow-xl z-[101] p-3 w-[260px] animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <button type="button" onClick={() => setPickerYear(y => y - 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 font-bold transition-all text-lg">&lsaquo;</button>
                      <span className="font-extrabold text-[14px] text-slate-800">{pickerYear}</span>
                      <button type="button" onClick={() => setPickerYear(y => y + 1)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 font-bold transition-all text-lg">&rsaquo;</button>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((monthName, idx) => {
                        const isSelected = filterMonth === idx && filterYear === pickerYear;
                        return (
                          <button
                            key={monthName}
                            type="button"
                            onClick={() => {
                              setFilterMonth(idx);
                              setFilterYear(pickerYear);
                              setCurrentPage(1);
                              setIsDatePickerOpen(false);
                            }}
                            className={`py-2 rounded-lg text-[12px] font-bold transition-all text-center ${
                              isSelected ? 'bg-[#003F87] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {monthName}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full bg-white border border-[#C2C6D4] rounded-[16px] flex flex-col overflow-hidden shadow-sm">
        
        {/* Tabs */}
        <div className="flex items-center h-[61px] border-b border-[#C2C6D4] px-[24px]">
          <button 
            onClick={() => setActiveTab('MONTH_TRANSACTIONS')}
            className={`h-full flex items-center gap-2 font-bold text-[14px] px-[8px] mr-[32px] transition-colors ${activeTab === 'MONTH_TRANSACTIONS' ? 'text-[#003F87] border-b-[3px] border-[#003F87]' : 'text-[#555F6B] hover:text-[#003F87]'}`}
          >
            <Calendar size={18} /> Month Transactions
          </button>
          <button 
            onClick={() => setActiveTab('DUE_THIS_MONTH')}
            className={`h-full flex items-center gap-2 font-bold text-[14px] px-[8px] transition-colors ${activeTab === 'DUE_THIS_MONTH' ? 'text-[#003F87] border-b-[3px] border-[#003F87]' : 'text-[#555F6B] hover:text-[#003F87]'}`}
          >
            <User size={18} /> Student Balances
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 border-b border-[#C2C6D4] h-auto xl:h-[136px]">
          <div className="p-[24px] flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">THIS MONTH COLLECTIONS</p>
            <h3 className="text-[32px] font-bold text-[#008A2E] leading-none mb-2">₹{stats.totalCollectionsMonth.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#555F6B]">
              <Calendar size={12} /> {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][filterMonth]} {filterYear}
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center border-b xl:border-b-0 xl:border-r border-[#C2C6D4]">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">OUTSTANDING FEES</p>
            <h3 className="text-[32px] font-bold text-[#D80000] leading-none mb-2">₹{stats.outstandingFees.toLocaleString()}</h3>
            <div className="flex items-center gap-1 text-[11px] text-[#555F6B]">
              From {stats.outstandingCount} student{stats.outstandingCount !== 1 && 's'}
            </div>
          </div>
          <div className="p-[24px] flex flex-col justify-center">
            <p className="text-[11px] font-bold text-[#555F6B] uppercase tracking-wider mb-2">TOTAL YEARLY COLLECTIONS</p>
            <h3 className="text-[32px] font-bold text-slate-900 leading-none mb-2">₹{stats.totalCollectionsYear.toLocaleString()}</h3>

          </div>
        </div>



        {/* Table */}
        <div className="w-full overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              {activeTab === 'MONTH_TRANSACTIONS' ? (
                <tr className="border-b border-[#C2C6D4] bg-white">
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-left">Student Name</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-left">Course</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-center">Payment Type</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-center">Payment Method</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Total Fee</th>

                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Paid Amount</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Remaining Balance</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-left">Date</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-left">Status</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Action</th>
                </tr>
              ) : (
                <tr className="border-b border-[#C2C6D4] bg-white">
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-left">Student Details</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-left">Course</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Due This Month</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Due Date</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Paid This Month</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Total Fee</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Overall Paid</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Remaining Balance</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-left">Status</th>
                  <th className="py-4 px-4 text-[11px] font-bold text-[#555F6B] uppercase tracking-wider whitespace-nowrap text-right">Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'MONTH_TRANSACTIONS' ? "9" : "8"} className="py-[32px] px-[24px] text-center text-[14px] text-[#555F6B]">
                    {activeTab === 'MONTH_TRANSACTIONS' ? 'No fee records found for this month.' : 'No students found.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => {
                  if (activeTab === 'MONTH_TRANSACTIONS') {
                    const fee = item;
                    const total = typeof fee.totalAmount === 'number' 
                      ? fee.totalAmount 
                      : (typeof fee.numericAmount === 'number' ? fee.numericAmount : (parseInt(String(fee.amount || '').replace(/[^0-9]/g, ''), 10) || 0));
                    const paid = typeof fee.paidAmount === 'number' 
                      ? fee.paidAmount 
                      : (fee.status === 'Pending' ? 0 : total);
                    const balance = typeof fee.remainingBalance === 'number' 
                      ? fee.remainingBalance 
                      : Math.max(0, total - paid);

                    return (
                      <tr key={fee.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] bg-[#E5F0FF] text-[#003F87]`}>
                              {fee.initials}
                            </div>
                            <div className="text-[13px] font-bold text-slate-900 leading-tight">
                              {fee.name}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-[13px] text-[#555F6B] leading-tight">
                            {fee.course}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-block text-[11px] font-bold px-[12px] py-[4px] rounded-full border ${
                            fee.type === 'Full' ? 'bg-[#E5F0FF] text-[#003F87] border-[#003F87]' : 'bg-[#F8FAFC] text-[#555F6B] border-[#C2C6D4]'
                          }`}>
                            {fee.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-[13px] text-slate-700 font-medium">
                            {fee.paymentMethod || 'Cash'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-[14px] text-slate-600 font-medium">₹{total.toLocaleString()}</div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="text-[14px] font-bold text-[#003F87]">₹{paid.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className={`text-[14px] font-bold ${balance > 0 ? 'text-[#D80000]' : 'text-slate-500'}`}>₹{balance.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-[13px] text-[#555F6B] leading-tight">
                            {fee.date}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          {fee.statusColor === 'green' && (
                            <span className="inline-flex items-center gap-2 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> {fee.status}
                            </span>
                          )}
                          {fee.statusColor === 'yellow' && (
                            <div className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#B26E00] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#B26E00] shrink-0"></span> 
                              <span className="leading-tight text-left">Partially Paid</span>
                            </div>
                          )}
                          {fee.statusColor === 'red' && (
                            <span className="inline-flex items-center gap-2 bg-[#FDE2E2] text-[#D80000] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#D80000]"></span> {fee.status}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right relative">
                          <button 
                            onClick={() => toggleDropdown(fee.id)} 
                            className="w-[32px] h-[32px] flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-[#003F87] hover:border-[#003F87] hover:bg-blue-50 transition-all ml-auto action-dropdown-btn"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeDropdown === fee.id && (
                            <div className={`absolute right-[24px] ${index >= paginatedData.length - 2 && paginatedData.length > 2 ? 'bottom-[40px]' : 'top-[40px]'} bg-white border border-[#C2C6D4] shadow-lg rounded-md w-[140px] z-50 flex flex-col overflow-hidden action-dropdown-container`}>
                              <button onClick={() => { setViewItem(fee); setActiveDropdown(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"><Eye size={14} /> View Details</button>
                              <button onClick={() => handleDownloadInvoice(fee)} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"><Download size={14} /> Download Invoice</button>
                              <button onClick={() => { setEditItem(fee); setActiveDropdown(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left"><Edit size={14} /> Edit Record</button>
                              <button onClick={() => handleDelete(fee.id)} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"><Trash2 size={14} /> Delete</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  } else {
                    const due = item;
                    return (
                      <tr key={due.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 font-bold text-[11px] bg-[#E5F0FF] text-[#003F87]`}>
                              {due.initials}
                            </div>
                            <div className="text-[13px] font-bold text-slate-900 leading-tight">
                              {due.name}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-[13px] text-[#555F6B] leading-tight">{due.course}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-[14px] font-bold text-slate-800">₹{(due.currentMonthDue || 0).toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[14px] text-[#555F6B] font-medium">
                              {due.dueDate ? new Date(due.dueDate).toLocaleDateString() : 'N/A'}
                            </span>
                            <button 
                              onClick={() => {
                                setEditDueDateItem(due);
                                setNewOverrideDate(due.dueDate ? due.dueDate.split('T')[0] : '');
                              }}
                              className="w-[24px] h-[24px] flex items-center justify-center rounded-full text-slate-400 hover:text-[#003F87] hover:bg-blue-50 transition-all"
                              title="Edit Due Date"
                            >
                              <Edit size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-[14px] font-bold text-[#003F87]">₹{(due.paidThisMonth || 0).toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-[14px] text-slate-600 font-medium">₹{due.totalCourseFee.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="text-[14px] font-bold text-[#008A2E]">₹{due.totalPaidOverall.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className={`text-[14px] font-bold ${due.remainingBalance > 0 ? 'text-[#D80000]' : 'text-slate-500'}`}>₹{due.remainingBalance.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          {due.status === 'Full Paid' ? (
                            <span className="inline-flex items-center gap-2 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> Fully Paid
                            </span>
                          ) : due.status === 'Paid' ? (
                            <span className="inline-flex items-center gap-2 bg-[#E5F7ED] text-[#008A2E] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#008A2E]"></span> Paid
                            </span>
                          ) : due.status === 'Partially Paid' ? (
                            <div className="inline-flex items-center gap-2 bg-[#FFF4E5] text-[#B26E00] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#B26E00] shrink-0"></span> 
                              <span className="leading-tight text-left">Partially Paid</span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-2 bg-[#FDE2E2] text-[#D80000] px-[12px] py-[4px] rounded-full text-[11px] font-bold">
                              <span className="w-[6px] h-[6px] rounded-full bg-[#D80000]"></span> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right relative">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedStudentId(due.studentId || due.id);
                                const cId = due.courseId || (due.student_courses && due.student_courses[0]?.course_id);
                                setSelectedCourseId(cId);
                                setIsModalOpen(true);
                              }}
                              className="w-[32px] h-[32px] flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-[#003F87] hover:border-[#003F87] hover:bg-blue-50 transition-all"
                              title="Record Payment"
                            >
                              <Plus size={14} />
                            </button>
                            <button 
                              onClick={() => setEditBillingDateItem(due)}
                              className="w-[32px] h-[32px] flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-[#003F87] hover:border-[#003F87] hover:bg-blue-50 transition-all"
                              title="Edit Billing Date"
                            >
                              <Calendar size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-[16px] px-[24px] bg-white flex justify-between items-center border-t border-[#C2C6D4]">
          <div className="text-[13px] text-[#555F6B] font-medium">
            Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 transition-colors ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ChevronLeft size={18} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                  currentPage === page 
                    ? 'bg-[#003F87] text-white' 
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 transition-colors ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

      </div>

      {/* Record Fee Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Record Fee Payment</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={submitFees} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Student *</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white text-slate-850"
                >
                  <option value="">-- Choose Student --</option>
                  {studentsList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name} ({s.student_code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Course *</label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  disabled={!selectedStudentId || coursesToSelect.length === 0}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white disabled:bg-slate-50 text-slate-850"
                >
                  {coursesToSelect.length === 0 ? (
                    <option value="">-- No Courses Enrolled --</option>
                  ) : (
                    coursesToSelect.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Type</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white text-slate-850"
                  >
                    <option value="Full">Full Payment</option>
                    <option value="Installment">Installment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white text-slate-850"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Netbanking">Netbanking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paid Amount (₹) *</label>
                  <input 
                    type="number" 
                    required 
                    value={paidAmountInput}
                    onChange={(e) => setPaidAmountInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-850" 
                    placeholder="e.g. 9000" 
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 mt-2 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700">Due This Month:</span>
                  <span className="text-base font-bold text-[#003F87]">
                    {selectedStudentBalance?.currentMonthDue !== undefined ? `₹${selectedStudentBalance.currentMonthDue.toLocaleString()}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-2">
                  <span className="text-sm font-bold text-slate-700">Remaining Balance:</span>
                  <span className="text-base font-bold text-[#D80000]">
                    ₹{Math.max(0, (parseFloat(totalAmountInput) || 0) - (parseFloat(paidAmountInput) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewItem && (() => {
        const total = typeof viewItem.totalAmount === 'number' 
          ? viewItem.totalAmount 
          : (typeof viewItem.numericAmount === 'number' ? viewItem.numericAmount : (parseInt(String(viewItem.amount || '').replace(/[^0-9]/g, ''), 10) || 0));
        const paid = typeof viewItem.paidAmount === 'number' 
          ? viewItem.paidAmount 
          : (viewItem.status === 'Pending' ? 0 : total);
        const balance = typeof viewItem.remainingBalance === 'number' 
          ? viewItem.remainingBalance 
          : Math.max(0, total - paid);

        return (
          <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">Fee Details</h2>
                <button onClick={() => setViewItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Student Name</span>
                    <span className="text-sm font-semibold text-slate-900">{viewItem.name}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Course</span>
                    <span className="text-sm font-semibold text-slate-900">{viewItem.course}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Payment Type</span>
                    <span className="text-sm font-semibold text-slate-900">{viewItem.type}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Total Fee</span>
                    <span className="text-sm font-semibold text-slate-900">₹{total.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Paid Amount</span>
                    <span className="text-sm font-semibold text-[#003F87] font-bold">₹{paid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Remaining Balance</span>
                    <span className="text-sm font-semibold text-[#D80000] font-bold">₹{balance.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Date</span>
                    <span className="text-sm font-semibold text-slate-900">{viewItem.date}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-500 uppercase">Status</span>
                    <span className={`text-sm font-bold ${viewItem.statusColor === 'green' ? 'text-[#008A2E]' : viewItem.statusColor === 'yellow' ? 'text-[#B26E00]' : 'text-[#D80000]'}`}>{viewItem.status}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                  <button onClick={() => setViewItem(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Edit Record Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Edit Fee Record</h2>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student Name</label>
                <input type="text" disabled className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none bg-slate-50 text-sm font-medium" value={editItem.name} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Fee (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={editItem.totalAmount || 0} 
                    onChange={(e) => {
                      const total = parseFloat(e.target.value) || 0;
                      setEditItem({
                        ...editItem,
                        totalAmount: total,
                        remainingBalance: Math.max(0, total - (editItem.paidAmount || 0))
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-850" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Paid Amount (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={editItem.paidAmount || 0} 
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0;
                      setEditItem({
                        ...editItem,
                        paidAmount: paid,
                        remainingBalance: Math.max(0, (editItem.totalAmount || 0) - paid)
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-850" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Payment Type</label>
                  <select
                    value={editItem.type || 'Full'}
                    onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm bg-white text-slate-850"
                  >
                    <option value="Full">Full Payment</option>
                    <option value="Installment">Installment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status (Calculated)</label>
                  <div className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm font-semibold text-slate-700">
                    {editComputedStatus}
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-700">Remaining Balance:</span>
                <span className="text-base font-bold text-[#D80000]">
                  ₹{Math.max(0, (editItem.totalAmount || 0) - (editItem.paidAmount || 0)).toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setEditItem(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Billing Date Modal */}
      {editBillingDateItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Edit Billing Date</h2>
              <button onClick={() => setEditBillingDateItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditBillingDateSubmit} className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Change the billing start date for <strong>{editBillingDateItem.name}</strong>. The 28-day billing cycle will be calculated from this new date.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Start Date</label>
                <input 
                  type="date" 
                  required 
                  value={newBillingDate} 
                  onChange={(e) => setNewBillingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-850" 
                />
              </div>
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setEditBillingDateItem(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Due Date Override Modal */}
      {editDueDateItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Edit Due Date</h2>
              <button onClick={() => setEditDueDateItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleEditDueDateOverrideSubmit} className="p-6 flex flex-col gap-4">
              <p className="text-sm text-slate-600">
                Change the due date for <strong>{editDueDateItem.name}</strong> for the month of <strong>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][filterMonth]} {filterYear}</strong>.
              </p>
              <p className="text-xs text-amber-600 font-medium">
                Note: This change applies ONLY to this selected month. Next month will revert to the original due date.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Due Date</label>
                <input 
                  type="date" 
                  required 
                  value={newOverrideDate} 
                  onChange={(e) => setNewOverrideDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-[#003F87] text-sm text-slate-850" 
                />
              </div>
              <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={() => setEditDueDateItem(null)} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white hover:bg-[#002B5E]">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeesContent;
