import { useState } from "react";
import { fmtDate, STATUS_STYLES } from "./constants";

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];

const BookingsTab = ({ bookings, loading, onCancel, user, onStatusUpdate }) => {
  const [filter, setFilter]                   = useState("all");
  const [confirmedDates, setConfirmedDates]   = useState({});

  const shown   = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const isAdmin = user?.role === "admin";

  const handleStatusChange = (bookingId, newStatus) => {
    const date = confirmedDates[bookingId] || "";
    onStatusUpdate(bookingId, newStatus, date);
  };

  return (
    <div>
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
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
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
                <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{b.className || "Demo Class"}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Student: <span className="font-medium text-slate-600">{b.studentName}</span> · Grade {b.grade}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Booked on {fmtDate(b.createdAt)}
                  </p>

                  {/* Show confirmed date to user when booking is confirmed */}
                  {!isAdmin && b.status === "confirmed" && b.confirmedDate && (
                    <p className="text-xs font-semibold text-green-600 mt-1">
                      Demo scheduled: {fmtDate(b.confirmedDate)}
                    </p>
                  )}

                  {isAdmin && (
                    <p className="text-xs text-gray-500 mt-1">
                      📧 {b.email} · 📞 {b.phone || "N/A"} · Parent: {b.parentName}
                    </p>
                  )}

                  {/* Admin: date picker shown inline for setting confirmed date */}
                  {isAdmin && (
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <label className="text-[11px] text-gray-400 font-medium">Demo date:</label>
                      <input
                        type="date"
                        value={confirmedDates[b._id] ?? (b.confirmedDate || "")}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) =>
                          setConfirmedDates((prev) => ({ ...prev, [b._id]: e.target.value }))
                        }
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-gray-50 focus:outline-none focus:border-orange-300"
                      />
                      {b.confirmedDate && (
                        <span className="text-[11px] text-green-600 font-semibold">
                          Confirmed: {fmtDate(b.confirmedDate)}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  {isAdmin ? (
                    <select
                      value={b.status}
                      onChange={(e) => handleStatusChange(b._id, e.target.value)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-slate-700 hover:border-orange-300 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase ${STATUS_STYLES[b.status]}`}>
                      {b.status}
                    </span>
                  )}
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
    </div>
  );
};

export default BookingsTab;
