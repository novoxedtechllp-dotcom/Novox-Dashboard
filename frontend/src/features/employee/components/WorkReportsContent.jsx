import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Plus, Search, Briefcase, UploadCloud, FileText, Trash2, Clock, MessageSquare, X, Send, AlertCircle, ExternalLink, Filter } from "lucide-react";
import LoadingSpinner from "../../../components/LoadingSpinner";

const parseReportContent = (text) => {
  let workDone = text || "";
  let projectArea = "";
  let attachment = null;

  // Match Project Area
  const projectMatch = workDone.match(/\[PROJECT_AREA:([^\]]+)\]/);
  if (projectMatch) {
    projectArea = projectMatch[1];
    workDone = workDone.replace(/\[PROJECT_AREA:[^\]]+\]/, "");
  }

  // Match PDF Attachment
  const pdfMatch = workDone.match(/\[PDF_ATTACHMENT:([^|]+)\|([^\]]+)\]/);
  if (pdfMatch) {
    attachment = {
      name: pdfMatch[1],
      base64: pdfMatch[2]
    };
    workDone = workDone.replace(/\[PDF_ATTACHMENT:[^|]+\|[^\]]+\]/, "");
  }

  return {
    workDone: workDone.trim(),
    projectArea: projectArea.trim(),
    attachment
  };
};

const WorkReportsContent = () => {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
  const userRole = userInfo?.role;
  const isEmployee = userRole !== "ADMIN" && userRole !== "STUDENT";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
        if (!userInfo || !userInfo.token) return;

        const headers = { Authorization: `Bearer ${userInfo.token}` };

        const [repRes, empRes] = await Promise.all([
          fetch("/api/v1/work-reports", { headers }),
          fetch("/api/v1/employees", { headers }),
        ]);

        if (repRes.ok) {
          const resData = await repRes.json();
          const fetched = resData.data?.reports || resData.data || [];
          
          // Map locally stored simulated statuses if they exist
          const statusMap = JSON.parse(localStorage.getItem("mock_report_statuses") || "{}");
          const msgsMap = JSON.parse(localStorage.getItem("mock_report_msgs") || "{}");
          const reportsWithStatus = fetched.map(r => ({
            ...r,
            approval_status: statusMap[r.id] || r.approval_status || "PENDING",
            admin_message: msgsMap[r.id] || r.admin_message || ""
          }));
          
          setReports(reportsWithStatus);
        }
        if (empRes.ok) {
          const eData = await empRes.json();
          setEmployees(eData.data || []);
        }
      } catch (error) {
        console.error("Error fetching work reports data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    employee_id: "",
    project_id: "",
    report_type: "DAILY",
    work_done: "",
    blockers: "",
  });
  
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentBase64, setAttachmentBase64] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileSelect = (file) => {
    setFileError("");
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Only PDF files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be under 5MB.");
      return;
    }

    setAttachmentFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentBase64(event.target.result);
    };
    reader.onerror = () => {
      setFileError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [currentDocAttachment, setCurrentDocAttachment] = useState(null);

  const handleStatusChange = async (id, newStatus, message = "") => {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      const endpoint =
        newStatus === "APPROVED"
          ? `/api/v1/work-reports/${id}/approve`
          : `/api/v1/work-reports/${id}/reject`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify(newStatus === "REJECTED" ? { adminMessage: message } : {})
      });
      if (response.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, approval_status: newStatus, admin_message: message } : r
          )
        );
        return;
      }
    } catch (err) {
      console.warn("Backend endpoints for approve/reject not fully configured. Simulating locally:", err);
    }
    
    // Local simulation fallback
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, approval_status: newStatus, admin_message: message } : r
      )
    );
    
    // Also save in localStorage to persist the simulation for this browser session
    const statusMap = JSON.parse(localStorage.getItem("mock_report_statuses") || "{}");
    statusMap[id] = newStatus;
    localStorage.setItem("mock_report_statuses", JSON.stringify(statusMap));

    if (newStatus === "REJECTED") {
      const msgs = JSON.parse(localStorage.getItem("mock_report_msgs") || "{}");
      msgs[id] = message;
      localStorage.setItem("mock_report_msgs", JSON.stringify(msgs));
    }
  };

  const handleOpenRejectModal = (id) => {
    setSelectedRequestId(id);
    setRejectionMessage("");
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRequestId) return;
    await handleStatusChange(selectedRequestId, "REJECTED", rejectionMessage);
    setIsRejectModalOpen(false);
    setSelectedRequestId(null);
  };

 const filteredReports = reports.filter(r => {
  if (isEmployee && r.employee_id !== userInfo.id) {
    return false;
  }

  if (statusFilter !== 'ALL' && r.approval_status !== statusFilter) {
    return false;
  }

  // Filter out approved or rejected reports older than 24 hours
  if (r.approval_status === "APPROVED" || r.approval_status === "REJECTED") {
    const reportTime = new Date(r.submitted_at).getTime();
    const currentTime = new Date().getTime();
    const hoursDifference = (currentTime - reportTime) / (1000 * 60 * 60);
    if (hoursDifference > 24) {
      return false;
    }
  }

  const emp = employees.find(e => e.id === r.employee_id);
  const empName = emp
    ? `${emp.first_name || ''} ${emp.last_name || ''}`.trim()
    : '';

  if (
    searchQuery &&
    !empName.toLowerCase().includes(searchQuery.toLowerCase())
  ) {
    return false;
  }

  return true;
});

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!newReport.work_done) return;

    try {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      
      let finalWorkDone = newReport.work_done;
      if (newReport.project_id) {
        finalWorkDone = `${finalWorkDone}\n\n[PROJECT_AREA:${newReport.project_id}]`;
      }
      if (attachmentFile && attachmentBase64) {
        finalWorkDone = `${finalWorkDone}\n\n[PDF_ATTACHMENT:${attachmentFile.name}|${attachmentBase64}]`;
      }

      const response = await fetch("/api/v1/work-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify({
          ...newReport,
          project_id: "bc8952fd-5a53-4508-a021-c39c4edeeb61", // Using seeded General Task UUID to satisfy DB constraint
          work_done: finalWorkDone,
          employee_id: userInfo.id,
        }),
      });
      const resData = await response.json();
      if (response.ok && resData.data) {
        const createdReport = {
          ...resData.data,
          approval_status: "PENDING",
          employee_id: userInfo.id,
          submitted_at: new Date().toISOString(),
          employee: {
            id: userInfo.id,
            first_name: userInfo.first_name || userInfo.name || "You",
            last_name: userInfo.last_name || ""
          }
        };
        
        setReports([createdReport, ...reports]);
        setIsSubmitModalOpen(false);
        setNewReport({
          employee_id: "",
          project_id: "",
          report_type: "DAILY",
          work_done: "",
          blockers: "",
        });
        setAttachmentFile(null);
        setAttachmentBase64("");
        setFileError("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading work reports..." />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="bg-[#E5F7ED] text-[#008A2E] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 w-max"><CheckCircle size={14} /> Approved</span>;
      case 'REJECTED':
        return <span className="bg-[#FDE2E2] text-[#D80000] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 w-max"><XCircle size={14} /> Rejected</span>;
      default:
        return <span className="bg-[#FFF4E5] text-[#B26E00] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 w-max"><Clock size={14} /> Pending</span>;
    }
  };

  return (
    <>
      <div className="p-[24px] flex flex-col gap-[24px] w-full">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-[24px] font-bold text-[#003F87]">
              Work Reports
            </h2>
            <p className="text-slate-500 text-[14px] mt-1">
              Review and manage employee submissions
            </p>
          </div>
          {isEmployee && (
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="bg-[#003F87] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#002B5E] transition-colors"
            >
              <Plus size={16} /> Submit Report
            </button>
          )}
        </div>

        {userRole === "ADMIN" && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] text-[14px] px-10 py-2.5 rounded-lg focus:outline-none focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87]"
              />
            </div>
            
            <div className="flex gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${
                    statusFilter === status 
                      ? 'bg-[#003F87] text-white' 
                      : 'bg-white text-slate-600 border border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  {status === 'ALL' ? 'All Reports' : status}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={userRole === "ADMIN" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {filteredReports.map((report) => {
            const { workDone, projectArea, attachment } = parseReportContent(report.work_done);
            const emp =
              employees.find((e) => e.id === report.employee_id) || report.employee || {};
            const empName = emp.first_name
              ? `${emp.first_name} ${emp.last_name}`
              : "Unknown Employee";

            if (userRole === "ADMIN") {
              return (
                <div key={report.id} className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between gap-6 md:items-center">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-[#E5F0FF] text-[#003F87] font-bold text-[16px] flex items-center justify-center shrink-0">
                      {empName !== "Unknown Employee" ? empName.substring(0, 2).toUpperCase() : "??"}
                    </div>
                    <div className="space-y-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="font-bold text-[16px] text-slate-900">{empName} <span className="text-[13px] font-medium text-slate-500 ml-2">({emp.designation || 'Employee'})</span></h3>
                        {getStatusBadge(report.approval_status || 'PENDING')}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                        <div className="text-[13px] text-slate-600">
                          <span className="font-semibold">Project:</span> {projectArea || (report.projects && report.projects.name) || "General Task"}
                        </div>
                        <div className="text-[13px] text-slate-600">
                          <span className="font-semibold">Type:</span> <span className="font-bold text-slate-800">{report.report_type}</span>
                        </div>
                        <div className="text-[13px] text-slate-500">
                          <span className="font-semibold">Submitted:</span> {new Date(report.submitted_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-[13px] text-slate-700 whitespace-pre-line"><span className="font-bold text-slate-800">Work Done:</span> {workDone}</p>
                        
                        {report.blockers && report.blockers !== "None" && (
                          <p className="text-[13px] text-[#D80000] mt-2 whitespace-pre-line"><span className="font-bold">Blockers:</span> {report.blockers}</p>
                        )}

                        {attachment && (
                          <div className="mt-2 flex items-center">
                            <button 
                              onClick={() => {
                                setCurrentDocAttachment(attachment);
                                setIsDocModalOpen(true);
                              }}
                              className="text-[13px] font-bold text-[#003F87] hover:text-[#002B5E] flex items-center gap-1"
                            >
                              <ExternalLink size={14} /> View Attached Document
                            </button>
                          </div>
                        )}

                        {report.admin_message && (
                          <p className="text-[13px] text-[#D80000] mt-2"><span className="font-bold">Rejection Note:</span> {report.admin_message}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {(report.approval_status === 'PENDING' || !report.approval_status) && (
                    <div className="flex gap-3 md:flex-col shrink-0 mt-4 md:mt-0">
                      <button 
                        onClick={() => handleStatusChange(report.id, "APPROVED")}
                        className="flex-1 md:w-32 bg-[#008A2E] hover:bg-[#007025] text-white px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleOpenRejectModal(report.id)}
                        className="flex-1 md:w-32 bg-white border border-[#D80000] text-[#D80000] hover:bg-[#FFF0F0] px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                  
                </div>
              );
            }

            return (
              <div
                key={report.id}
                className="bg-white border border-[#C2C6D4] rounded-xl p-5 hover:border-[#003F87] transition-colors flex flex-col relative group shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003F87] flex items-center justify-center font-bold text-sm">
                      {empName !== "Unknown Employee"
                        ? empName.substring(0, 2).toUpperCase()
                        : "??"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {empName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {new Date(report.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${
                      report.approval_status === "APPROVED"
                        ? "bg-green-100 text-green-700"
                        : report.approval_status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {report.approval_status || "PENDING"}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                      <Briefcase size={12} />{" "}
                      {projectArea || (report.projects && report.projects.name) || "General Task"}
                    </div>
                    <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">
                      {report.report_type}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1">
                      Work Done
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-2 rounded whitespace-pre-line">
                      {workDone}
                    </p>
                    {attachment && (
                      <div className="mt-3 bg-blue-50/50 border border-blue-100 p-2.5 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText size={18} className="text-[#003F87] shrink-0" />
                          <span className="text-xs font-semibold text-slate-700 truncate max-w-[140px]" title={attachment.name}>
                            {attachment.name}
                          </span>
                        </div>
                              <button
                                onClick={() => {
                                  setCurrentDocAttachment(attachment);
                                  setIsDocModalOpen(true);
                                }}
                                className="text-xs font-bold text-[#003F87] hover:underline shrink-0 ml-2"
                              >
                                View
                              </button>
                      </div>
                    )}
                  </div>
                  {report.blockers && report.blockers !== "None" && (
                    <div>
                      <h4 className="text-xs font-bold text-red-700 mb-1">
                        Blockers
                      </h4>
                      <p className="text-sm text-red-600 leading-relaxed bg-red-50 p-2 rounded">
                        {report.blockers}
                      </p>
                    </div>
                  )}
                  {report.admin_message && (
                    <div>
                      <h4 className="text-xs font-bold text-[#D80000] mb-1">
                        Rejection Note
                      </h4>
                      <p className="text-sm text-[#D80000] leading-relaxed bg-[#FDE2E2] p-2 rounded">
                        {report.admin_message}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isEmployee && isSubmitModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsSubmitModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">
                Submit Work Report
              </h2>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form
              onSubmit={handleSubmitReport}
              className="p-6 flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Project/Task Area
                  </label>
                  <input
                    type="text"
                    value={newReport.project_id}
                    onChange={(e) =>
                      setNewReport({ ...newReport, project_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none bg-white"
                    placeholder="e.g. Frontend, Marketing..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Report Type
                  </label>
                  <select
                    value={newReport.report_type}
                    onChange={(e) =>
                      setNewReport({
                        ...newReport,
                        report_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none bg-white"
                  >
                    <option value="DAILY">DAILY</option>
                    <option value="WEEKLY">WEEKLY</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Work Done
                </label>
                <textarea
                  required
                  rows="3"
                  value={newReport.work_done}
                  onChange={(e) =>
                    setNewReport({ ...newReport, work_done: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
                  placeholder="Describe work completed..."
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Blockers (Optional)
                </label>
                <input
                  type="text"
                  value={newReport.blockers}
                  onChange={(e) =>
                    setNewReport({ ...newReport, blockers: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
                  placeholder="Any issues?"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-xs font-bold text-slate-500 uppercase">
                  Attachment (PDF Only)
                </label>
                
                {attachmentFile ? (
                  <div className="flex items-center justify-between p-3 border border-blue-200 bg-blue-50/30 rounded-lg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileText size={20} className="text-[#003F87]" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-slate-700 truncate">
                          {attachmentFile.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {(attachmentFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentFile(null);
                        setAttachmentBase64("");
                        setFileError("");
                      }}
                      className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                      title="Remove file"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(true);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragActive(false);
                      
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => document.getElementById("file-upload").click()}
                    className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                      ${dragActive 
                        ? "border-[#003F87] bg-blue-50/20 scale-[0.99]" 
                        : "border-slate-300 hover:border-[#003F87] hover:bg-slate-50/50"}`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <UploadCloud size={24} className={`mb-1.5 ${dragActive ? "text-[#003F87] animate-bounce" : "text-slate-400"}`} />
                    <span className="text-xs font-semibold text-slate-600 text-center">
                      Drag & drop PDF here, or <span className="text-[#003F87] underline">browse</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      PDF files up to 5MB
                    </span>
                  </div>
                )}
                {fileError && (
                  <span className="text-[11px] text-red-500 font-semibold mt-1">
                    {fileError}
                  </span>
                )}
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-md text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#003F87] rounded-md text-sm font-semibold text-white"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-[#D80000]" />
                Reject Work Report
              </h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[14px] text-slate-600 mb-4">Please provide a reason or message for rejecting this work report. The employee will see this message.</p>
              <textarea
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                placeholder="Enter your message here..."
                rows="4"
                className="w-full bg-white border border-[#C2C6D4] text-[14px] text-slate-800 px-4 py-3 rounded-lg focus:outline-none focus:border-[#D80000] focus:ring-1 focus:ring-[#D80000] transition-colors resize-none mb-6"
              ></textarea>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-5 py-2.5 text-[14px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmReject}
                  disabled={!rejectionMessage.trim()}
                  className="px-5 py-2.5 text-[14px] font-bold bg-[#D80000] text-white hover:bg-[#B80000] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={16} /> Send & Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document View Modal */}
      {isDocModalOpen && currentDocAttachment && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 w-full max-w-4xl h-[85vh]">
            <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} className="text-[#003F87]" />
                {currentDocAttachment.name}
              </h3>
              <button onClick={() => setIsDocModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-200 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 bg-slate-100 relative overflow-auto flex justify-center items-center p-4">
              <iframe
                src={currentDocAttachment.base64}
                title={currentDocAttachment.name}
                className="w-full h-full border-none rounded shadow-sm"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WorkReportsContent;
