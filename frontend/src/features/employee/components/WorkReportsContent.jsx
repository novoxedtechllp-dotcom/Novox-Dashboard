import React, { useState, useEffect, useRef } from "react";
import { Plus, Briefcase, UploadCloud, FileText, Trash2, Clock, X, ExternalLink, ChevronDown, Check, CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LoadingSpinner from "../../../components/LoadingSpinner";

// Backward-compatible parser for legacy reports that stored metadata in work_done text
const cleanLegacyReport = (report) => {
  let workDone = report.work_done || "";
  let projectArea = report.project_area || "";
  let attachmentUrl = report.attachment_url || null;
  let attachmentName = report.attachment_name || null;

  // Extract [PROJECT_AREA:...] from legacy work_done text
  const projectMatch = workDone.match(/\[PROJECT_AREA:([^\]]+)\]/);
  if (projectMatch) {
    if (!projectArea) projectArea = projectMatch[1].trim();
    workDone = workDone.replace(/\[PROJECT_AREA:[^\]]+\]/, "");
  }

  // Extract [PDF_ATTACHMENT:name|base64data] from legacy work_done text
  const pdfMatch = workDone.match(/\[PDF_ATTACHMENT:([^|]+)\|([^\]]+)\]/);
  if (pdfMatch) {
    if (!attachmentUrl) {
      attachmentName = pdfMatch[1];
      attachmentUrl = pdfMatch[2];
    }
    workDone = workDone.replace(/\[PDF_ATTACHMENT:[^\]]+\]/, "");
  }

  return {
    workDone: workDone.trim(),
    projectArea: projectArea || "General Task",
    attachment: attachmentUrl ? { name: attachmentName || "Attachment", url: attachmentUrl } : null
  };
};

const CustomSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value) || options[0] || { label: "Select..." };
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex-1 max-w-xs relative" ref={dropdownRef}>
      <label className="block text-[12px] font-bold text-slate-500 uppercase mb-1.5">{label}</label>
      <div 
        className={`w-full bg-slate-50 border ${isOpen ? 'border-[#003F87] ring-1 ring-[#003F87]' : 'border-[#E2E8F0]'} text-[14px] text-slate-700 px-3 py-2.5 rounded-lg flex justify-between items-center cursor-pointer hover:border-[#003F87] transition-all duration-200 shadow-sm`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium truncate pr-4">{selectedOption.label}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#003F87]' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white border border-[#E2E8F0] rounded-xl shadow-lg max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => (
            <div
              key={option.value}
              className={`px-3 py-2.5 cursor-pointer text-[14px] transition-colors flex justify-between items-center ${option.value === value ? 'bg-[#F0F5FF] text-[#003F87] font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'}`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span className="truncate pr-2">{option.label}</span>
              {option.value === value && <Check size={16} className="text-[#003F87] shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const WorkReportsContent = ({ searchQuery = "" }) => {
  const [reports, setReports] = useState([]);
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
          setReports(fetched);
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

  const [selectedEmployee, setSelectedEmployee] = useState("ALL");
  const [selectedSpecificDate, setSelectedSpecificDate] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    employee_id: "",
    project_id: "",
    report_type: "DAILY",
    work_done: "",
    blockers: "",
  });
  
  const [attachmentFile, setAttachmentFile] = useState(null);
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
  };

  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [currentDocAttachment, setCurrentDocAttachment] = useState(null);

  const filteredReports = reports.filter(r => {
    // Employee filtering: only show own reports
    if (isEmployee) {
      const emp = r.employee || {};
      const empProfileId = emp.id;
      // For employee view, check if the report's employee matches
      if (r.employee_id !== userInfo.id && empProfileId !== userInfo.id) {
        // Also check by name match as fallback
        return false;
      }
    }

    if (userRole === "ADMIN") {
      if (selectedEmployee !== "ALL" && r.employee_id !== selectedEmployee) {
        return false;
      }

      const reportDate = new Date(r.submitted_at);
      
      if (!selectedSpecificDate) return false;
      const [year, month, day] = selectedSpecificDate.split("-").map(Number);
      if (
        reportDate.getDate() !== day ||
        reportDate.getMonth() !== month - 1 ||
        reportDate.getFullYear() !== year
      ) {
        return false;
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const emp = r.employee || {};
      const empName = `${emp.first_name || ""} ${emp.last_name || ""}`.toLowerCase();
      const cleaned = cleanLegacyReport(r);
      const proj = cleaned.projectArea.toLowerCase();
      const work = cleaned.workDone.toLowerCase();
      
      if (!empName.includes(q) && !proj.includes(q) && !work.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!newReport.work_done) return;

    try {
      const userInfo = JSON.parse(sessionStorage.getItem("userInfo"));
      
      let attachmentUrl = null;
      let attachmentName = null;

      if (attachmentFile) {
        const formData = new FormData();
        formData.append("file", attachmentFile);
        
        const uploadRes = await fetch("/api/v1/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${userInfo?.token}`
          },
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          attachmentUrl = uploadData.data?.url || uploadData.url;
          attachmentName = attachmentFile.name;
        } else {
          setFileError("Failed to upload file");
          return;
        }
      }

      const response = await fetch("/api/v1/work-reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo?.token}`,
        },
        body: JSON.stringify({
          report_type: newReport.report_type,
          work_done: newReport.work_done,
          blockers: newReport.blockers,
          project_area: newReport.project_id,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
        }),
      });
      const resData = await response.json();
      if (response.ok && resData.data) {
        const createdReport = {
          ...resData.data,
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
          <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-start bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-sm">
            <CustomSelect 
              label="Select Employee"
              value={selectedEmployee}
              onChange={setSelectedEmployee}
              options={[
                { value: "ALL", label: "All Employees" },
                ...employees.map(emp => ({
                  value: emp.id,
                  label: `${emp.first_name} ${emp.last_name} (${emp.employee_code || 'N/A'})`
                }))
              ]}
            />
            
            <div className="flex flex-col flex-1 max-w-xs">
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-1.5">Report Date</label>
              <div className="relative">
                <DatePicker
                  selected={selectedSpecificDate ? new Date(selectedSpecificDate) : null}
                  onChange={(date) => {
                    if (date) {
                      const yyyy = date.getFullYear();
                      const mm = String(date.getMonth() + 1).padStart(2, '0');
                      const dd = String(date.getDate()).padStart(2, '0');
                      setSelectedSpecificDate(`${yyyy}-${mm}-${dd}`);
                    } else {
                      setSelectedSpecificDate("");
                    }
                  }}
                  dateFormat="MMMM d, yyyy"
                  placeholderText="Select a date"
                  className="w-full bg-white border border-[#E2E8F0] text-[14px] text-slate-700 px-3 py-2.5 pl-10 rounded-lg focus:border-[#003F87] focus:ring-1 focus:ring-[#003F87] outline-none transition-all duration-200 shadow-sm cursor-pointer"
                />
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
          </div>
        )}

        {filteredReports.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Clock size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-semibold text-lg">No reports found</p>
            <p className="text-sm mt-1">
              {userRole === "ADMIN" ? "Try changing the report period or employee filter." : "Submit your first work report to get started."}
            </p>
          </div>
        )}

        <div className={userRole === "ADMIN" ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
          {filteredReports.map((report) => {
            const { workDone, projectArea, attachment } = cleanLegacyReport(report);
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
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                        <div className="text-[13px] text-slate-600">
                          <span className="font-semibold">Project:</span> {projectArea}
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

                      </div>
                    </div>
                  </div>
                  
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
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                      <Briefcase size={12} />{" "}
                      {projectArea}
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
                src={currentDocAttachment.url}
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
