import { useState } from "react";
import ClassCard from "../components/ClassCard";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const CATEGORIES = [
  { key: "junior",       label: "Junior" },
  { key: "professional", label: "Professional" },
  { key: "all",          label: "All" },
];

const EMPTY_FORM = {
  title: "",
  subtitle: "",
  category: "junior",
  level: "Beginner",
  instructor: "",
  duration: "",
  badge: "",
  description: "",
  price: "",
  isActive: true,
};

const EMPTY_LESSON   = () => ({ title: "", duration: "", description: "" });
const EMPTY_SUBJECT  = () => ({ title: "", lessons: [EMPTY_LESSON()] });

// ── Single lesson row inside a subject ──────────────────────────────────────
const LessonRow = ({ lesson, lessonIdx, subjectIdx, onChange, onRemove, canRemove }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2 items-start pl-4 border-l-2 border-orange-100">
    <input
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
      placeholder="Lesson title"
      value={lesson.title}
      onChange={(e) => onChange(subjectIdx, lessonIdx, "title", e.target.value)}
    />
    <input
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white"
      placeholder="Duration (e.g. 45 min)"
      value={lesson.duration}
      onChange={(e) => onChange(subjectIdx, lessonIdx, "duration", e.target.value)}
    />
    {canRemove ? (
      <button
        type="button"
        onClick={() => onRemove(subjectIdx, lessonIdx)}
        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove lesson"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    ) : (
      <div className="w-8" />
    )}
    <div className="sm:col-span-3 pl-0">
      <textarea
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 bg-white resize-none"
        placeholder="Lesson description (optional)"
        rows={2}
        value={lesson.description}
        onChange={(e) => onChange(subjectIdx, lessonIdx, "description", e.target.value)}
      />
    </div>
  </div>
);

// ── Subject block with its lessons ──────────────────────────────────────────
const SubjectBlock = ({ subject, subjectIdx, onSubjectTitleChange, onAddLesson, onLessonChange, onRemoveLesson, onRemoveSubject, canRemove }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    {/* Subject header */}
    <div className="flex items-center gap-2 bg-orange-50 px-4 py-3 border-b border-orange-100">
      <span className="text-xs font-bold text-orange-500 uppercase tracking-wide shrink-0">
        Subject {subjectIdx + 1}
      </span>
      <input
        className="flex-1 border border-orange-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
        placeholder="Subject title (e.g. Introduction to Python)"
        value={subject.title}
        onChange={(e) => onSubjectTitleChange(subjectIdx, e.target.value)}
      />
      {canRemove && (
        <button
          type="button"
          onClick={() => onRemoveSubject(subjectIdx)}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          title="Remove subject"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>

    {/* Lessons */}
    <div className="p-4 space-y-3">
      {subject.lessons.map((lesson, lessonIdx) => (
        <LessonRow
          key={lessonIdx}
          lesson={lesson}
          lessonIdx={lessonIdx}
          subjectIdx={subjectIdx}
          onChange={onLessonChange}
          onRemove={onRemoveLesson}
          canRemove={subject.lessons.length > 1}
        />
      ))}

      <button
        type="button"
        onClick={() => onAddLesson(subjectIdx)}
        className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors border border-dashed border-orange-200 w-full justify-center"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Lesson
      </button>
    </div>
  </div>
);

// ── Add Course Modal ─────────────────────────────────────────────────────────
const AddCourseModal = ({ token, onClose, onCreated }) => {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [subjects, setSubjects] = useState([EMPTY_SUBJECT()]);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const setField = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // Subject helpers
  const addSubject = () => setSubjects((p) => [...p, EMPTY_SUBJECT()]);

  const removeSubject = (si) =>
    setSubjects((p) => p.filter((_, i) => i !== si));

  const updateSubjectTitle = (si, val) =>
    setSubjects((p) =>
      p.map((s, i) => (i === si ? { ...s, title: val } : s))
    );

  // Lesson helpers
  const addLesson = (si) =>
    setSubjects((p) =>
      p.map((s, i) =>
        i === si ? { ...s, lessons: [...s.lessons, EMPTY_LESSON()] } : s
      )
    );

  const removeLesson = (si, li) =>
    setSubjects((p) =>
      p.map((s, i) =>
        i === si ? { ...s, lessons: s.lessons.filter((_, j) => j !== li) } : s
      )
    );

  const updateLesson = (si, li, key, val) =>
    setSubjects((p) =>
      p.map((s, i) =>
        i === si
          ? {
              ...s,
              lessons: s.lessons.map((l, j) =>
                j === li ? { ...l, [key]: val } : l
              ),
            }
          : s
      )
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Course title is required."); return; }
    setSaving(true);
    setError("");
    try {
      // Filter out subjects/lessons with no title
      const cleanSubjects = subjects
        .filter((s) => s.title.trim())
        .map((s) => ({
          ...s,
          lessons: s.lessons.filter((l) => l.title.trim()),
        }));

      const payload = { ...form, subjects: cleanSubjects };
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create course.");
      onCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Add New Course</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* ── Course Details ── */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Course Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Title *</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="e.g. Python for Kids"
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Short tagline"
                  value={form.subtitle}
                  onChange={(e) => setField("subtitle", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                >
                  <option value="junior">Junior</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Level</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  value={form.level}
                  onChange={(e) => setField("level", e.target.value)}
                >
                  {["Beginner", "Intermediate", "Advanced"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Instructor</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Instructor name"
                  value={form.instructor}
                  onChange={(e) => setField("instructor", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="e.g. 8 weeks"
                  value={form.duration}
                  onChange={(e) => setField("duration", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Badge / Icon</label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="e.g. 🐍 or Popular"
                  value={form.badge}
                  onChange={(e) => setField("badge", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="0 = free"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                  value={form.isActive ? "true" : "false"}
                  onChange={(e) => setField("isActive", e.target.value === "true")}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive (draft)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  placeholder="Course overview…"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* ── Curriculum (Subjects → Lessons) ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Curriculum
              </h3>
              <button
                type="button"
                onClick={addSubject}
                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Subject
              </button>
            </div>

            <div className="space-y-4">
              {subjects.map((subject, si) => (
                <SubjectBlock
                  key={si}
                  subject={subject}
                  subjectIdx={si}
                  onSubjectTitleChange={updateSubjectTitle}
                  onAddLesson={addLesson}
                  onLessonChange={updateLesson}
                  onRemoveLesson={removeLesson}
                  onRemoveSubject={removeSubject}
                  canRemove={subjects.length > 1}
                />
              ))}
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm disabled:opacity-60"
          >
            {saving ? "Creating…" : "Create Course"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main ClassesTab ──────────────────────────────────────────────────────────
const ClassesTab = ({ classes, loading, error, activeCategory, setActiveCategory, onBookDemo, user, onCourseCreated, lockedCourseIds = new Set() }) => {
  const [showModal, setShowModal] = useState(false);
  const isAdmin = user?.role === "admin";

  const handleCreated = (newClass) => {
    setShowModal(false);
    if (onCourseCreated) onCourseCreated(newClass);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-slate-800">Explore Classes</h2>

        <div className="flex items-center gap-3">
          {/* Category filter */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  activeCategory === cat.key
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-gray-500 hover:text-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Admin: Add Course button */}
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-linear-to-r from-orange-500 to-amber-500 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Course
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <Skeleton className="w-16 h-16 mx-auto rounded-2xl" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-semibold mb-3">{error}</p>
        </div>
      )}

      {!loading && !error && classes.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
          <p className="text-gray-400 text-sm">No classes found for this category.</p>
        </div>
      )}

      {!loading && !error && classes.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((cls) => (
            <ClassCard key={cls._id} cls={cls} onBookDemo={onBookDemo} locked={lockedCourseIds.has(cls._id)} />
          ))}
        </div>
      )}

      {showModal && (
        <AddCourseModal
          token={user?.token}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
};

export default ClassesTab;
