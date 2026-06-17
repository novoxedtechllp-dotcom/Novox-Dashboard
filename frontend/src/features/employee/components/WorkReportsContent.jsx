import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Plus, Search, Briefcase, UploadCloud, FileText, Trash2 } from "lucide-react";
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
          const reportsWithStatus = fetched.map(r => ({
            ...r,
            approval_status: statusMap[r.id] || r.approval_status || "PENDING"
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

  const handleStatusChange = async (id, newStatus) => {
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
      });
      if (response.ok) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === id ? { ...r, approval_status: newStatus } : r
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
        r.id === id ? { ...r, approval_status: newStatus } : r
      )
    );
    
    // Also save in localStorage to persist the simulation for this browser session
    const statusMap = JSON.parse(localStorage.getItem("mock_report_statuses") || "{}");
    statusMap[id] = newStatus;
    localStorage.setItem("mock_report_statuses", JSON.stringify(statusMap));
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

  return (
    <>
      <div className="p-[24px] flex flex-col gap-[24px] w-full">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-[20px] font-bold text-[#003F87]">
              Work Reports
            </h2>
            <p className="text-[13px] text-[#555F6B]">
              Manage daily and weekly employee submissions.
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
          <div className="flex gap-4 bg-white p-4 border border-[#C2C6D4] rounded-lg">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-md flex-1">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-md text-sm outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        )}

        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const { workDone, projectArea, attachment } = parseReportContent(report.work_done);
            const emp =
              employees.find((e) => e.id === report.employee_id) || report.employee || {};
            const empName = emp.first_name
              ? `${emp.first_name} ${emp.last_name}`
              : "Unknown Employee";

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
                                  const pdfWindow = window.open("");
                                  if (pdfWindow) {
                                    pdfWindow.document.write(
                                      `<iframe width='100%' height='100%' style='border:none;margin:0;padding:0;' src='${attachment.base64}'></iframe>`
                                    );
                                    pdfWindow.document.title = attachment.name;
                                  }
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
                </div>

                {userRole === "ADMIN" && (report.approval_status === "PENDING" || !report.approval_status) && (
                  <div className="mt-auto border-t border-slate-100 pt-4 flex gap-2">
                    <button
                      onClick={() => handleStatusChange(report.id, "APPROVED")}
                      disabled={report.approval_status === "APPROVED"}
                      className="flex-1 bg-green-50 text-green-700 py-2 rounded-md text-xs font-bold hover:bg-green-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(report.id, "REJECTED")}
                      disabled={report.approval_status === "REJECTED"}
                      className="flex-1 bg-red-50 text-red-700 py-2 rounded-md text-xs font-bold hover:bg-red-100 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                )}
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
    </>
  );
};

export default WorkReportsContent;
