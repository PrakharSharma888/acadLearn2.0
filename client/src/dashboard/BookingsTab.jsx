import { useState } from "react";
import { fmtDate, STATUS_STYLES } from "./constants";

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
  const [carouselIdx,    setCarouselIdx]    = useState(0);

  const shown   = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const isAdmin = user?.role === "admin";

  // All upcoming sessions (today or future), sorted soonest first
  const upcomingSessions = demoSessions.filter((s) => daysUntil(s.date) >= 0);
  const prev = () => setCarouselIdx((i) => (i - 1 + upcomingSessions.length) % upcomingSessions.length);
  const next = () => setCarouselIdx((i) => (i + 1) % upcomingSessions.length);

  return (
    <div>
      {/* ── Demo Sessions Carousel (Students only) ── */}
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

          {/* Carousel slide */}
          {(() => {
            const s = upcomingSessions[carouselIdx];
            const d = daysUntil(s.date);
            const dayLabel = d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`;
            const isVeryNear = d <= 2;

            return (
              <div className="px-6 py-5">
                <div className={`rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5 ${
                  isVeryNear ? "bg-orange-50 border border-orange-200" : "bg-gray-50 border border-gray-100"
                }`}>
                  {/* Big date block */}
                  <div className={`shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm ${
                    isVeryNear ? "bg-orange-500 text-white" : "bg-white text-slate-700 border border-gray-200"
                  }`}>
                    <p className="text-2xl font-bold leading-none">{new Date(s.date).getDate()}</p>
                    <p className="text-xs font-semibold uppercase tracking-wide mt-0.5">
                      {new Date(s.date).toLocaleString("en-IN", { month: "short" })}
                    </p>
                    <p className="text-[10px] mt-0.5 opacity-75">
                      {new Date(s.date).getFullYear()}
                    </p>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-bold text-slate-800">{s.title}</h3>
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
                    <p className="text-sm text-gray-600 font-medium">
                      {s.time} &nbsp;·&nbsp; {s.instructor}
                    </p>
                    {s.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>

                  {/* Book Now */}
                  <button
                    onClick={() => onBookDemo(sessionToCls(s))}
                    className="shrink-0 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Book Now
                  </button>
                </div>

                {/* Carousel controls */}
                {upcomingSessions.length > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    {/* Prev */}
                    <button
                      onClick={prev}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Dots */}
                    <div className="flex items-center gap-1.5">
                      {upcomingSessions.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselIdx(i)}
                          className={`rounded-full transition-all ${
                            i === carouselIdx
                              ? "w-5 h-2 bg-orange-500"
                              : "w-2 h-2 bg-gray-300 hover:bg-orange-300"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Next */}
                    <button
                      onClick={next}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
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
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === s ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-slate-700"
              }`}
            >
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
          <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">No bookings found.</p>
        </div>
      )}

      {!loading && shown.length > 0 && (
        <div className="space-y-3">
          {shown.map((b) => (
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
      )}

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
