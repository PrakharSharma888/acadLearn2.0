import { useState, useEffect, useCallback } from "react";
import API_BASE from "../config/api";
import { authHeader } from "./constants";

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  category: "junior",
  level: "Beginner",
  instructor: "AcadLearn Team",
  description: "",
  duration: "",
  badge: "",
  totalLessons: "",
};

const AdminTab = ({ token }) => {
  // ── section ──────────────────────────────────────────────────────────────
  const [section, setSection] = useState("classes"); // "classes" | "add"

  // ── all classes (including inactive) ─────────────────────────────────────
  const [allClasses, setAllClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const loadAllClasses = useCallback(async () => {
    setLoadingClasses(true);
    try {
      // fetch all (admin can see active + inactive via this endpoint)
      const res = await fetch(`${API_BASE}/api/classes`, {
        headers: authHeader(token),
      });
      if (!res.ok) throw new Error();
      setAllClasses(await res.json());
    } catch {
      setAllClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, [token]);

  useEffect(() => {
    loadAllClasses();
  }, [loadAllClasses]);

  // ── create class form ─────────────────────────────────────────────────────
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    try {
      const payload = {
        ...form,
        totalLessons: form.totalLessons ? Number(form.totalLessons) : 0,
      };
      const res = await fetch(`${API_BASE}/api/classes`, {
        method: "POST",
        headers: authHeader(token),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        setSaveMsg(err.message || "Failed to create class.");
        return;
      }
      setSaveMsg("Class created successfully!");
      setForm(EMPTY_FORM);
      await loadAllClasses();
    } catch {
      setSaveMsg("Server error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── toggle active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (cls) => {
    try {
      const res = await fetch(`${API_BASE}/api/classes/${cls._id}`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({ isActive: !cls.isActive }),
      });
      if (!res.ok) throw new Error();
      await loadAllClasses();
    } catch {
      alert("Could not update class status.");
    }
  };

  // ── delete class ──────────────────────────────────────────────────────────
  const handleDelete = async (cls) => {
    if (!window.confirm(`Delete "${cls.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/classes/${cls._id}`, {
        method: "DELETE",
        headers: authHeader(token),
      });
      if (!res.ok) throw new Error();
      await loadAllClasses();
    } catch {
      alert("Could not delete class.");
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage classes and courses</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSection("classes")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              section === "classes"
                ? "bg-orange-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setSection("add")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              section === "add"
                ? "bg-orange-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            + Add Class
          </button>
        </div>
      </div>

      {/* ── Classes list ── */}
      {section === "classes" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
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
              <button
                onClick={() => setSection("add")}
                className="text-orange-600 font-semibold hover:underline"
              >
                Add one
              </button>
            </div>
          ) : (
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
                  {allClasses.map((cls) => (
                    <tr key={cls._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-700">{cls.title}</p>
                        {cls.subtitle && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
                            {cls.subtitle}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            cls.category === "junior"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {cls.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{cls.level}</td>
                      <td className="px-6 py-4 text-gray-500">{cls.instructor}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(cls)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-colors ${
                            cls.isActive
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              cls.isActive ? "bg-green-500" : "bg-gray-400"
                            }`}
                          />
                          {cls.isActive ? "Active" : "Hidden"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(cls)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                          title="Delete class"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Add Class form ── */}
      {section === "add" && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-slate-700 mb-6">Create New Class</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: title + subtitle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Maths Grade 5"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                <input
                  name="subtitle"
                  value={form.subtitle}
                  onChange={handleChange}
                  placeholder="e.g. Fractions & Algebra"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Row 2: category + level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Category <span className="text-red-400">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="junior">Junior</option>
                  <option value="professional">Professional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Level</label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            {/* Row 3: instructor + duration + totalLessons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor</label>
                <input
                  name="instructor"
                  value={form.instructor}
                  onChange={handleChange}
                  placeholder="AcadLearn Team"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Duration</label>
                <input
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  placeholder="e.g. 12 weeks"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Lessons</label>
                <input
                  name="totalLessons"
                  type="number"
                  min="0"
                  value={form.totalLessons}
                  onChange={handleChange}
                  placeholder="e.g. 24"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Badge */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Badge</label>
                <select
                  name="badge"
                  value={form.badge}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">None</option>
                  <option value="Popular">Popular</option>
                  <option value="New">New</option>
                  <option value="Free">Free</option>
                  <option value="Top Rated">Top Rated</option>
                  <option value="Limited Seats">Limited Seats</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Brief overview of this class…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
              >
                {saving ? "Creating…" : "Create Class"}
              </button>
              <button
                type="button"
                onClick={() => { setForm(EMPTY_FORM); setSaveMsg(""); }}
                className="px-6 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              {saveMsg && (
                <p
                  className={`text-sm font-medium ${
                    saveMsg.includes("success") ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {saveMsg}
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
