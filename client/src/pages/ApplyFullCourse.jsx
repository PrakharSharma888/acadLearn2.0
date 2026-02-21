import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_BASE from "../config/api";
import { authHeader } from "../dashboard/constants";

// ── Theme tokens ──────────────────────────────────────────────────────────────
const THEME = {
  junior: {
    gradientBg:   "bg-linear-to-r from-orange-500 to-amber-400",
    accent:       "text-orange-600",
    accentBg:     "bg-orange-50",
    accentBorder: "border-orange-200",
    badge:        "bg-orange-100 text-orange-700",
    btn:          "bg-orange-600 hover:bg-orange-700 active:bg-orange-800",
    ring:         "focus:ring-orange-300 focus:border-orange-400",
    dot:          "bg-orange-500",
    label:        "Junior Program",
    stepNum:      "bg-orange-100 text-orange-700",
    tabActive:    "bg-orange-600 text-white shadow",
    tabInactive:  "bg-white text-slate-600 hover:bg-orange-50 border border-gray-200",
    cardBorder:   "border-orange-200",
    cardSelected: "ring-2 ring-orange-500 border-orange-400",
    iconBg:       "bg-amber-100 text-amber-600",
    priceText:    "text-orange-700",
  },
  professional: {
    gradientBg:   "bg-linear-to-r from-blue-600 to-blue-500",
    accent:       "text-blue-600",
    accentBg:     "bg-blue-50",
    accentBorder: "border-blue-200",
    badge:        "bg-blue-100 text-blue-700",
    btn:          "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
    ring:         "focus:ring-blue-300 focus:border-blue-400",
    dot:          "bg-blue-500",
    label:        "Professional Program",
    stepNum:      "bg-blue-100 text-blue-700",
    tabActive:    "bg-blue-600 text-white shadow",
    tabInactive:  "bg-white text-slate-600 hover:bg-blue-50 border border-gray-200",
    cardBorder:   "border-blue-200",
    cardSelected: "ring-2 ring-blue-500 border-blue-400",
    iconBg:       "bg-blue-100 text-blue-600",
    priceText:    "text-blue-700",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const EMPTY_LESSON  = () => ({ title: "", duration: "", description: "" });
const EMPTY_SUBJECT = () => ({ title: "", description: "", price: "", isFree: false, lessons: [EMPTY_LESSON()] });

// Subject icons pool
const SUBJECT_ICONS = [
  // math
  <svg key="math" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path strokeLinecap="round" d="M17 14v6M14 17h6"/></svg>,
  // science
  <svg key="sci" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 3v7L5.5 16A3.5 3.5 0 009 21h6a3.5 3.5 0 003.5-5L15 10V3"/><path strokeLinecap="round" d="M8.5 3h7"/></svg>,
  // english
  <svg key="eng" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>,
  // social
  <svg key="ss" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  // computer
  <svg key="cs" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>,
  // generic
  <svg key="gen" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>,
];

// ── Admin: single lesson row ──────────────────────────────────────────────────
const EditLessonRow = ({ lesson, li, si, t, onChange, onRemove, canRemove }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px_auto] gap-2 items-start pl-3 border-l-2 border-gray-100 ml-1">
    <input
      value={lesson.title}
      onChange={(e) => onChange(si, li, "title", e.target.value)}
      placeholder="Lesson title"
      className={`border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ${t.ring} bg-white`}
    />
    <input
      value={lesson.duration}
      onChange={(e) => onChange(si, li, "duration", e.target.value)}
      placeholder="Duration"
      className={`border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ${t.ring} bg-white`}
    />
    {canRemove ? (
      <button type="button" onClick={() => onRemove(si, li)}
        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    ) : <div className="w-8" />}
    <div className="sm:col-span-3">
      <input
        value={lesson.description}
        onChange={(e) => onChange(si, li, "description", e.target.value)}
        placeholder="Description (optional)"
        className={`w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ${t.ring} bg-white`}
      />
    </div>
  </div>
);

// ── Admin: subject block ──────────────────────────────────────────────────────
const EditSubjectBlock = ({ subject, si, t, onTitleChange, onDescChange, onPriceChange, onFreeToggle, onAddLesson, onLessonChange, onRemoveLesson, onRemove, canRemove }) => (
  <div className="border border-gray-200 rounded-xl overflow-hidden">
    {/* Subject header */}
    <div className={`flex items-center gap-2 ${t.accentBg} px-4 py-3 border-b ${t.accentBorder}`}>
      <span className={`text-[10px] font-bold uppercase tracking-wide shrink-0 ${t.accent}`}>Subject {si + 1}</span>
      <input
        value={subject.title}
        onChange={(e) => onTitleChange(si, e.target.value)}
        placeholder="Subject name (e.g. Mathematics)"
        className={`flex-1 border ${t.accentBorder} rounded-lg px-3 py-1.5 text-sm font-semibold outline-none focus:ring-2 ${t.ring} bg-white`}
      />
      {canRemove && (
        <button type="button" onClick={() => onRemove(si)}
          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      )}
    </div>

    <div className="p-4 space-y-3 bg-white">
      {/* Description */}
      <input
        value={subject.description}
        onChange={(e) => onDescChange(si, e.target.value)}
        placeholder="Short description for this subject (optional)"
        className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 ${t.ring}`}
      />

      {/* Price row */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => onFreeToggle(si, !subject.isFree)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${subject.isFree ? "bg-green-500" : "bg-gray-300"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${subject.isFree ? "translate-x-5" : "translate-x-0.5"}`} />
          </div>
          <span className="text-xs font-semibold text-gray-600">Free subject</span>
        </label>
        {!subject.isFree && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-500 font-semibold">₹</span>
            <input
              type="number"
              min="0"
              value={subject.price}
              onChange={(e) => onPriceChange(si, e.target.value)}
              placeholder="e.g. 2999"
              className={`w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 ${t.ring}`}
            />
          </div>
        )}
        {subject.isFree && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">FREE</span>
        )}
      </div>

      {/* Lessons */}
      <div className="space-y-2 pt-1">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Lessons</p>
        {subject.lessons.map((lesson, li) => (
          <EditLessonRow
            key={li} lesson={lesson} li={li} si={si} t={t}
            onChange={onLessonChange}
            onRemove={onRemoveLesson}
            canRemove={subject.lessons.length > 1}
          />
        ))}
        <button type="button" onClick={() => onAddLesson(si)}
          className={`flex items-center gap-1.5 text-xs font-semibold ${t.accent} hover:opacity-80 ${t.accentBg} px-3 py-1.5 rounded-lg border border-dashed ${t.accentBorder} w-full justify-center transition-opacity`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          Add Lesson
        </button>
      </div>
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const ApplyFullCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cls,     setCls]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Selected subject for enrollment
  const [selectedSubjectIdx, setSelectedSubjectIdx] = useState(null);

  // Enrollment form (free courses)
  const [form,        setForm]        = useState({ name: "", email: "", phone: "", message: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError,   setFormError]   = useState("");

  // Admin state
  const [user,     setUser]     = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
        const headers = storedUser?.token ? { Authorization: `Bearer ${storedUser.token}` } : {};
        const res = await fetch(`${API_BASE}/api/classes/${id}`, { headers });
        if (!res.ok) throw new Error("Class not found");
        const data = await res.json();
        setCls(data);
        setEditForm({
          title:       data.title       || "",
          subtitle:    data.subtitle    || "",
          description: data.description || "",
          instructor:  data.instructor  || "",
          duration:    data.duration    || "",
          level:       data.level       || "Beginner",
          badge:       data.badge       || "",
          price:       data.price       ?? 0,
          isActive:    data.isActive    ?? true,
        });
        // Seed subjects from DB — prefer subjects[], fall back wrapping curriculum
        if (data.subjects?.length) {
          setSubjects(data.subjects.map((s) => ({
            title:       s.title       || "",
            description: s.description || "",
            price:       s.price       ?? "",
            isFree:      !s.price || s.price === 0,
            lessons:     s.lessons?.length
              ? s.lessons.map((l) => ({ title: l.title || "", duration: l.duration || "", description: l.description || "" }))
              : [EMPTY_LESSON()],
          })));
        } else if (data.curriculum?.length) {
          setSubjects([{
            title: "Full Course",
            description: "",
            price: data.price ?? "",
            isFree: !data.price || data.price === 0,
            lessons: data.curriculum.map((l) => ({ title: l.title || "", duration: l.duration || "", description: l.description || "" })),
          }]);
        } else {
          setSubjects([EMPTY_SUBJECT()]);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const t = THEME[cls?.category] || THEME.junior;
  const isAdmin = user?.role === "admin";
  const backPath = cls?.category === "professional" ? "/professional" : "/junior";

  // ── Subject helpers ──────────────────────────────────────────────────────
  const addSubject    = () => setSubjects((p) => [...p, EMPTY_SUBJECT()]);
  const removeSubject = (si) => setSubjects((p) => p.filter((_, i) => i !== si));
  const updateTitle   = (si, val) => setSubjects((p) => p.map((s, i) => i === si ? { ...s, title: val } : s));
  const updateDesc    = (si, val) => setSubjects((p) => p.map((s, i) => i === si ? { ...s, description: val } : s));
  const updatePrice   = (si, val) => setSubjects((p) => p.map((s, i) => i === si ? { ...s, price: val } : s));
  const toggleFree    = (si, val) => setSubjects((p) => p.map((s, i) => i === si ? { ...s, isFree: val, price: val ? 0 : "" } : s));

  // ── Lesson helpers ───────────────────────────────────────────────────────
  const addLesson    = (si) => setSubjects((p) => p.map((s, i) => i === si ? { ...s, lessons: [...s.lessons, EMPTY_LESSON()] } : s));
  const removeLesson = (si, li) => setSubjects((p) => p.map((s, i) => i === si ? { ...s, lessons: s.lessons.filter((_, j) => j !== li) } : s));
  const updateLesson = (si, li, key, val) =>
    setSubjects((p) => p.map((s, i) => i === si
      ? { ...s, lessons: s.lessons.map((l, j) => j === li ? { ...l, [key]: val } : l) }
      : s));

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editForm.title.trim()) { setSaveMsg("Title is required."); return; }
    setSaving(true); setSaveMsg("");
    try {
      const cleanSubjects = subjects
        .filter((s) => s.title.trim())
        .map((s) => ({
          title:       s.title,
          description: s.description,
          price:       s.isFree ? 0 : Number(s.price) || 0,
          lessons:     s.lessons.filter((l) => l.title.trim()),
        }));

      const payload = {
        ...editForm,
        price:    Number(editForm.price) || 0,
        isActive: editForm.isActive,
        subjects: cleanSubjects,
        totalLessons: cleanSubjects.reduce((n, s) => n + s.lessons.length, 0),
      };
      const res = await fetch(`${API_BASE}/api/classes/${id}`, {
        method: "PUT",
        headers: authHeader(user.token),
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Save failed.");
      const updated = await res.json();
      setCls(updated);
      setSaveMsg("Saved successfully!");
      setEditMode(false);
    } catch (err) {
      setSaveMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Free enrollment submit ────────────────────────────────────────────────
  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !/^[6-9]\d{9}$/.test(form.phone)) {
      setFormError("Please fill all required fields with valid details."); return;
    }
    setFormLoading(true); setFormError("");
    try {
      const selectedSubject = cls.subjects?.[selectedSubjectIdx];
      const res = await fetch(`${API_BASE}/api/demo-booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          parentName:  form.name,
          email:       form.email,
          phone:       form.phone,
          studentName: form.name,
          grade:       cls?.title || "",
          classId:     cls?._id || null,
          className:   cls?.title || "",
          message:     `Subject: ${selectedSubject?.title || "Full Course"}. ${form.message}`,
          type:        "full_course",
        }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Enrollment failed.");
      setFormSuccess(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  if (error || !cls) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-red-500 font-semibold mb-4">{error || "Course not found."}</p>
        <button onClick={() => navigate(-1)} className="text-orange-600 hover:underline text-sm font-semibold">← Go back</button>
      </div>
    </div>
  );

  const dbSubjects = cls.subjects || [];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <div className={`${t.gradientBg} text-white`}>
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link to={backPath} className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold mb-5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Back to Courses
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">{t.label}</p>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">{cls.title}</h1>
              {cls.subtitle && <p className="text-white/80 text-sm mt-1">{cls.subtitle}</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                {cls.instructor && <span className="text-white/70 text-sm">By {cls.instructor}</span>}
                {cls.duration   && <span className="text-white/70 text-sm">· {cls.duration}</span>}
                {cls.level      && <span className="text-white/70 text-sm">· {cls.level}</span>}
                {dbSubjects.length > 0 && (
                  <span className="text-white/70 text-sm">· {dbSubjects.length} subject{dbSubjects.length !== 1 ? "s" : ""}</span>
                )}
              </div>
            </div>

            {/* Admin edit toggle */}
            {isAdmin && (
              <button
                onClick={() => { setEditMode((m) => !m); setSaveMsg(""); }}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                {editMode ? "Cancel Edit" : "Edit Course"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Admin Edit Panel ── */}
      {isAdmin && editMode && (
        <div className="max-w-5xl mx-auto px-4 pt-8">
          <div className={`bg-white rounded-2xl border ${t.accentBorder} shadow-sm overflow-hidden`}>
            <div className={`${t.gradientBg} px-6 py-4`}>
              <h2 className="text-white font-bold text-base">Edit Course</h2>
              <p className="text-white/70 text-xs mt-0.5">Add subjects, set pricing, manage lessons</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Course details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Title *</label>
                  <input value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring}`}/>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Subtitle</label>
                  <input value={editForm.subtitle}
                    onChange={(e) => setEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring}`}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor</label>
                  <input value={editForm.instructor}
                    onChange={(e) => setEditForm((f) => ({ ...f, instructor: e.target.value }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring}`}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Duration</label>
                  <input value={editForm.duration} placeholder="e.g. 12 weeks"
                    onChange={(e) => setEditForm((f) => ({ ...f, duration: e.target.value }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring}`}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Level</label>
                  <select value={editForm.level}
                    onChange={(e) => setEditForm((f) => ({ ...f, level: e.target.value }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring}`}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Badge</label>
                  <select value={editForm.badge}
                    onChange={(e) => setEditForm((f) => ({ ...f, badge: e.target.value }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring}`}>
                    <option value="">None</option><option>Popular</option><option>New</option>
                    <option>Free</option><option>Top Rated</option><option>Limited Seats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                  <select value={editForm.isActive ? "true" : "false"}
                    onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === "true" }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring}`}>
                    <option value="true">Active</option><option value="false">Inactive (draft)</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                  <textarea value={editForm.description} rows={3}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 ${t.ring} resize-none`}/>
                </div>
              </div>

              {/* Subjects + Lessons */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Subjects & Pricing ({subjects.length})
                  </h3>
                  <button type="button" onClick={addSubject}
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${t.accentBg} ${t.accent} text-xs font-bold rounded-lg border ${t.accentBorder} hover:opacity-80 transition-opacity`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
                    </svg>
                    Add Subject
                  </button>
                </div>
                <div className="space-y-4 max-h-150 overflow-y-auto pr-1">
                  {subjects.map((subject, si) => (
                    <EditSubjectBlock
                      key={si} subject={subject} si={si} t={t}
                      onTitleChange={updateTitle}
                      onDescChange={updateDesc}
                      onPriceChange={updatePrice}
                      onFreeToggle={toggleFree}
                      onAddLesson={addLesson}
                      onLessonChange={updateLesson}
                      onRemoveLesson={removeLesson}
                      onRemove={removeSubject}
                      canRemove={subjects.length > 1}
                    />
                  ))}
                </div>
              </div>

              {/* Save */}
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <button onClick={handleSave} disabled={saving}
                  className={`px-6 py-2.5 ${t.btn} text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60`}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={() => { setEditMode(false); setSaveMsg(""); }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">
                  Cancel
                </button>
                {saveMsg && (
                  <span className={`text-xs font-semibold ${saveMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Student view ── */}
      {!editMode && (
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

          {/* About */}
          {cls.description && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-slate-800 mb-2">About this course</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{cls.description}</p>
            </div>
          )}

          {/* ── Subjects section ── */}
          {dbSubjects.length > 0 ? (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-800">Apply for Full Course</h2>
                <p className="text-sm text-gray-500 mt-1">Select your subject to enroll.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dbSubjects.map((subject, si) => {
                  const isFree  = !subject.price || subject.price === 0;
                  const isSelected = selectedSubjectIdx === si;
                  return (
                    <button
                      key={si}
                      onClick={() => setSelectedSubjectIdx(isSelected ? null : si)}
                      className={`text-left bg-white rounded-2xl border-2 p-5 transition-all shadow-sm hover:shadow-md flex flex-col gap-3 ${
                        isSelected ? t.cardSelected : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`w-14 h-14 ${t.iconBg} rounded-2xl flex items-center justify-center`}>
                        {SUBJECT_ICONS[si % SUBJECT_ICONS.length]}
                      </div>

                      {/* Title + desc */}
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-base leading-snug">{subject.title}</h3>
                        {subject.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-3">{subject.description}</p>
                        )}
                      </div>

                      {/* Lesson count */}
                      {subject.lessons?.length > 0 && (
                        <p className="text-xs text-gray-400">{subject.lessons.length} lesson{subject.lessons.length !== 1 ? "s" : ""}</p>
                      )}

                      {/* Price + Enroll */}
                      <div className="flex items-center justify-between mt-1">
                        <div>
                          {isFree ? (
                            <span className="text-sm font-bold text-green-600">Free</span>
                          ) : (
                            <span className={`text-lg font-black ${t.priceText}`}>₹{Number(subject.price).toLocaleString("en-IN")}</span>
                          )}
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                          isSelected
                            ? `${t.btn} text-white`
                            : `${t.accentBg} ${t.accent} border ${t.accentBorder}`
                        }`}>
                          {isSelected ? "Selected ✓" : "Enroll Now"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Enrollment panel — shows when a subject is selected */}
              {selectedSubjectIdx !== null && (
                <div className="mt-6">
                  {(() => {
                    const sub = dbSubjects[selectedSubjectIdx];
                    const isFree = !sub.price || sub.price === 0;
                    return (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className={`${t.gradientBg} px-6 py-5 text-white`}>
                          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
                            {isFree ? "Free Enrollment" : "Paid Course"}
                          </p>
                          <h3 className="text-lg font-bold">{sub.title}</h3>
                          {!isFree && (
                            <p className="text-2xl font-black mt-1">₹{Number(sub.price).toLocaleString("en-IN")}</p>
                          )}
                        </div>

                        {formSuccess ? (
                          <div className="p-8 text-center">
                            <div className={`w-14 h-14 ${t.accentBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
                              <svg className={`w-7 h-7 ${t.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                              </svg>
                            </div>
                            <h3 className="text-base font-bold text-slate-800 mb-1">Application Submitted!</h3>
                            <p className="text-sm text-gray-500">Our team will contact you within 24 hours.</p>
                          </div>
                        ) : isFree ? (
                          <form onSubmit={handleEnroll} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: "Full Name",     name: "name",  type: "text",  placeholder: "Your full name" },
                              { label: "Email Address", name: "email", type: "email", placeholder: "you@example.com" },
                              { label: "Phone Number",  name: "phone", type: "tel",   placeholder: "10-digit mobile" },
                            ].map((field) => (
                              <div key={field.name}>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">{field.label}</label>
                                <input type={field.type} placeholder={field.placeholder} required
                                  value={form[field.name]}
                                  onChange={(e) => setForm((f) => ({ ...f, [field.name]: e.target.value }))}
                                  className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none focus:ring-2 ${t.ring}`}/>
                              </div>
                            ))}
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Message <span className="text-gray-400 font-normal">(optional)</span></label>
                              <textarea rows={2} placeholder="Any questions?"
                                value={form.message}
                                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                                className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50 outline-none focus:ring-2 ${t.ring} resize-none`}/>
                            </div>
                            {formError && (
                              <p className="sm:col-span-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{formError}</p>
                            )}
                            <div className="sm:col-span-2">
                              <button type="submit" disabled={formLoading}
                                className={`w-full py-3 ${t.btn} text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2`}>
                                {formLoading
                                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Submitting…</>
                                  : "Apply for Free"}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-6 space-y-4">
                            <button
                              onClick={() => navigate(`/checkout/${cls._id}?subject=${selectedSubjectIdx}`)}
                              className={`w-full py-3 ${t.btn} text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2`}>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                              </svg>
                              Buy Now — Pay with Razorpay
                            </button>
                            <p className="text-center text-[11px] text-gray-400">Secure payment powered by Razorpay · 256-bit SSL</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Lessons preview for selected subject */}
              {selectedSubjectIdx !== null && dbSubjects[selectedSubjectIdx]?.lessons?.length > 0 && (
                <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                      Lessons in "{dbSubjects[selectedSubjectIdx].title}"
                    </h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.badge}`}>
                      {dbSubjects[selectedSubjectIdx].lessons.length} lessons
                    </span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {dbSubjects[selectedSubjectIdx].lessons.map((lesson, li) => (
                      <div key={li} className="px-6 py-3.5 flex items-start gap-3 hover:bg-gray-50/60 transition-colors">
                        <span className={`shrink-0 w-6 h-6 rounded-full ${t.stepNum} text-[10px] font-bold flex items-center justify-center mt-0.5`}>
                          {li + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700">{lesson.title}</p>
                          {lesson.description && <p className="text-xs text-gray-400 mt-0.5">{lesson.description}</p>}
                        </div>
                        {lesson.duration && <span className="shrink-0 text-xs text-gray-400 font-medium">{lesson.duration}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No subjects yet */
            <div className={`bg-white rounded-2xl border border-dashed ${t.accentBorder} p-12 text-center`}>
              <div className={`w-14 h-14 ${t.accentBg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <svg className={`w-7 h-7 ${t.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">No subjects added yet</h3>
              <p className="text-sm text-gray-400">
                {isAdmin ? "Click \"Edit Course\" above to add subjects, pricing and lessons." : "Course content coming soon. Check back later!"}
              </p>
            </div>
          )}

          {/* Course highlights */}
          <div className={`${t.accentBg} border ${t.accentBorder} rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-3`}>
            {["Expert instructors", "Live sessions", "Doubt support", "Certificate"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <span className={`w-5 h-5 rounded-full ${t.dot} flex items-center justify-center shrink-0`}>
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
                <span className="text-gray-700 font-medium text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyFullCourse;
