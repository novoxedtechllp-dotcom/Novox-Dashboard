const fs = require('fs');

const filePath = 'd:\\NovoxDashboard\\frontend\\src\\features\\admin\\components\\FeesContent.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const newLogic = `
const FeesContent = () => {
  const [toast, setToast] = useState(null);
  const alert = (message) => {
    const isError = typeof message === 'string' && (message.toLowerCase().includes('failed') || message.toLowerCase().includes('error'));
    setToast({ message, type: isError ? 'error' : 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const [searchQuery, setSearchQuery] = useState('');
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
      const headers = { 'Authorization': \`Bearer \${userInfo.token}\`, 'Content-Type': 'application/json' };

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
        const summaryRes = await fetch('/api/v1/fees/summary', { headers });
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

      // 4. Fetch Month Transactions
      try {
        const payRes = await fetch(\`/api/v1/fees/payments?month=\${filterMonth + 1}&year=\${filterYear}&limit=1000\`, { headers });
        if (payRes.ok) {
          const d = await payRes.json();
          if (d.success && d.data) {
            const mappedFees = (d.data.payments || []).map(p => {
              const student = p.students || {};
              const plan = p.student_fee_plans || {};
              const courseName = plan.courses?.name || 'Unknown Course';
              const amount = parseFloat(p.amount) || 0;
              const totalCourseFee = parseFloat(plan.total_fee) || parseFloat(plan.admission_fee || 0) + parseFloat(plan.monthly_installment || 0); 
              
              return {
                id: p.id,
                feePlanId: p.fee_plan_id,
                studentId: p.student_id,
                name: \`\${student.first_name || ''} \${student.last_name || ''}\`.trim(),
                initials: \`\${student.first_name?.[0] || ''}\${student.last_name?.[0] || ''}\`.toUpperCase() || 'ST',
                course: courseName,
                courseId: plan.course_id,
                type: p.payment_type || 'Installment',
                paymentMethod: p.payment_method || 'Cash',
                totalAmount: totalCourseFee,
                paidAmount: amount,
                remainingBalance: Math.max(0, totalCourseFee - amount),
                amount: \`₹\${amount.toLocaleString()}\`,
                date: new Date(p.paid_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: 'Full Paid', 
                statusColor: 'green',
                numericAmount: amount
              };
            });
            setFeesList(mappedFees);
          }
        }
      } catch(e) { console.warn(e); }

      // 5. Fetch Student Balances
      try {
        const balRes = await fetch(\`/api/v1/fees/balances?month=\${filterMonth + 1}&year=\${filterYear}\`, { headers });
        if (balRes.ok) {
          const d = await balRes.json();
          if (d.success && d.data) {
            const mappedBalances = (d.data || []).map(b => ({
              id: \`bal-\${b.id}\`,
              feePlanId: b.id,
              studentId: b.studentId,
              studentCode: b.studentCode,
              name: b.name,
              initials: b.initials,
              course: b.course,
              totalCourseFee: b.totalCourseFee,
              totalPaidOverall: b.totalPaidOverall,
              remainingBalance: b.remainingBalance,
              status: b.status,
              courseId: b.courseId
            }));
            setStudentBalancesList(mappedBalances);
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
    return \`\${months[monthIndex]} \${yearValue}\`;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [editItem, setEditItem] = useState(null);

  // Find selected student details to see their courses
  const selectedStudent = useMemo(() => {
    return studentsList.find(s => s.id === selectedStudentId);
  }, [selectedStudentId, studentsList]);

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
    if (paid > 0) return 'Partially Paid';
    return 'Pending';
  }, [totalAmountInput, paidAmountInput]);

  const editComputedStatus = useMemo(() => {
    if (!editItem) return 'Pending';
    const total = parseFloat(editItem.totalAmount) || 0;
    const paid = parseFloat(editItem.paidAmount) || 0;
    if (total <= 0) return 'Pending';
    if (paid >= total) return 'Full Paid';
    if (paid > 0) return 'Partially Paid';
    return 'Pending';
  }, [editItem?.totalAmount, editItem?.paidAmount]);

  const filteredData = useMemo(() => {
    if (activeTab === 'MONTH_TRANSACTIONS') {
      let filteredList = feesList;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filteredList = filteredList.filter(item => 
          item.name.toLowerCase().includes(q)
        );
      }
      // Note: filterStatus not very useful here since we just record payments, but we'll apply it if not 'All'
      // We'll leave it as is.
      return filteredList;
    } else {
      let filteredList = studentBalancesList;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        filteredList = filteredList.filter(item => 
          item.name.toLowerCase().includes(q) || 
          (item.studentCode && item.studentCode.toLowerCase().includes(q))
        );
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
      const headers = { 'Authorization': \`Bearer \${userInfo.token}\`, 'Content-Type': 'application/json' };
      
      // We need a fee_plan_id. Try finding it from studentBalancesList
      let planId = null;
      const existingBal = studentBalancesList.find(b => b.studentId === selectedStudentId && b.courseId === selectedCourseId);
      if (existingBal && existingBal.feePlanId) {
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
      const headers = { 'Authorization': \`Bearer \${userInfo.token}\` };
      
      const res = await fetch(\`/api/v1/fees/payments/\${id}\`, { method: 'DELETE', headers });
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
      const headers = { 'Authorization': \`Bearer \${userInfo.token}\`, 'Content-Type': 'application/json' };
      
      const paidAmt = parseFloat(editItem.paidAmount) || 0;
      if (paidAmt <= 0) {
         alert("Amount must be positive");
         return;
      }

      const payload = {
        amount: paidAmt,
        payment_type: editItem.type,
      };

      const res = await fetch(\`/api/v1/fees/payments/\${editItem.id}\`, { method: 'PUT', headers, body: JSON.stringify(payload) });
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

`;

const startString = "const FeesContent = () => {";
const endString = "const handleExportPDF = () => {";

const startIndex = content.indexOf(startString);
const endIndex = content.indexOf(endString);

if (startIndex !== -1 && endIndex !== -1) {
   const before = content.substring(0, startIndex);
   const after = content.substring(endIndex);
   // Also remove sanitizeFeeRecord 
   let finalBefore = before.replace(/const sanitizeFeeRecord[\s\S]*?};/, '');
   fs.writeFileSync(filePath, finalBefore + newLogic + after);
   console.log("Successfully patched FeesContent.jsx");
} else {
   console.log("Could not find patch points.");
}
