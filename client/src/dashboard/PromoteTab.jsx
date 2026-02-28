import { useState, useEffect, useCallback } from "react";
import API_BASE from "../config/api";
import { authHeader } from "./constants";

const EMPTY_FORM = {
  title: "",
  imageUrl: "",
  link: "",
  showOn: "both",
  order: 0,
  classId:            "",
  className:          "",
  classSlug:          "",
  department:         "",
  category:           "",
  eventDate:          "",
  eventTime:          "",
  universityId:       "",
  universityName:     "",
  targetDepartments:  [],
  allowPublicBooking: true,
  eventId:            "",
};

const SHOW_ON_LABELS = { junior: "Junior", professional: "Professional", both: "Both" };
const SHOW_ON_COLORS = {
  junior:       "bg-orange-50 text-orange-600 border border-orange-200",
  professional: "bg-blue-50 text-blue-600 border border-blue-200",
  both:         "bg-purple-50 text-purple-600 border border-purple-200",
};

const PAGE_SIZE = 10;

const PromoteTab = ({ token }) => {
  const [banners, setBanners]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [preview, setPreview]       = useState("");
  const [saving, setSaving]         = useState(false);
  const [msg, setMsg]               = useState("");
  const [editId, setEditId]         = useState(null);
  const [toggling, setToggling]     = useState(null);
  const [showModal, setShowModal]   = useState(false);
  const [page, setPage]             = useState(0);
  const [allClasses, setAllClasses] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [allEvents,  setAllEvents]  = useState([]);

  // Load classes + universities + events when modal opens
  useEffect(() => {
    if (!showModal) return;
    Promise.all([
      fetch(`${API_BASE}/api/classes`, { headers: authHeader(token) })
        .then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/api/universities`)
        .then((r) => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/api/events/all`, { headers: authHeader(token) })
        .then((r) => r.ok ? r.json() : []).catch(() => []),
    ]).then(([classes, univs, events]) => {
      setAllClasses(classes);
      setUniversities(univs);
      setAllEvents(events);
    });
  }, [showModal, token]);

  const handleUniversitySelect = (e) => {
    const id = e.target.value;
    if (!id) {
      setForm((f) => ({ ...f, universityId: "", universityName: "", targetDepartments: [] }));
      return;
    }
    const univ = universities.find((u) => u._id === id);
    if (univ) {
      setForm((f) => ({ ...f, universityId: univ._id, universityName: univ.name, targetDepartments: [] }));
    }
  };

  const toggleDepartment = (deptName) => {
    setForm((f) => {
      const already = f.targetDepartments.includes(deptName);
      return {
        ...f,
        targetDepartments: already
          ? f.targetDepartments.filter((d) => d !== deptName)
          : [...f.targetDepartments, deptName],
      };
    });
  };

  const handleClassSelect = (e) => {
    const id = e.target.value;
    if (!id) {
      setForm((f) => ({ ...f, classId: "", className: "", classSlug: "", category: "" }));
      return;
    }
    const cls = allClasses.find((c) => c._id === id);
    if (cls) {
      setForm((f) => ({
        ...f,
        classId:   cls._id,
        className: cls.title,
        classSlug: cls.slug || cls._id,
        category:  cls.category || "",
      }));
    }
  };

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/banners/all`, { headers: authHeader(token) });
      if (!res.ok) throw new Error();
      setBanners(await res.json());
    } catch { setBanners([]); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadBanners(); }, [loadBanners]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const payload = { ...form, order: Number(form.order) || 0 };
      const url    = editId ? `${API_BASE}/api/banners/${editId}` : `${API_BASE}/api/banners`;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: authHeader(token), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { setMsg(data.message || "Failed"); return; }
      setMsg(editId ? "Banner updated!" : "Banner created!");
      setForm(EMPTY_FORM); setEditId(null); setPreview("");
      await loadBanners();
      setTimeout(() => { setShowModal(false); setMsg(""); }, 1000);
    } catch { setMsg("Server error."); }
    finally { setSaving(false); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setMsg("Image too large! Maximum allowed size is 2MB.");
      e.target.value = "";
      return;
    }
    setMsg("");
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setPreview(dataUrl);
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (b) => {
    setForm({
      title: b.title, imageUrl: b.imageUrl, link: b.link || "",
      showOn: b.showOn, order: b.order || 0,
      classId:           b.classId           || "",
      className:         b.className         || "",
      classSlug:         b.classSlug         || "",
      department:        b.department        || "",
      category:          b.category          || "",
      eventDate:         b.eventDate         || "",
      eventTime:         b.eventTime         || "",
      universityId:      b.universityId      || "",
      universityName:    b.universityName    || "",
      targetDepartments: Array.isArray(b.targetDepartments) ? b.targetDepartments : [],
      allowPublicBooking: b.allowPublicBooking !== false,
      eventId: b.eventId || "",
    });
    setPreview(b.imageUrl);
    setEditId(b._id); setMsg("");
    setShowModal(true);
  };

  const handleCancelEdit = () => {
    setForm(EMPTY_FORM); setEditId(null); setPreview(""); setMsg("");
    setShowModal(false);
  };

  const handleToggle = async (b) => {
    setToggling(b._id);
    try {
      const res = await fetch(`${API_BASE}/api/banners/${b._id}`, {
        method: "PUT", headers: authHeader(token),
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      if (!res.ok) throw new Error();
      await loadBanners();
    } catch { alert("Could not update banner."); }
    finally { setToggling(null); }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete banner "${b.title}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/banners/${b._id}`, {
        method: "DELETE", headers: authHeader(token),
      });
      if (!res.ok) throw new Error();
      await loadBanners();
      if (page > 0 && page * PAGE_SIZE >= banners.length - 1) setPage((p) => p - 1);
    } catch { alert("Could not delete banner."); }
  };

  const totalPages = Math.ceil(banners.length / PAGE_SIZE);
  const paginated  = banners.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-6">

      {/* ── Page heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Campaigns & Promotions</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage banners shown on Junior and Professional home pages</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setPreview(""); setEditId(null); setMsg(""); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Banner
        </button>
      </div>

      {/* ── Banner list ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-5">
          All Banners
          {banners.length > 0 && (
            <span className="ml-2 text-gray-400 font-normal text-sm">({banners.length})</span>
          )}
        </h2>
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : banners.length === 0 ? (
          <p className="text-sm text-gray-400">No banners yet. Create one using the button above.</p>
        ) : (
          <>
            <div className="space-y-4">
              {paginated.map((b) => (
                <div key={b._id}
                  className={`flex gap-4 p-4 rounded-2xl border ${b.isActive ? "border-gray-100 bg-gray-50" : "border-gray-200 bg-gray-100 opacity-60"}`}
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-200">
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-slate-800 text-sm truncate">{b.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SHOW_ON_COLORS[b.showOn]}`}>
                        {SHOW_ON_LABELS[b.showOn]}
                      </span>
                      {!b.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">Inactive</span>
                      )}
                    </div>
                    {b.className && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="text-[10px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          {b.className}
                        </span>
                        {b.department && (
                          <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                            {b.department}
                          </span>
                        )}
                        {b.classSlug && (
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {b.classSlug}
                          </span>
                        )}
                      </div>
                    )}
                    {b.link && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">{b.link}</p>
                    )}
                    {b.universityName && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          {b.universityName}
                        </span>
                        {Array.isArray(b.targetDepartments) && b.targetDepartments.map((d) => (
                          <span key={d} className="text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                            {d}
                          </span>
                        ))}
                        {b.allowPublicBooking === false && (
                          <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            🔒 Banner-only booking
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-0.5">Order: {b.order}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(b)}
                      disabled={toggling === b._id}
                      title={b.isActive ? "Deactivate" : "Activate"}
                      className={`p-2 rounded-lg text-xs font-semibold transition-colors ${b.isActive ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-gray-200 text-gray-500 hover:bg-gray-300"}`}
                    >
                      {b.isActive ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      )}
                    </button>
                    <button onClick={() => handleEdit(b)} title="Edit"
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(b)} title="Delete"
                      className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, banners.length)} of {banners.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={page === 0}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                        page === i ? "bg-orange-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= totalPages - 1}
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

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancelEdit} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-400 p-6 text-white z-10">
              <button
                onClick={handleCancelEdit}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">Promotions</p>
              <h2 className="text-xl font-bold">{editId ? "Edit Banner" : "Create New Banner"}</h2>
              <p className="text-orange-100 text-sm mt-1">
                {editId ? "Update the banner details below" : "Fill in the details to create a new promotional banner"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Left: fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Banner Title *</label>
                      <input
                        name="title" value={form.title} onChange={handleChange} required
                        placeholder="e.g. Summer Sale — 50% Off!"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Click Link (optional)</label>
                      <input
                        name="link" value={form.link} onChange={handleChange}
                        placeholder="https://... or /login"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Show On</label>
                      <select
                        name="showOn" value={form.showOn} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="both">Both (Junior + Professional)</option>
                        <option value="junior">Junior only</option>
                        <option value="professional">Professional only</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Display Order</label>
                      <input
                        name="order" type="number" value={form.order} onChange={handleChange}
                        placeholder="0 = first"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>

                  {/* Image input */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Banner Image *
                      <span className="ml-2 text-[10px] font-normal text-orange-500 bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
                        Recommended: 1200×400 px · 16:9 ratio · max 2MB
                      </span>
                    </label>
                    <label className="flex items-center gap-2 w-full border border-dashed border-gray-300 rounded-xl px-3 py-2 text-sm cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors mb-2">
                      <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-gray-500">Upload image from device</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <input
                      name="imageUrl" value={form.imageUrl}
                      onChange={(e) => { handleChange(e); setPreview(e.target.value); }}
                      placeholder="...ya paste karo image URL"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  {/* ── Link to Class (Book Demo auto-fill) ── */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Demo Booking Link (optional)</p>
                    <p className="text-[11px] text-gray-400 -mt-2">Isse banner click hone par Book Demo modal auto-fill hoga</p>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Link to Class</label>
                      <select
                        value={form.classId}
                        onChange={handleClassSelect}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="">— Select a class (optional) —</option>
                        {allClasses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.title} ({c.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Class Slug / Code</label>
                        <input
                          name="classSlug" value={form.classSlug} onChange={handleChange}
                          placeholder="auto-filled ya manually type karo"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                        <input
                          name="department" value={form.department} onChange={handleChange}
                          placeholder="e.g. Computer Science"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>
                    {form.classId && (
                      <div className="flex items-center gap-2 flex-wrap pt-1">
                        <span className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                          Class linked
                        </span>
                        <span className="text-[11px] text-gray-500">{form.className}</span>
                        {form.category && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            form.category === "junior" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>{form.category}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ── Event Date & Time (shown on carousel) ── */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Event Date &amp; Time (optional)</p>
                    <p className="text-[11px] text-gray-400 -mt-2">Banner ke upar "Next Demo: date time" ka pill dikhaega</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Event Date</label>
                        <input
                          type="date"
                          name="eventDate"
                          value={form.eventDate}
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Event Time</label>
                        <input
                          type="time"
                          name="eventTime"
                          value={form.eventTime}
                          onChange={handleChange}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                      </div>
                    </div>
                    {form.eventDate && (
                      <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2">
                        <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-semibold text-orange-700">
                          {form.eventDate}{form.eventTime ? ` at ${form.eventTime}` : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Link to Event ── */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Link to Event (optional)</p>
                    <p className="text-[11px] text-gray-400 -mt-2">Banner click hone par seedha event registration page khulega</p>
                    <select
                      value={form.eventId}
                      onChange={(e) => setForm((f) => ({ ...f, eventId: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    >
                      <option value="">— No event linked —</option>
                      {allEvents.map((ev) => (
                        <option key={ev._id} value={ev._id}>
                          {ev.title} · {ev.date} · {ev.isFree ? "Free" : `₹${ev.price}`}
                          {ev.totalSlots > 0 ? ` · ${ev.totalSlots - ev.registeredCount} slots left` : ""}
                        </option>
                      ))}
                    </select>
                    {form.eventId && (() => {
                      const ev = allEvents.find((e) => e._id === form.eventId);
                      if (!ev) return null;
                      const left = ev.totalSlots > 0 ? ev.totalSlots - ev.registeredCount : null;
                      return (
                        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-2 flex-wrap">
                          <span className="text-xs font-semibold text-indigo-700">{ev.title}</span>
                          {ev.isFree
                            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">FREE</span>
                            : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">₹{ev.price}</span>
                          }
                          {left !== null && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${left <= 0 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                              {left <= 0 ? "FULL" : `${left} slots left`}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* ── Target University & Departments ── */}
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Target University &amp; Departments (optional)</p>
                    <p className="text-[11px] text-gray-400 -mt-2">Ye banner kisi specific university ke students ko target karega</p>

                    {/* University select */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">University</label>
                      <select
                        value={form.universityId}
                        onChange={handleUniversitySelect}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      >
                        <option value="">— Select a university (optional) —</option>
                        {universities.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name}{u.shortName ? ` (${u.shortName})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Department chips — shown when a university is selected */}
                    {form.universityId && (() => {
                      const univ = universities.find((u) => u._id === form.universityId);
                      const depts = univ?.departments || [];
                      return depts.length > 0 ? (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-2">
                            Departments <span className="text-gray-400 font-normal">(multiple select kar sakte ho)</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {depts.map((d) => {
                              const selected = form.targetDepartments.includes(d.name);
                              return (
                                <button
                                  key={d._id || d.name}
                                  type="button"
                                  onClick={() => toggleDepartment(d.name)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                    selected
                                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                      : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"
                                  }`}
                                >
                                  {selected && <span className="mr-1">✓</span>}
                                  {d.name}
                                  {d.code && <span className="ml-1 opacity-60 text-[10px]">({d.code})</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">Is university mein koi department nahi hai abhi.</p>
                      );
                    })()}

                    {/* Selected summary */}
                    {form.universityId && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                          {form.universityName}
                        </span>
                        {form.targetDepartments.map((d) => (
                          <span
                            key={d}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold bg-purple-50 border border-purple-200 text-purple-700 px-2.5 py-1 rounded-full"
                          >
                            {d}
                            <button
                              type="button"
                              onClick={() => toggleDepartment(d)}
                              className="text-purple-400 hover:text-purple-700 leading-none"
                            >×</button>
                          </span>
                        ))}
                        {form.targetDepartments.length === 0 && (
                          <span className="text-[11px] text-gray-400 italic">Koi department select nahi</span>
                        )}
                      </div>
                    )}

                    {/* Allow public booking toggle — only shown when university is linked */}
                    {form.universityId && (
                      <label className="flex items-start gap-3 cursor-pointer mt-2 p-3 rounded-xl border border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={form.allowPublicBooking}
                          onChange={(e) => setForm((f) => ({ ...f, allowPublicBooking: e.target.checked }))}
                          className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-gray-700 leading-snug">
                            Allow all users to book directly
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {form.allowPublicBooking
                              ? "Sabhi users course card se bhi book kar sakte hain (default)"
                              : "Sirf banner click se booking hogi — course card ka button disable ho jaayega"}
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Right: live preview */}
                <div className="lg:w-72 shrink-0">
                  <p className="text-xs font-semibold text-gray-500 mb-2">Live Preview</p>
                  <div className={`w-full h-44 rounded-2xl border-2 border-dashed overflow-hidden flex items-center justify-center transition-all ${preview ? "border-orange-300 bg-gray-50" : "border-gray-200 bg-gray-50"}`}>
                    {preview ? (
                      <img
                        src={preview}
                        alt="Banner preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    ) : (
                      <div className="text-center text-gray-300 px-4">
                        <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">Image upload karo ya URL paste karo</p>
                      </div>
                    )}
                  </div>
                  {preview && (
                    <p className="text-[10px] text-gray-400 mt-1 text-center">Aise dikhega landing page par</p>
                  )}
                </div>
              </div>

              {msg && (
                <p className={`text-sm font-medium ${msg.includes("!") ? "text-green-600" : "text-red-500"}`}>{msg}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editId ? "Update Banner" : "Create Banner"}
                </button>
                <button type="button" onClick={handleCancelEdit}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromoteTab;
