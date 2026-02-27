import { useState, useEffect, useCallback } from "react";
import { fmtDate, STATUS_STYLES, authHeader } from "./constants";
import API_BASE from "../config/api";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

const daysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / (1000 * 60 * 60 * 24));
};

// Shape a DemoSession into the object BookDemoModal expects (cls)
const sessionToCls = (s) => ({
  _id:        s.classId || s._id,
  title:      s.title,
  instructor: s.instructor,
  category:   s.category === "all" ? "junior" : s.category,
  type:       s.type,
  price:      s.price,
});

// ── Admin Action Modal ────────────────────────────────────────────────────────
const ActionModal = ({ booking, onClose, onSave }) => {
  const [status,        setStatus]        = useState(booking.status);
  const [confirmedDate, setConfirmedDate] = useState(booking.confirmedDate || "");
  const [confirmedTime, setConfirmedTime] = useState(booking.confirmedTime || "");
  const [saving,        setSaving]        = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(booking._id, status, confirmedDate, confirmedTime);
    setSaving(false);
    onClose();
  };

  const STATUS_OPTIONS = [
    { value: "pending",   label: "Pending",   color: "bg-amber-100 border-amber-400 text-amber-700" },
    { value: "confirmed", label: "Confirmed", color: "bg-green-100 border-green-400 text-green-700" },
    { value: "completed", label: "Completed", color: "bg-blue-100 border-blue-400 text-blue-700" },
    { value: "cancelled", label: "Cancelled", color: "bg-red-100 border-red-400 text-red-600" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-500 to-amber-400 p-5 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-orange-100 text-xs font-semibold uppercase tracking-widest mb-1">Admin Action</p>
          <h2 className="text-lg font-bold leading-tight">{booking.className || "Demo Class"}</h2>
          <p className="text-orange-100 text-sm mt-0.5">
            {booking.studentName} · {booking.parentName}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Contact info */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
            <p><span className="font-semibold text-slate-600">Email:</span> {booking.email}</p>
            <p><span className="font-semibold text-slate-600">Phone:</span> {booking.phone || "N/A"}</p>
            <p><span className="font-semibold text-slate-600">Booked:</span> {fmtDate(booking.createdAt)}</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">Update Status</label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                    status === opt.value
                      ? opt.color + " shadow-sm scale-[1.02]"
                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-2">
              Demo Date &amp; Time
              <span className="ml-1 font-normal text-gray-400">(optional)</span>
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={confirmedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setConfirmedDate(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <input
                type="time"
                value={confirmedTime}
                onChange={(e) => setConfirmedTime(e.target.value)}
                className="w-32 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Tab ──────────────────────────────────────────────────────────────────
const BookingsTab = ({ bookings, loading, onCancel, user, onStatusUpdate, demoSessions = [], onBookDemo }) => {
  const [filter,         setFilter]         = useState("all");
  const [activeBooking,  setActiveBooking]  = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [bookingPage,    setBookingPage]    = useState(0);
  const BOOKING_PAGE_SIZE = 10;

  const shown   = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const pagedBookings = shown.slice(bookingPage * BOOKING_PAGE_SIZE, (bookingPage + 1) * BOOKING_PAGE_SIZE);
  const bookingTotalPages = Math.ceil(shown.length / BOOKING_PAGE_SIZE);
  const isAdmin = user?.role === "admin";

  // All upcoming sessions (today or future), sorted soonest first
  const upcomingSessions = demoSessions.filter((s) => daysUntil(s.date) >= 0);

  // ── Schedule Demo Form State (Admin only) ────────────────────────────────────
  const EMPTY_SESSION = {
    title: "", classId: "", className: "", instructor: "AcadLearn Team",
    description: "", date: "", time: "", category: "all", type: "free", price: "",
  };
  
  const [allClasses,    setAllClasses]    = useState([]);
  const [sessionForm,   setSessionForm]   = useState(EMPTY_SESSION);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [sessionMsg,    setSessionMsg]    = useState("");

  // Load all classes for the schedule form dropdown
  const loadAllClasses = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_BASE}/api/classes`, { headers: authHeader(user.token) });
      if (!res.ok) throw new Error();
      setAllClasses(await res.json());
    } catch { setAllClasses([]); }
  }, [user?.token]);

  useEffect(() => {
    if (isAdmin) loadAllClasses();
  }, [isAdmin, loadAllClasses]);

  const handleSessionChange = (e) => {
    const { name, value } = e.target;
    if (name === "classId") {
      const cls = allClasses.find((c) => c._id === value);
      setSessionForm((f) => ({
        ...f,
        classId:  value,
        className: cls ? cls.title : "",
        category:  cls ? cls.category : "all",
        title:     f.title || (cls ? cls.title : ""),
      }));
    } else {
      setSessionForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    setSessionSaving(true);
    setSessionMsg("");
    try {
      // Prepare data with price as number
      const sessionData = {
        ...sessionForm,
        price: sessionForm.type === "paid" ? Number(sessionForm.price) || 0 : 0,
      };
      
      const res = await fetch(`${API_BASE}/api/demo-sessions`, {
        method: "POST",
        headers: authHeader(user.token),
        body: JSON.stringify(sessionData),
      });
      if (!res.ok) {
        const err = await res.json();
        setSessionMsg(err.message || "Failed to schedule demo.");
        return;
      }
      setSessionMsg("Demo session scheduled successfully!");
      setSessionForm(EMPTY_SESSION);
      // Refresh by notifying parent or reloading page
      setTimeout(() => window.location.reload(), 1500);
    } catch { setSessionMsg("Server error. Please try again."); }
    finally { setSessionSaving(false); }
  };

  // Custom Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getBookingForDate = (date) => {
    if (!bookings) return null;
    // Use local date comparison to avoid timezone issues
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    return bookings.find(b => {
      if (b.status !== 'confirmed' || !b.confirmedDate) return false;
      const bookingDate = new Date(b.confirmedDate);
      return bookingDate.getFullYear() === year &&
             bookingDate.getMonth() === month &&
             bookingDate.getDate() === day;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const changeMonth = (increment) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + increment, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  return (
    <div>
      {/* ── Demo Sessions List (Students only) ── */}
      {!isAdmin && upcomingSessions.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden mb-6">
          {/* Header */}
          <div className="flex items-center gap-2 px-6 pt-5 pb-4 border-b border-orange-100">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
            <h2 className="text-base font-bold text-slate-800">Upcoming Demo Sessions</h2>
            <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              {upcomingSessions.length} session{upcomingSessions.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Sessions list */}
          <div className="divide-y divide-gray-100">
            {upcomingSessions.map((s) => {
              const d = daysUntil(s.date);
              const dayLabel = d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`;
              const isVeryNear = d <= 2;

              return (
                <div key={s._id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Date block */}
                    <div className={`shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center text-center shadow-sm ${
                      isVeryNear ? "bg-orange-500 text-white" : "bg-white text-slate-700 border border-gray-200"
                    }`}>
                      <p className="text-xl font-bold leading-none">{new Date(s.date).getDate()}</p>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5">
                        {new Date(s.date).toLocaleString("en-IN", { month: "short" })}
                      </p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-sm font-bold text-slate-800">{s.title}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVeryNear ? "bg-orange-200 text-orange-700" : "bg-gray-200 text-gray-600"
                        }`}>
                          {dayLabel}
                        </span>
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
                        {s.category !== "all" && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            s.category === "junior" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {s.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        {s.time} &nbsp;·&nbsp; {s.instructor}
                      </p>
                      {s.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{s.description}</p>
                      )}
                    </div>

                    {/* Book Now */}
                    <button
                      onClick={() => onBookDemo(sessionToCls(s))}
                      className="shrink-0 px-4 py-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Schedule Demo Button (Admin only) ── */}
      {isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Schedule New Demo Session
          </button>
        </div>
      )}

      {/* ── Schedule Demo Modal (Admin only) ── */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowScheduleModal(false)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-400 p-6 text-white z-10">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl font-bold">Schedule New Demo Session</h2>
              <p className="text-orange-100 text-sm mt-1">Create a demo session for students to book</p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSessionSubmit} className="p-6 space-y-5">
              {/* Link to class (optional) */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Link to Class (optional)</label>
                <select
                  name="classId"
                  value={sessionForm.classId}
                  onChange={handleSessionChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">— Select a class (optional) —</option>
                  {allClasses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title} ({c.category})</option>
                  ))}
                </select>
              </div>

              {/* Title + category + type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Session Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="title" value={sessionForm.title} onChange={handleSessionChange}
                    required placeholder="e.g. Free Maths Demo – Grade 5"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                  <select
                    name="category" value={sessionForm.category} onChange={handleSessionChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="all">All Students</option>
                    <option value="junior">Junior</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="type" value={sessionForm.type} onChange={handleSessionChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="free">Free Demo</option>
                    <option value="paid">Paid Demo</option>
                  </select>
                </div>
              </div>

              {/* Price (conditional - only for paid demos) */}
              {sessionForm.type === "paid" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="price" type="number" min="0" step="1"
                    value={sessionForm.price} onChange={handleSessionChange}
                    required={sessionForm.type === "paid"}
                    placeholder="e.g. 500"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              )}

              {/* Date + Time + Instructor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="date" type="date" value={sessionForm.date} onChange={handleSessionChange}
                    required min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    name="time" type="time" value={sessionForm.time} onChange={handleSessionChange}
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor</label>
                  <input
                    name="instructor" value={sessionForm.instructor} onChange={handleSessionChange}
                    placeholder="AcadLearn Team"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                <textarea
                  name="description" value={sessionForm.description} onChange={handleSessionChange}
                  rows={3} placeholder="What will students learn in this demo?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  <button
                    type="submit" disabled={sessionSaving}
                    className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60"
                  >
                    {sessionSaving ? "Scheduling…" : "Schedule Demo"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSessionForm(EMPTY_SESSION); setSessionMsg(""); }}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-xl transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowScheduleModal(false); setSessionForm(EMPTY_SESSION); setSessionMsg(""); }}
                    className="px-4 py-2.5 border border-gray-300 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {sessionMsg && (
                  <span className={`text-xs font-semibold ${sessionMsg.includes("success") ? "text-green-600" : "text-red-500"}`}>
                    {sessionMsg}
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-bold text-slate-800">
          {isAdmin ? "All Demo Bookings (Admin)" : "My Demo Bookings"}
        </h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap">
          {FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => { setFilter(s); setBookingPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === s ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-slate-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Two column layout for students: bookings list + calendar */}
      <div className={`grid ${!isAdmin ? 'lg:grid-cols-3 gap-6' : 'grid-cols-1'}`}>
        {/* Bookings List */}
        <div className={!isAdmin ? 'lg:col-span-2' : ''}>
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
          )}

          {!loading && shown.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-14 text-center shadow-sm">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm">No bookings found.</p>
            </div>
          )}

          {!loading && shown.length > 0 && (
            <>
            <div className="space-y-3">
              {pagedBookings.map((b) => (
            <div key={b._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon */}
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{b.className || "Demo Class"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Student: <span className="font-medium text-slate-600">{b.studentName}</span>
                    {b.grade ? ` · ${b.grade}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Booked on {fmtDate(b.createdAt)}</p>

                  {/* College + Department (shown when present) */}
                  {(b.college || b.selectedDepartment) && (
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {b.college && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {b.college}
                        </span>
                      )}
                      {b.selectedDepartment && (
                        <span className="text-[11px] font-semibold bg-purple-50 border border-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
                          {b.selectedDepartment}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Admin: contact summary */}
                  {isAdmin && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {b.email} · {b.phone || "N/A"} · {b.parentName}
                    </p>
                  )}

                  {/* User: show scheduled date+time if confirmed */}
                  {!isAdmin && b.status === "confirmed" && b.confirmedDate && (
                    <p className="text-xs font-semibold text-green-600 mt-1">
                      Demo scheduled: {fmtDate(b.confirmedDate)}
                      {b.confirmedTime ? ` at ${b.confirmedTime}` : ""}
                    </p>
                  )}

                  {/* Admin: show current confirmed date/time if set */}
                  {isAdmin && b.confirmedDate && (
                    <p className="text-xs font-semibold text-green-600 mt-1">
                      Scheduled: {fmtDate(b.confirmedDate)}
                      {b.confirmedTime ? ` at ${b.confirmedTime}` : ""}
                    </p>
                  )}
                </div>

                {/* Right side */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${STATUS_STYLES[b.status]}`}>
                    {b.status}
                  </span>

                  {/* Admin: action button */}
                  {isAdmin && (
                    <button
                      onClick={() => setActiveBooking(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold rounded-lg transition-colors border border-orange-200"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Manage
                    </button>
                  )}

                  {/* User: cancel button */}
                  {!isAdmin && (b.status === "pending" || b.status === "confirmed") && (
                    <button
                      onClick={() => onCancel(b._id)}
                      className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
          {/* Pagination */}
          {bookingTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                Showing {bookingPage * BOOKING_PAGE_SIZE + 1}–{Math.min((bookingPage + 1) * BOOKING_PAGE_SIZE, shown.length)} of {shown.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBookingPage((p) => p - 1)}
                  disabled={bookingPage === 0}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Prev
                </button>
                {Array.from({ length: bookingTotalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setBookingPage(i)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                      bookingPage === i ? "bg-orange-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setBookingPage((p) => p + 1)}
                  disabled={bookingPage >= bookingTotalPages - 1}
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

        {/* Calendar (Students only) */}
        {!isAdmin && !loading && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-4">
              {/* Calendar Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-400 p-4 text-white">
                <div className="flex items-center gap-1.5 text-xs text-orange-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Scheduled Demo Sessions
                </div>
              </div>

              {/* Calendar */}
              <div className="p-4 calendar-wrapper">
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="calendar-nav-btn"
                    aria-label="Previous month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h3 className="calendar-month-label">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button
                    onClick={() => changeMonth(1)}
                    className="calendar-nav-btn"
                    aria-label="Next month"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Weekday Headers */}
                <div className="calendar-weekdays">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-weekday">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                  {(() => {
                    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
                    const days = [];

                    // Empty cells before first day
                    for (let i = 0; i < startingDayOfWeek; i++) {
                      days.push(<div key={`empty-${i}`} className="calendar-day-empty" />);
                    }

                    // Calendar days
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const isTodayDate = isToday(date);
                      const booking = getBookingForDate(date);
                      const hasBooking = !!booking;

                      days.push(
                        <div
                          key={day}
                          className={`calendar-day ${
                            isTodayDate
                              ? 'calendar-day-today'
                              : hasBooking
                              ? 'calendar-day-booking'
                              : ''
                          }`}
                        >
                          <span className="calendar-day-number">{day}</span>
                          {hasBooking && (
                            <div className="booking-indicator">
                              <div className="booking-dot" />
                              <div className="booking-tooltip">
                                <p className="font-bold text-xs">{booking.className}</p>
                                {booking.confirmedTime && (
                                  <p className="text-[10px] text-gray-300 mt-0.5">{booking.confirmedTime}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    return days;
                  })()}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded bg-orange-500" />
                    <span className="text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded bg-green-100 border border-green-200 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-green-600" />
                    </div>
                    <span className="text-gray-600">Scheduled Demo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Admin action modal */}
      {activeBooking && (
        <ActionModal
          booking={activeBooking}
          onClose={() => setActiveBooking(null)}
          onSave={onStatusUpdate}
        />
      )}
    </div>
  );
};

export default BookingsTab;
