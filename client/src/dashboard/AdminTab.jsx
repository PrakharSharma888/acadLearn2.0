import { useState, useEffect, useCallback } from "react";
import API_BASE from "../config/api";
import { authHeader } from "./constants";

// ── Class form defaults ───────────────────────────────────────────────────────
const EMPTY_CLASS = {
  title: "", subtitle: "", category: "junior", level: "Beginner",
  instructor: "AcadLearn Team", description: "", duration: "", badge: "", totalLessons: "",
};

const EMPTY_UNIV = { name: "", shortName: "" };
const EMPTY_DEPT = { universityId: "", name: "", code: "" };

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const AdminTab = ({ token }) => {
  const [section, setSection] = useState("sessions"); // "sessions" | "classes" | "add"

  // ── All classes (for dropdown in demo session form) ───────────────────────
  const [allClasses,    setAllClasses]    = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const loadAllClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      const res = await fetch(`${API_BASE}/api/classes`, { headers: authHeader(token) });
      if (!res.ok) throw new Error();
      setAllClasses(await res.json());
    } catch { setAllClasses([]); }
    finally { setLoadingClasses(false); }
  }, [token]);

  useEffect(() => { loadAllClasses(); }, [loadAllClasses]);

  // ── Demo sessions ─────────────────────────────────────────────────────────
  const [sessions,        setSessions]        = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`${API_BASE}/api/demo-sessions/all`, { headers: authHeader(token) });
      if (!res.ok) throw new Error();
      setSessions(await res.json());
    } catch { setSessions([]); }
    finally { setLoadingSessions(false); }
  }, [token]);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Delete this demo session?")) return;
    try {
      await fetch(`${API_BASE}/api/demo-sessions/${id}`, {
        method: "DELETE", headers: authHeader(token),
      });
      await loadSessions();
    } catch { alert("Could not delete session."); }
  };

  // ── Class management ──────────────────────────────────────────────────────
  const [classForm, setClassForm] = useState(EMPTY_CLASS);
  const [classSaving, setClassSaving] = useState(false);
  const [classMsg,    setClassMsg]    = useState("");
  const [classPage,   setClassPage]   = useState(0);
  const CLASS_PAGE_SIZE = 10;

  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setClassForm((f) => ({ ...f, [name]: value }));
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setClassSaving(true);
    setClassMsg("");
    try {
      const payload = { ...classForm, totalLessons: classForm.totalLessons ? Number(classForm.totalLessons) : 0 };
      const res = await fetch(`${API_BASE}/api/classes`, {
        method: "POST", headers: authHeader(token), body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setClassMsg(err.message || "Failed to create class.");
        return;
      }
      setClassMsg("Class created successfully!");
      setClassForm(EMPTY_CLASS);
      await loadAllClasses();
    } catch { setClassMsg("Server error. Please try again."); }
    finally { setClassSaving(false); }
  };

  const handleToggleActive = async (cls) => {
    try {
      const res = await fetch(`${API_BASE}/api/classes/${cls._id}`, {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({ isActive: !cls.isActive }),
      });
      if (!res.ok) throw new Error();
      await loadAllClasses();
    } catch { alert("Could not update class status."); }
  };

  const handleDeleteClass = async (cls) => {
    if (!window.confirm(`Delete "${cls.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/classes/${cls._id}`, {
        method: "DELETE", headers: authHeader(token),
      });
      if (!res.ok) throw new Error();
      await loadAllClasses();
    } catch { alert("Could not delete class."); }
  };

  // ── helpers ───────────────────────────────────────────────────────────────
  const isUpcoming = (dateStr) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  // ── University management ──────────────────────────────────────────────────
  const [universities,      setUniversities]      = useState([]);
  const [loadingUnivs,      setLoadingUnivs]      = useState(true);
  const [univForm,          setUnivForm]          = useState(EMPTY_UNIV);
  const [deptForm,          setDeptForm]          = useState(EMPTY_DEPT);
  const [univMsg,           setUnivMsg]           = useState("");
  const [deptMsg,           setDeptMsg]           = useState("");
  const [univSaving,        setUnivSaving]        = useState(false);
  const [deptSaving,        setDeptSaving]        = useState(false);

  const loadUniversities = useCallback(async () => {
    setLoadingUnivs(true);
    try {
      const res = await fetch(`${API_BASE}/api/universities/all`, { headers: authHeader(token) });
      if (!res.ok) throw new Error();
      setUniversities(await res.json());
    } catch { setUniversities([]); }
    finally { setLoadingUnivs(false); }
  }, [token]);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);

  const handleCreateUniversity = async (e) => {
    e.preventDefault();
    setUnivSaving(true); setUnivMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/universities`, {
        method: "POST", headers: authHeader(token), body: JSON.stringify(univForm),
      });
      const data = await res.json();
      if (!res.ok) { setUnivMsg(data.message || "Failed"); return; }
      setUnivMsg("University created!");
      setUnivForm(EMPTY_UNIV);
      await loadUniversities();
    } catch { setUnivMsg("Server error."); }
    finally { setUnivSaving(false); }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!deptForm.universityId) { setDeptMsg("Select a university first"); return; }
    setDeptSaving(true); setDeptMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/universities/${deptForm.universityId}/departments`, {
        method: "POST", headers: authHeader(token),
        body: JSON.stringify({ name: deptForm.name, code: deptForm.code }),
      });
      const data = await res.json();
      if (!res.ok) { setDeptMsg(data.message || "Failed"); return; }
      setDeptMsg("Department added!");
      setDeptForm((p) => ({ ...p, name: "", code: "" }));
      await loadUniversities();
    } catch { setDeptMsg("Server error."); }
    finally { setDeptSaving(false); }
  };

  const handleDeleteUniversity = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its departments? This cannot be undone.`)) return;
    try {
      await fetch(`${API_BASE}/api/universities/${id}`, { method: "DELETE", headers: authHeader(token) });
      await loadUniversities();
    } catch { alert("Could not delete university."); }
  };

  const handleDeleteDepartment = async (univId, deptId, deptName) => {
    if (!window.confirm(`Remove department "${deptName}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/universities/${univId}/departments/${deptId}`, {
        method: "DELETE", headers: authHeader(token),
      });
      await loadUniversities();
    } catch { alert("Could not delete department."); }
  };

  const SECTIONS = [
    { key: "sessions",       label: "Demo Sessions" },
    { key: "classes",        label: "All Classes" },
    { key: "add",            label: "+ Add Class" },
    { key: "universities",   label: "Universities" },
    { key: "add-university", label: "+ Add University" },
  ];

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header + tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-0.5">View demo sessions and manage classes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                section === s.key
                  ? "bg-orange-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Demo Sessions list ── */}
      {section === "sessions" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold text-slate-700">
                  Scheduled Demo Sessions{" "}
                  <span className="text-gray-400 font-normal text-sm">({sessions.length})</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  To schedule new demo sessions, go to the{" "}
                  <a href="/dashboard/bookings" className="text-orange-600 hover:underline font-medium">
                    Demo Bookings
                  </a>
                  {" "}tab
                </p>
              </div>
            </div>
          </div>
          {loadingSessions ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : sessions.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No sessions yet.{" "}
              <button onClick={() => setSection("schedule")} className="text-orange-600 font-semibold hover:underline">
                Schedule one
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sessions.map((s) => (
                <div key={s._id} className="px-6 py-4 flex items-center gap-4">
                  {/* Date badge */}
                  <div className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center ${
                    isUpcoming(s.date) ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    <p className="text-lg font-bold leading-none">
                      {new Date(s.date).getDate()}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide">
                      {new Date(s.date).toLocaleString("en-IN", { month: "short" })}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800">{s.title}</p>
                      {isUpcoming(s.date) && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full uppercase">
                          Soon
                        </span>
                      )}
                      {s.type === "free" ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          FREE
                        </span>
                      ) : (
                        <>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            PAID
                          </span>
                          {s.price > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
                              ₹{s.price}
                            </span>
                          )}
                        </>
                      )}
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                        s.category === "junior" ? "bg-amber-100 text-amber-700"
                        : s.category === "professional" ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                      }`}>
                        {s.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.time} · {s.instructor}
                      {s.description ? ` · ${s.description}` : ""}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteSession(s._id)}
                    className="shrink-0 text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete session"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Classes list ── */}
      {section === "classes" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-slate-700">
              All Classes{" "}
              <span className="text-gray-400 font-normal text-sm">({allClasses.length})</span>
            </h2>
          </div>
          {loadingClasses ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : allClasses.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400 text-sm">
              No classes yet.{" "}
              <button onClick={() => setSection("add")} className="text-orange-600 font-semibold hover:underline">Add one</button>
            </div>
          ) : (
            <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Category</th>
                    <th className="px-6 py-3 text-left">Level</th>
                    <th className="px-6 py-3 text-left">Instructor</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allClasses.slice(classPage * CLASS_PAGE_SIZE, (classPage + 1) * CLASS_PAGE_SIZE).map((cls) => (
                    <tr key={cls._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">{cls.title}</p>
                        {cls.subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{cls.subtitle}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          cls.category === "junior" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {cls.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{cls.level}</td>
                      <td className="px-6 py-4 text-gray-500">{cls.instructor}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(cls)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                            cls.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cls.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          {cls.isActive ? "Active" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteClass(cls)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                          title="Delete class"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {allClasses.length > CLASS_PAGE_SIZE && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {classPage * CLASS_PAGE_SIZE + 1}–{Math.min((classPage + 1) * CLASS_PAGE_SIZE, allClasses.length)} of {allClasses.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setClassPage((p) => p - 1)}
                    disabled={classPage === 0}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: Math.ceil(allClasses.length / CLASS_PAGE_SIZE) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setClassPage(i)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        classPage === i ? "bg-orange-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setClassPage((p) => p + 1)}
                    disabled={classPage >= Math.ceil(allClasses.length / CLASS_PAGE_SIZE) - 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      )}

      {/* ── Universities list ── */}
      {section === "universities" && (
        <div className="space-y-4">
          {loadingUnivs ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center text-gray-400 text-sm">Loading…</div>
          ) : universities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center text-gray-400 text-sm">
              No universities yet.{" "}
              <button onClick={() => setSection("add-university")} className="text-orange-600 font-semibold hover:underline">Add one</button>
            </div>
          ) : (
            universities.map((univ) => (
              <div key={univ._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-800">{univ.name}</p>
                    {univ.shortName && <p className="text-xs text-gray-400">{univ.shortName}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{univ.departments.length} departments</span>
                    <button
                      onClick={() => handleDeleteUniversity(univ._id, univ.name)}
                      className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete university"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {univ.departments.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {univ.departments.map((dept) => (
                      <div key={dept._id} className="px-6 py-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-700 font-medium">{dept.name}</span>
                          {dept.code && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{dept.code}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteDepartment(univ._id, dept._id, dept.name)}
                          className="text-red-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Remove department"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="px-6 py-3 text-xs text-gray-400">No departments added yet.</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Add University / Department form ── */}
      {section === "add-university" && (
        <div className="space-y-6">
          {/* Create University */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-5">Create New University</h2>
            <form onSubmit={handleCreateUniversity} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">University Name <span className="text-red-400">*</span></label>
                  <input
                    value={univForm.name}
                    onChange={(e) => setUnivForm((p) => ({ ...p, name: e.target.value }))}
                    required placeholder="e.g. Delhi University"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Short Name / Abbreviation</label>
                  <input
                    value={univForm.shortName}
                    onChange={(e) => setUnivForm((p) => ({ ...p, shortName: e.target.value }))}
                    placeholder="e.g. DU"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" disabled={univSaving}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                  {univSaving ? "Creating…" : "Create University"}
                </button>
                {univMsg && (
                  <p className={`text-sm font-medium ${univMsg.includes("!") ? "text-green-600" : "text-red-500"}`}>{univMsg}</p>
                )}
              </div>
            </form>
          </div>

          {/* Add Department */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-slate-700 mb-5">Add Department to University</h2>
            {universities.length === 0 ? (
              <p className="text-sm text-gray-400">Create a university first before adding departments.</p>
            ) : (
              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Select University <span className="text-red-400">*</span></label>
                  <select
                    value={deptForm.universityId}
                    onChange={(e) => setDeptForm((p) => ({ ...p, universityId: e.target.value }))}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">-- Select University --</option>
                    {universities.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}{u.shortName ? ` (${u.shortName})` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Department Name <span className="text-red-400">*</span></label>
                    <input
                      value={deptForm.name}
                      onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
                      required placeholder="e.g. Computer Science"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Department Code</label>
                    <input
                      value={deptForm.code}
                      onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value }))}
                      placeholder="e.g. CS"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" disabled={deptSaving}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                    {deptSaving ? "Adding…" : "Add Department"}
                  </button>
                  {deptMsg && (
                    <p className={`text-sm font-medium ${deptMsg.includes("!") ? "text-green-600" : "text-red-500"}`}>{deptMsg}</p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Add Class form ── */}
      {section === "add" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-700 mb-6">Create New Class</h2>
          <form onSubmit={handleClassSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Title <span className="text-red-400">*</span></label>
                <input name="title" value={classForm.title} onChange={handleClassChange} required placeholder="e.g. Maths Grade 5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                <input name="subtitle" value={classForm.subtitle} onChange={handleClassChange} placeholder="e.g. Fractions & Algebra"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Category <span className="text-red-400">*</span></label>
                <select name="category" value={classForm.category} onChange={handleClassChange} required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="junior">Junior</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Level</label>
                <select name="level" value={classForm.level} onChange={handleClassChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor</label>
                <input name="instructor" value={classForm.instructor} onChange={handleClassChange} placeholder="AcadLearn Team"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Duration</label>
                <input name="duration" value={classForm.duration} onChange={handleClassChange} placeholder="e.g. 12 weeks"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Lessons</label>
                <input name="totalLessons" type="number" min="0" value={classForm.totalLessons} onChange={handleClassChange} placeholder="e.g. 24"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Badge</label>
                <select name="badge" value={classForm.badge} onChange={handleClassChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value="">None</option>
                  <option value="Popular">Popular</option>
                  <option value="New">New</option>
                  <option value="Free">Free</option>
                  <option value="Top Rated">Top Rated</option>
                  <option value="Limited Seats">Limited Seats</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
              <textarea name="description" value={classForm.description} onChange={handleClassChange} rows={4}
                placeholder="Brief overview of this class…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={classSaving}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60">
                {classSaving ? "Creating…" : "Create Class"}
              </button>
              <button type="button" onClick={() => { setClassForm(EMPTY_CLASS); setClassMsg(""); }}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                Reset
              </button>
              {classMsg && (
                <p className={`text-sm font-medium ${classMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>
                  {classMsg}
                </p>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminTab;
