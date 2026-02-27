import { useState, useEffect, useCallback, useRef } from "react";
import API_BASE from "../config/api";
import { authHeader } from "./constants";

// Convert any string to a URL-safe slug
const toSlug = (str) =>
  str.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// ── Icons ──────────────────────────────────────────────────────────────────────
const IconEdit = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTrash = ({ sm }) => (
  <svg className={sm ? "w-3.5 h-3.5" : "w-4 h-4"} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconCheck = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const IconX = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const INPUT = "border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";

// ── Add/Edit University Modal ──────────────────────────────────────────────────
const UniversityModal = ({ token, editUniv, onClose, onSaved }) => {
  const isEdit = Boolean(editUniv);

  // Step 1 form (create) or edit form
  const [univForm,    setUnivForm]    = useState({
    name:      editUniv?.name      || "",
    shortName: editUniv?.shortName || "",
    slug:      editUniv?.slug      || "",
    logoUrl:   editUniv?.logoUrl   || "",
  });
  const [univSaving,  setUnivSaving]  = useState(false);
  const [univErr,     setUnivErr]     = useState("");

  // Slug state
  const [slugEdited,    setSlugEdited]    = useState(isEdit && !!editUniv?.slug); // true = user manually typed
  const [slugStatus,    setSlugStatus]    = useState(null);  // null | "checking" | "available" | "taken"
  const slugCheckTimer  = useRef(null);

  // Auto-generate slug when name changes (only if user hasn't manually edited it)
  useEffect(() => {
    if (slugEdited) return;
    const generated = toSlug(univForm.name);
    setUnivForm((p) => ({ ...p, slug: generated }));
  }, [univForm.name, slugEdited]);

  // Check slug availability whenever slug changes (debounced 500ms)
  useEffect(() => {
    const slug = univForm.slug;
    if (!slug) { setSlugStatus(null); return; }
    // Skip check if it's the same as the current saved slug (edit mode)
    if (isEdit && slug === editUniv?.slug) { setSlugStatus("available"); return; }
    clearTimeout(slugCheckTimer.current);
    setSlugStatus("checking");
    slugCheckTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/universities/slug/${slug}`);
        setSlugStatus(res.ok ? "taken" : "available");
      } catch {
        setSlugStatus(null);
      }
    }, 500);
    return () => clearTimeout(slugCheckTimer.current);
  }, [univForm.slug, isEdit, editUniv?.slug]);

  // Step 2 (add departments) — only for new university
  const [step,        setStep]        = useState(isEdit ? 2 : 1);
  const [createdUniv, setCreatedUniv] = useState(editUniv || null);

  // Department form
  const [deptForm,    setDeptForm]    = useState({ name: "", code: "" });
  const [deptSaving,  setDeptSaving]  = useState(false);
  const [deptMsg,     setDeptMsg]     = useState({ text: "", ok: false });

  // Inline edit for existing departments
  const [editingDept, setEditingDept] = useState(null); // { _id, name, code }
  const [deptEditSaving, setDeptEditSaving] = useState(false);

  const handleSaveUniversity = async (e) => {
    e.preventDefault();
    if (slugStatus === "taken") { setUnivErr("This URL slug is already taken. Choose a different one."); return; }
    if (slugStatus === "checking") { setUnivErr("Please wait — checking slug availability…"); return; }
    setUnivSaving(true); setUnivErr("");
    try {
      const url   = isEdit ? `${API_BASE}/api/universities/${editUniv._id}` : `${API_BASE}/api/universities`;
      const method = isEdit ? "PUT" : "POST";
      const res   = await fetch(url, { method, headers: authHeader(token), body: JSON.stringify(univForm) });
      const data  = await res.json();
      if (!res.ok) { setUnivErr(data.message || "Failed"); return; }
      if (isEdit) { onSaved(); onClose(); return; }
      setCreatedUniv(data);
      setStep(2);
    } catch { setUnivErr("Server error."); }
    finally { setUnivSaving(false); }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    setDeptSaving(true); setDeptMsg({ text: "", ok: false });
    try {
      const res  = await fetch(`${API_BASE}/api/universities/${createdUniv._id}/departments`, {
        method: "POST", headers: authHeader(token),
        body: JSON.stringify({ name: deptForm.name, code: deptForm.code }),
      });
      const data = await res.json();
      if (!res.ok) { setDeptMsg({ text: data.message || "Failed", ok: false }); return; }
      setCreatedUniv(data);
      setDeptForm({ name: "", code: "" });
      setDeptMsg({ text: `"${deptForm.name}" added!`, ok: true });
      onSaved(); // refresh list in background
    } catch { setDeptMsg({ text: "Server error.", ok: false }); }
    finally { setDeptSaving(false); }
  };

  const handleSaveDeptEdit = async () => {
    if (!editingDept.name.trim()) return;
    setDeptEditSaving(true);
    try {
      const res  = await fetch(`${API_BASE}/api/universities/${createdUniv._id}/departments/${editingDept._id}`, {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({ name: editingDept.name, code: editingDept.code }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setCreatedUniv(data);
      setEditingDept(null);
      onSaved();
    } catch {}
    finally { setDeptEditSaving(false); }
  };

  const handleDeleteDeptInModal = async (deptId, deptName) => {
    if (!window.confirm(`Remove "${deptName}"?`)) return;
    try {
      const res  = await fetch(`${API_BASE}/api/universities/${createdUniv._id}/departments/${deptId}`, {
        method: "DELETE", headers: authHeader(token),
      });
      const data = await res.json();
      if (!res.ok) return;
      setCreatedUniv(data);
      onSaved();
    } catch {}
  };

  const handleDone = () => { onSaved(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {step === 1 ? "Add University" : (isEdit ? `Edit: ${editUniv.name}` : createdUniv?.name)}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1
                ? "Step 1 of 2 — University details"
                : isEdit
                  ? "Edit name / manage departments"
                  : "Step 2 — Add departments"}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <IconX />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* University name form (step 1 for new, always shown for edit) */}
          {(step === 1 || isEdit) && (
            <form onSubmit={handleSaveUniversity} className="space-y-3">
              {isEdit && <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">University Details</p>}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  University Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={univForm.name}
                  onChange={(e) => setUnivForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Delhi University"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Short Name</label>
                <input
                  value={univForm.shortName}
                  onChange={(e) => setUnivForm((p) => ({ ...p, shortName: e.target.value }))}
                  placeholder="e.g. DU"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  URL Slug
                  <span className="ml-1 font-normal text-gray-400">(for shareable link)</span>
                </label>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-400">
                  <span className="text-xs text-gray-400 bg-gray-50 px-3 py-2.5 border-r border-gray-200 whitespace-nowrap">/org/</span>
                  <input
                    value={univForm.slug}
                    onChange={(e) => {
                      setSlugEdited(true);
                      setUnivForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/--+/g, "-") }));
                    }}
                    placeholder="delhi-university"
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-white"
                  />
                  {/* Availability indicator inside the input box */}
                  <div className="pr-3 shrink-0">
                    {slugStatus === "checking" && (
                      <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                    )}
                    {slugStatus === "available" && (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {slugStatus === "taken" && (
                      <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                </div>
                {/* Status text */}
                {slugStatus === "available" && univForm.slug && (
                  <p className="text-[11px] text-green-600 mt-1 font-semibold flex items-center gap-1">
                    ✓ Available — Share: {window.location.origin}/org/{univForm.slug}
                  </p>
                )}
                {slugStatus === "taken" && (
                  <p className="text-[11px] text-red-500 mt-1 font-semibold">✗ This slug is already taken. Choose a different one.</p>
                )}
                {slugStatus === "checking" && (
                  <p className="text-[11px] text-gray-400 mt-1">Checking availability…</p>
                )}
                {!slugStatus && univForm.slug && (
                  <p className="text-[11px] text-orange-500 mt-1 font-semibold">
                    Share: {window.location.origin}/org/{univForm.slug}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Logo URL (optional)</label>
                <input
                  value={univForm.logoUrl}
                  onChange={(e) => setUnivForm((p) => ({ ...p, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {univErr && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{univErr}</p>}
              <button
                type="submit" disabled={univSaving}
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
              >
                {univSaving
                  ? "Saving…"
                  : isEdit
                    ? "Save Changes"
                    : "Create & Add Departments →"}
              </button>
            </form>
          )}

          {/* Departments section (step 2 or edit mode) */}
          {step === 2 && (
            <>
              {/* Existing departments — horizontal scroll chips */}
              {createdUniv?.departments?.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Departments ({createdUniv.departments.length})
                  </p>

                  {/* Inline edit form (shown when editing a dept) */}
                  {editingDept && (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white rounded-xl border border-orange-200">
                      <input
                        value={editingDept.name}
                        onChange={(e) => setEditingDept((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Dept name"
                        className={`flex-1 ${INPUT}`}
                        autoFocus
                      />
                      <input
                        value={editingDept.code}
                        onChange={(e) => setEditingDept((p) => ({ ...p, code: e.target.value }))}
                        placeholder="Code"
                        className={`w-16 ${INPUT}`}
                      />
                      <button
                        onClick={handleSaveDeptEdit}
                        disabled={deptEditSaving}
                        className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
                        title="Save"
                      >
                        <IconCheck />
                      </button>
                      <button
                        onClick={() => setEditingDept(null)}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                        title="Cancel"
                      >
                        <IconX />
                      </button>
                    </div>
                  )}

                  {/* Horizontally scrollable chips */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {createdUniv.departments.map((d) => (
                      <div
                        key={d._id}
                        className={`flex items-center gap-1.5 shrink-0 border rounded-full pl-3 pr-1.5 py-1.5 group transition-colors ${
                          editingDept?._id === d._id
                            ? "bg-orange-50 border-orange-300"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <span className="text-sm text-slate-700 font-medium whitespace-nowrap">{d.name}</span>
                        {d.code && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 whitespace-nowrap">
                            {d.code}
                          </span>
                        )}
                        <button
                          onClick={() => setEditingDept({ _id: d._id, name: d.name, code: d.code || "" })}
                          className="p-1 rounded-full text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <IconEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteDeptInModal(d._id, d.name)}
                          className="p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >
                          <IconX />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add department form */}
              <form onSubmit={handleAddDepartment} className="space-y-3">
                <p className="text-xs font-semibold text-slate-600">Add New Department</p>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Department Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    required
                    value={deptForm.name}
                    onChange={(e) => setDeptForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Computer Science"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Department Code</label>
                  <input
                    value={deptForm.code}
                    onChange={(e) => setDeptForm((p) => ({ ...p, code: e.target.value }))}
                    placeholder="e.g. CS"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                {deptMsg.text && (
                  <p className={`text-xs px-4 py-2.5 rounded-xl ${deptMsg.ok ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                    {deptMsg.text}
                  </p>
                )}
                <button
                  type="submit" disabled={deptSaving}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  {deptSaving ? "Adding…" : "+ Add Department"}
                </button>
              </form>

              <button
                onClick={handleDone}
                className="w-full py-2.5 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 text-sm font-bold rounded-xl transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Tab ───────────────────────────────────────────────────────────────────
const UniversitiesTab = ({ token }) => {
  const [universities, setUniversities] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(null); // null | "add" | { editUniv }

  const loadUniversities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/universities/all`, { headers: authHeader(token) });
      if (!res.ok) throw new Error();
      setUniversities(await res.json());
    } catch { setUniversities([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadUniversities(); }, [loadUniversities]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its departments?`)) return;
    try {
      await fetch(`${API_BASE}/api/universities/${id}`, { method: "DELETE", headers: authHeader(token) });
      await loadUniversities();
    } catch { alert("Could not delete."); }
  };

  const handleDeleteDept = async (univId, deptId, deptName) => {
    if (!window.confirm(`Remove department "${deptName}"?`)) return;
    try {
      await fetch(`${API_BASE}/api/universities/${univId}/departments/${deptId}`, {
        method: "DELETE", headers: authHeader(token),
      });
      await loadUniversities();
    } catch { alert("Could not remove department."); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Universities</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage universities and their departments</p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add University
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : universities.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 px-6 py-16 text-center">
          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">No universities yet</p>
          <p className="text-xs text-gray-400 mt-1">Click "Add University" to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {universities.map((univ) => (
            <div key={univ._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* University header row */}
              <div className="px-6 py-4 flex items-center justify-between gap-4 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  {univ.logoUrl ? (
                    <img src={univ.logoUrl} alt={univ.name} className="w-10 h-10 rounded-xl object-contain border border-gray-100 bg-white p-0.5 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-800">{univ.name}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {univ.shortName && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                          {univ.shortName}
                        </span>
                      )}
                      {univ.slug && (
                        <a
                          href={`/org/${univ.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          /org/{univ.slug}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-medium">
                    {univ.departments.length} dept{univ.departments.length !== 1 ? "s" : ""}
                  </span>
                  {/* Edit university */}
                  <button
                    onClick={() => setModal({ editUniv: univ })}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                    title="Edit university"
                  >
                    <IconEdit />
                  </button>
                  {/* Delete university */}
                  <button
                    onClick={() => handleDelete(univ._id, univ.name)}
                    className="p-1.5 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete university"
                  >
                    <IconTrash />
                  </button>
                </div>
              </div>

              {/* Departments — horizontal scroll chips */}
              {univ.departments.length === 0 ? (
                <p className="px-6 py-3 text-xs text-gray-400 italic">No departments added.</p>
              ) : (
                <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
                  {univ.departments.map((dept) => (
                    <div
                      key={dept._id}
                      className="flex items-center gap-1.5 shrink-0 bg-gray-50 border border-gray-200 rounded-full pl-3 pr-1.5 py-1.5 group"
                    >
                      <span className="text-sm text-slate-700 font-medium whitespace-nowrap">{dept.name}</span>
                      {dept.code && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600 whitespace-nowrap">
                          {dept.code}
                        </span>
                      )}
                      {/* Edit */}
                      <button
                        onClick={() => setModal({ editUniv: univ })}
                        className="p-1 rounded-full text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <IconEdit />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteDept(univ._id, dept._id, dept.name)}
                        className="p-1 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove"
                      >
                        <IconX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <UniversityModal
          token={token}
          editUniv={modal === "add" ? null : modal.editUniv}
          onClose={() => setModal(null)}
          onSaved={loadUniversities}
        />
      )}
    </div>
  );
};

export default UniversitiesTab;
