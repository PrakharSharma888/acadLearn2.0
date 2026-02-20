import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import ClassCard from "../components/ClassCard";
import BookDemoModal from "../components/BookDemoModal";
import API_BASE from "../config/api";

// ─── helpers ─────────────────────────────────────────────────────────────────
const authHeader = (token) => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const STATUS_STYLES = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

// ─── NAV ─────────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { key: "classes",   label: "My Classes",     icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
  { key: "bookings",  label: "Demo Bookings",  icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
  { key: "progress",  label: "Progress",       icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  { key: "profile",   label: "Profile",        icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />;

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: Overview
// ═════════════════════════════════════════════════════════════════════════════
const OverviewTab = ({ user, classes, bookings, onNav }) => {
  const active   = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const upcoming = active.slice(0, 3);

  const stats = [
    { label: "Available Classes", value: classes.length, color: "text-indigo-600", bg: "bg-indigo-50",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg> },
    { label: "Demo Bookings", value: bookings.length, color: "text-violet-600", bg: "bg-violet-50",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg> },
    { label: "Active Bookings", value: active.length, color: "text-emerald-600", bg: "bg-emerald-50",
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-linear-to-r from-indigo-600 to-violet-600 rounded-2xl px-7 py-6 flex items-center justify-between shadow-md">
        <div>
          <p className="text-indigo-200 text-sm font-medium mb-1">Good to see you 👋</p>
          <h1 className="text-2xl font-bold text-white">Welcome, {user.name}!</h1>
          <p className="text-indigo-200 text-sm mt-1">Ready to explore your learning journey?</p>
        </div>
        <div className="hidden sm:flex w-14 h-14 bg-white/20 rounded-full items-center justify-center text-white font-bold text-2xl">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            <div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming demos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800">Upcoming Demos</h2>
          <button onClick={() => onNav("bookings")} className="text-xs font-semibold text-indigo-600 hover:underline">View all</button>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No upcoming demos.</p>
            <button onClick={() => onNav("classes")} className="mt-3 text-sm font-semibold text-indigo-600 hover:underline">Browse classes →</button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{b.className || "Demo Class"}</p>
                  <p className="text-xs text-gray-400">{b.studentName} · {fmtDate(b.createdAt)}</p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_STYLES[b.status]}`}>{b.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNav("classes")} className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"/></svg>
          </div>
          <p className="text-sm font-bold text-slate-700">Explore Classes</p>
          <p className="text-xs text-gray-400 mt-0.5">Browse & book demos</p>
        </button>
        <button onClick={() => onNav("bookings")} className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600 mb-3 group-hover:bg-violet-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <p className="text-sm font-bold text-slate-700">My Bookings</p>
          <p className="text-xs text-gray-400 mt-0.5">View & manage demos</p>
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: Classes
// ═════════════════════════════════════════════════════════════════════════════
const ClassesTab = ({ classes, loading, error, activeCategory, setActiveCategory, onBookDemo }) => {
  const categories = [
    { key: "all", label: "All" },
    { key: "junior", label: "Junior" },
    { key: "professional", label: "Professional" },
  ];
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-slate-800">Explore Classes</h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${activeCategory === cat.key ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-slate-700"}`}>
              {cat.label}
            </button>
          ))}
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
            <ClassCard key={cls._id} cls={cls} onBookDemo={onBookDemo} />
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: Bookings
// ═════════════════════════════════════════════════════════════════════════════
const BookingsTab = ({ bookings, loading, onCancel }) => {
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-slate-800">My Demo Bookings</h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === s ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-slate-700"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      )}

      {!loading && shown.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          </div>
          <p className="text-gray-400 text-sm">No bookings found.</p>
        </div>
      )}

      {!loading && shown.length > 0 && (
        <div className="space-y-3">
          {shown.map((b) => (
            <div key={b._id} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
              <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">{b.className || "Demo Class"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Student: <span className="font-medium text-slate-600">{b.studentName}</span> · Grade {b.grade}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Booked on {fmtDate(b.createdAt)}
                  {b.preferredDate ? ` · Preferred: ${fmtDate(b.preferredDate)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                {(b.status === "pending" || b.status === "confirmed") && (
                  <button onClick={() => onCancel(b._id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: Progress
// ═════════════════════════════════════════════════════════════════════════════
const ProgressTab = ({ bookings, classes }) => {
  const completed  = bookings.filter((b) => b.status === "completed").length;
  const totalDemos = bookings.length;
  const pct = totalDemos > 0 ? Math.round((completed / totalDemos) * 100) : 0;

  const milestones = [
    { label: "First Demo Booked",  done: totalDemos >= 1 },
    { label: "3 Demos Completed",  done: completed >= 3 },
    { label: "5 Classes Explored", done: classes.length >= 5 },
    { label: "Full Course Enrolled", done: false },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800">My Progress</h2>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Bookings",    value: totalDemos,       color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "Demos Completed",   value: completed,        color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Active Bookings",   value: bookings.filter(b => b.status === "pending" || b.status === "confirmed").length, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Classes Available", value: classes.length,   color: "text-violet-600", bg: "bg-violet-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs font-semibold text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700">Demo Completion Rate</h3>
          <span className="text-sm font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div className="bg-indigo-600 h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-2">{completed} of {totalDemos} demos completed</p>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Milestones</h3>
        <div className="space-y-3">
          {milestones.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.done ? "bg-emerald-500" : "bg-gray-100"}`}>
                {m.done
                  ? <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  : <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                }
              </div>
              <span className={`text-sm font-medium ${m.done ? "text-emerald-700" : "text-gray-400"}`}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational quote */}
      <div className="bg-linear-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-md">
        <p className="italic text-indigo-100 text-sm leading-relaxed mb-3">
          "The beautiful thing about learning is that no one can take it away from you."
        </p>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70">
          <span className="w-4 h-px bg-white inline-block" /> B.B. King
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  TAB: Profile
// ═════════════════════════════════════════════════════════════════════════════
const ProfileTab = ({ user, token, onUserUpdate }) => {
  const [editForm, setEditForm]   = useState({ name: user.name || "", email: user.email || "" });
  const [pwdForm, setPwdForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [editMsg, setEditMsg]     = useState({ text: "", type: "" });
  const [pwdMsg, setPwdMsg]       = useState({ text: "", type: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [pwdLoading, setPwdLoading]   = useState(false);
  const [showDelete, setShowDelete]   = useState(false);
  const navigate = useNavigate();

  const msgClass = (type) => type === "success"
    ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
    : "bg-red-50 border border-red-200 text-red-600";

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditLoading(true); setEditMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({ name: editForm.name, email: editForm.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      const updated = { ...user, name: data.name, email: data.email };
      localStorage.setItem("userInfo", JSON.stringify({ ...updated, token }));
      onUserUpdate(updated);
      setEditMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setEditMsg({ text: err.message || "Update failed", type: "error" });
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ text: "New passwords do not match", type: "error" }); return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdMsg({ text: "Password must be at least 6 characters", type: "error" }); return;
    }
    setPwdLoading(true); setPwdMsg({ text: "", type: "" });
    try {
      const res = await fetch(`${API_BASE}/api/profile/password`, {
        method: "PUT",
        headers: authHeader(token),
        body: JSON.stringify({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwdMsg({ text: "Password changed successfully!", type: "success" });
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdMsg({ text: err.message || "Failed to change password", type: "error" });
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API_BASE}/api/profile/me`, { method: "DELETE", headers: authHeader(token) });
      localStorage.removeItem("userInfo");
      navigate("/login");
    } catch {
      alert("Could not delete account. Please try again.");
    }
  };

  const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition";

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-bold text-slate-800">My Profile</h2>

      {/* Avatar card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-linear-to-tr from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
          <span className="inline-block mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 capitalize">{user.role || "student"}</span>
        </div>
      </div>

      {/* Edit profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Edit Profile</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <input className={inputCls} value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input type="email" className={inputCls} value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          {editMsg.text && <p className={`text-xs rounded-xl px-4 py-3 ${msgClass(editMsg.type)}`}>{editMsg.text}</p>}
          <button type="submit" disabled={editLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors">
            {editLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {[
            { label: "Current Password",  key: "currentPassword" },
            { label: "New Password",      key: "newPassword" },
            { label: "Confirm New Password", key: "confirmPassword" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
              <input type="password" className={inputCls} value={pwdForm[key]}
                onChange={(e) => setPwdForm(p => ({ ...p, [key]: e.target.value }))} required />
            </div>
          ))}
          {pwdMsg.text && <p className={`text-xs rounded-xl px-4 py-3 ${msgClass(pwdMsg.type)}`}>{pwdMsg.text}</p>}
          <button type="submit" disabled={pwdLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-colors">
            {pwdLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-xs text-gray-400 mb-4">Deleting your account is permanent and cannot be undone.</p>
        {!showDelete
          ? <button onClick={() => setShowDelete(true)} className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold rounded-xl border border-red-200 transition-colors">Delete My Account</button>
          : (
            <div className="flex items-center gap-3">
              <button onClick={handleDeleteAccount} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors">Yes, Delete</button>
              <button onClick={() => setShowDelete(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors">Cancel</button>
            </div>
          )
        }
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN DASHBOARD
// ═════════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser]         = useState({ name: "Student", email: "", token: "" });
  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Classes state
  const [classes, setClasses]           = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError]     = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  // Bookings state
  const [bookings, setBookings]         = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Modal
  const [selectedClass, setSelectedClass] = useState(null);

  // ── Load user ──
  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  // ── Fetch classes ──
  useEffect(() => {
    const load = async () => {
      setClassesLoading(true); setClassesError("");
      try {
        const url = activeCategory === "all"
          ? `${API_BASE}/api/classes`
          : `${API_BASE}/api/classes?category=${activeCategory}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        setClasses(await res.json());
      } catch {
        setClassesError("Could not load classes. Please try again.");
      } finally {
        setClassesLoading(false);
      }
    };
    load();
  }, [activeCategory]);

  // ── Fetch my bookings ──
  const loadBookings = useCallback(async () => {
    if (!user.email) return;
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/demo-booking/my?email=${encodeURIComponent(user.email)}`);
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user.email]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  // ── Cancel booking ──
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this demo booking?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/demo-booking/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      await loadBookings();
    } catch {
      alert("Could not cancel booking. Please try again.");
    }
  };

  const handleLogout = () => { localStorage.removeItem("userInfo"); navigate("/login"); };
  const handleNav    = (key) => { setActiveNav(key); setSidebarOpen(false); };

  // ── Sidebar component ──
  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100">
      <div className="px-6 py-5 border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            AcadLearn <span className="text-indigo-600 text-sm font-semibold">JR</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <button key={item.key} onClick={() => handleNav(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeNav === item.key ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-50 hover:text-slate-700"}`}>
            {item.icon}
            {item.label}
            {item.key === "bookings" && bookings.filter(b => b.status === "pending").length > 0 && (
              <span className="ml-auto text-[10px] font-bold bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                {bookings.filter(b => b.status === "pending").length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <div className="w-8 h-8 bg-linear-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">{user.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
          <button onClick={handleLogout} title="Logout" className="text-gray-400 hover:text-red-500 transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );

  const renderTab = () => {
    switch (activeNav) {
      case "dashboard": return <OverviewTab user={user} classes={classes} bookings={bookings} onNav={handleNav} />;
      case "classes":   return <ClassesTab classes={classes} loading={classesLoading} error={classesError} activeCategory={activeCategory} setActiveCategory={setActiveCategory} onBookDemo={setSelectedClass} />;
      case "bookings":  return <BookingsTab bookings={bookings} loading={bookingsLoading} onCancel={handleCancel} />;
      case "progress":  return <ProgressTab bookings={bookings} classes={classes} />;
      case "profile":   return <ProfileTab user={user} token={user.token} onUserUpdate={setUser} />;
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 md:ml-60 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <button className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" onClick={() => setSidebarOpen(true)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>

          {/* Page title */}
          <p className="hidden md:block text-sm font-semibold text-gray-400 capitalize">
            {NAV_ITEMS.find(n => n.key === activeNav)?.label}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-linear-to-tr from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-slate-700">{user.name}</span>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              {bookings.filter(b => b.status === "pending").length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
            </button>
            <button onClick={handleLogout} className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Logout
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 px-4 md:px-8 py-8">
          {renderTab()}
        </main>
      </div>

      {/* Book Demo Modal */}
      {selectedClass && (
        <BookDemoModal cls={selectedClass} user={user} onClose={() => { setSelectedClass(null); loadBookings(); }} />
      )}
    </div>
  );
};

export default Dashboard;
