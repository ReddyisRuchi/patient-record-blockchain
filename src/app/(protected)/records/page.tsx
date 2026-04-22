"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toast, useToast } from "@/components/Toast";
import useAuth from "@/hooks/useAuth";

const severityColors: Record<string, string> = {
  Mild:     "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Moderate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  Severe:   "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

function SkeletonRow() {
  return (
    <tr className="border-b dark:border-neutral-800">
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="p-2">
          <div className="h-4 bg-slate-200 dark:bg-neutral-900 rounded animate-pulse w-full" />
        </td>
      ))}
    </tr>
  );
}

export default function RecordsPage() {
  const { user }                            = useAuth();
  const isPatient                           = user?.role === "PATIENT";
  const [patientId, setPatientId]           = useState("");
  const [patientSearch, setPatientSearch]   = useState("");
  const [patientFocused, setPatientFocused] = useState(false);
  const [deptFilter, setDeptFilter]         = useState("");
  const [bloodFilter, setBloodFilter]       = useState("");
  const [genderFilter, setGenderFilter]     = useState("");
  const [hasRecordsFilter, setHasRecordsFilter] = useState(false);
  const [showFilters, setShowFilters]           = useState(false);
  const [patients, setPatients]             = useState<any[]>([]);
  const [records, setRecords]               = useState<any[]>([]);
  const [loading, setLoading]               = useState(false);
  const [fetched, setFetched]               = useState(false);
  const [search, setSearch]                 = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterDept, setFilterDept]         = useState("");
  const [filterVisitType, setFilterVisitType] = useState("");
  const [dateFrom, setDateFrom]             = useState("");
  const [dateTo, setDateTo]                 = useState("");
  const { toast, show, hide }               = useToast();
  const router                              = useRouter();

  useEffect(() => {
    if (!user) return;
    if (isPatient) {
      setPatientId(String(user.id));
    } else {
      fetch("/api/users/patients")
        .then((r) => r.json())
        .then((d) => setPatients(d.patients || []));
    }
  }, [user]);

  useEffect(() => {
    if (!patientId || !user) { setRecords([]); setFetched(false); return; }
    setLoading(true);
    const url = user.role === "PATIENT" ? "/api/records/get" : `/api/records/get?patientId=${patientId}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        const list = data.records || data || [];
        setRecords(list);
        setFetched(true);
        if (list.length === 0) show("No records found.", "error");
      })
      .catch(() => show("Failed to fetch records.", "error"))
      .finally(() => setLoading(false));
  }, [patientId, user]);

  const filtered = records.filter((r) => {
    const q           = search.toLowerCase();
    const matchSearch = !q || r.diagnosis?.toLowerCase().includes(q) || r.department?.toLowerCase().includes(q) || r.prescription?.toLowerCase().includes(q);
    const matchSev    = !filterSeverity || r.severity === filterSeverity;
    const matchDept   = !filterDept || r.department === filterDept;
    const matchVisit  = !filterVisitType || r.visitType === filterVisitType;
    const date        = new Date(r.createdAt);
    const matchFrom   = !dateFrom || date >= new Date(dateFrom);
    const matchTo     = !dateTo   || date <= new Date(dateTo + "T23:59:59");
    return matchSearch && matchSev && matchDept && matchVisit && matchFrom && matchTo;
  });

  const departments = [...new Set(records.map((r) => r.department).filter(Boolean))];
  const visitTypes  = [...new Set(records.map((r) => r.visitType).filter(Boolean))];

  const allDepts = ["General Medicine","Cardiology","Neurology","Orthopedics","Dermatology","Pediatrics","ENT","Gastroenterology","Pulmonology","Endocrinology"];

  // Filter patients by name/email and optionally by department (if we have their records loaded)
  const filteredPatients = patients.filter((p) => {
    const matchName  = !patientSearch || p.name?.toLowerCase().includes(patientSearch.toLowerCase()) || p.email?.toLowerCase().includes(patientSearch.toLowerCase());
    const matchDept  = !deptFilter  || (p.departments || []).includes(deptFilter);
    const matchBlood = !bloodFilter || p.bloodGroup === bloodFilter;
    const matchGender = !genderFilter || p.gender === genderFilter;
    const matchHasRecords = !hasRecordsFilter || (p.recordCount || 0) > 0;
    return matchName && matchDept && matchBlood && matchGender && matchHasRecords;
  });

  const showDropdown = (patientFocused || patientSearch.length > 0) && !patientId;

  const hasFilters = search || filterSeverity || filterDept || filterVisitType || dateFrom || dateTo;
  const clearFilters = () => { setSearch(""); setFilterSeverity(""); setFilterDept(""); setFilterVisitType(""); setDateFrom(""); setDateTo(""); };

  const inputCls = "border border-slate-200 dark:border-neutral-800 px-3 py-2 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-16 px-4">
      {toast && <Toast message={toast.message} type={toast.type} onClose={hide} />}

      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center fade-in fade-in-1">
          Medical Records
        </h1>

        {/* Patient selector — admins only */}
        {!isPatient && (
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow mb-6 fade-in fade-in-2">
            {patientId ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="text-slate-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{patientSearch}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => router.push(`/patients/${patientId}`)} className="text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">View Profile</button>
                  <span className="text-slate-300 dark:text-neutral-700">·</span>
                  <button onClick={() => { setPatientId(""); setPatientSearch(""); setRecords([]); setFetched(false); }} className="text-xs text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition-colors">Change</button>
                </div>
              </div>
            ) : (
              <>
                <label className="form-label mb-2 block">Search Patient</label>
                <div className="flex gap-3 mb-3">
                  <div className="relative flex-1">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={patientSearch}
                      onChange={(e) => { setPatientSearch(e.target.value); }}
                      onFocus={() => setPatientFocused(true)}
                      onBlur={() => setTimeout(() => setPatientFocused(false), 300)}
                      className="w-full pl-9 pr-4 py-2.5 border dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>

                  {/* Filters button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        (deptFilter || bloodFilter || genderFilter || hasRecordsFilter)
                          ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white text-white dark:text-black"
                          : "border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
                      </svg>
                      Filters
                      {(deptFilter || bloodFilter || genderFilter || hasRecordsFilter) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
                      )}
                    </button>

                    {showFilters && (
                      <div className="absolute right-0 top-full mt-2 z-20 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl shadow-xl p-4 w-80 space-y-4 animate-slideUp">
                        <div>
                          <p className="text-xs text-slate-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Department</p>
                          <div className="flex flex-wrap gap-1.5">
                            {["", ...allDepts].map((d) => (
                              <button key={d || "all"} onClick={() => setDeptFilter(d)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${deptFilter === d ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}>{d || "All"}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Blood Group</p>
                          <div className="flex flex-wrap gap-1.5">
                            {["", "A+","A-","B+","B-","AB+","AB-","O+","O-"].map((b) => (
                              <button key={b || "all"} onClick={() => setBloodFilter(b)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${bloodFilter === b ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}>{b || "All"}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 dark:text-neutral-500 mb-2 uppercase tracking-wider">Gender</p>
                          <div className="flex gap-1.5">
                            {["", "Male","Female","Other"].map((g) => (
                              <button key={g || "all"} onClick={() => setGenderFilter(g)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${genderFilter === g ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}>{g || "All"}</button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t dark:border-neutral-800">
                          <button onClick={() => setHasRecordsFilter(!hasRecordsFilter)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${hasRecordsFilter ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}>Has Records Only</button>
                          {(deptFilter || bloodFilter || genderFilter || hasRecordsFilter) && (
                            <button onClick={() => { setDeptFilter(""); setBloodFilter(""); setGenderFilter(""); setHasRecordsFilter(false); }} className="text-xs text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white transition-colors">Clear all</button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="mt-2 border dark:border-neutral-800 rounded-lg overflow-hidden shadow-sm max-h-60 overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-400 dark:text-neutral-500">No patients found.</p>
                    ) : filteredPatients.map((p) => (
                      <button key={p.id}
                        onMouseDown={() => { setPatientId(String(p.id)); setPatientSearch(p.name || p.email); setPatientFocused(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors border-b dark:border-neutral-800 last:border-0">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{p.name}</span>
                        <span className="text-slate-400 dark:text-neutral-500 ml-2 text-xs">{p.email}</span>
                        {p.departments?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.departments.map((d: string) => (
                              <span key={d} className={`px-1.5 py-0.5 rounded text-xs ${deptFilter === d ? "bg-slate-900 dark:bg-white text-white dark:text-black" : "bg-slate-100 dark:bg-neutral-700 text-slate-500 dark:text-neutral-400"}`}>{d}</span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Filters */}
        {fetched && records.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow mb-6 fade-in fade-in-2 space-y-3">
            {/* Row 1: search + severity + dept + visit type */}
            <div className="flex flex-wrap gap-3">
              {(isPatient || !patientId) && (
                <div className="relative flex-1 min-w-[180px]">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-neutral-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input type="text" placeholder="Search diagnosis, prescription..." value={search} onChange={(e) => setSearch(e.target.value)}
                    className={`${inputCls} w-full pl-8`} />
                </div>
              )}
              <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className={inputCls}>
                <option value="">All Severities</option>
                {["Mild","Moderate","Severe","Critical"].map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className={inputCls}>
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d}>{d}</option>)}
              </select>
              <select value={filterVisitType} onChange={(e) => setFilterVisitType(e.target.value)} className={inputCls}>
                <option value="">All Visit Types</option>
                {visitTypes.map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            {/* Row 2: date range + clear */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400">
                <span>From</span>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-neutral-400">
                <span>To</span>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
              </div>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-slate-400 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white transition-colors ml-auto">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow">
            <table className="w-full border-collapse">
              <tbody>{Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}</tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && fetched && filtered.length === 0 && (
          <div className="bg-white dark:bg-neutral-900 p-16 rounded-xl shadow text-center fade-in fade-in-2">
            <svg className="mx-auto mb-4 text-slate-300 dark:text-slate-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
            </svg>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No records found</p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Try adjusting your filters.</p>
          </div>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow overflow-hidden fade-in fade-in-3">
            <div className="px-6 py-4 border-b dark:border-neutral-800 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                {patientId && patients.find(p => String(p.id) === patientId) && (() => {
                  const p = patients.find(p => String(p.id) === patientId);
                  return (
                    <span className="ml-1">for <span className="font-medium text-slate-700 dark:text-slate-200">{p?.name}</span>
                      {p?.bloodGroup && <span className="ml-2 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-neutral-800 text-xs font-medium text-slate-600 dark:text-neutral-300">{p.bloodGroup}</span>}
                    </span>
                  );
                })()}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b dark:border-neutral-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Visit Type</th>
                    <th className="px-4 py-3">Diagnosis</th>
                    <th className="px-4 py-3">Prescription</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Follow Up</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Chain</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((record) => (
                    <tr key={record.id} onClick={() => router.push(`/records/${record.id}`)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-900 transition border-b dark:border-neutral-800 text-sm">
                      <td className="px-4 py-3">{record.department}</td>
                      <td className="px-4 py-3">{record.visitType}</td>
                      <td className="px-4 py-3">{record.diagnosis}</td>
                      <td className="px-4 py-3">{record.prescription}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[record.severity] || "bg-slate-100 text-slate-600"}`}>
                          {record.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">{record.followUp}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500">On-Chain</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
