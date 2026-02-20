import { fmtDate, STATUS_STYLES } from "./constants";

const OverviewTab = ({ user, classes, bookings, onNav }) => {
  const active   = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
  const upcoming = active.slice(0, 3);

  const stats = [
    {
      label: "Available Classes",
      value: classes.length,
      color: "text-orange-600",
      bg: "bg-orange-50",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      label: "Demo Bookings",
      value: bookings.length,
      color: "text-amber-600",
      bg: "bg-amber-50",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: "Active Bookings",
      value: active.length,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-linear-to-r from-orange-500 to-amber-500 rounded-2xl px-7 py-6 flex items-center justify-between shadow-md">
        <div>
          <p className="text-orange-100 text-sm font-medium mb-1">Good to see you 👋</p>
          <h1 className="text-2xl font-bold text-white">Welcome, {user.name}!</h1>
          <p className="text-orange-100 text-sm mt-1">Ready to explore your learning journey?</p>
        </div>
        <div className="hidden sm:flex w-14 h-14 bg-white/20 rounded-full items-center justify-center text-white font-bold text-2xl">
          {user.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold text-gray-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* My upcoming bookings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-slate-800">My Demo Bookings</h2>
          <button onClick={() => onNav("bookings")} className="text-xs font-semibold text-orange-600 hover:underline">
            View all
          </button>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No upcoming demos.</p>
            <button onClick={() => onNav("classes")} className="mt-3 text-sm font-semibold text-orange-600 hover:underline">
              Browse classes →
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <div key={b._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{b.className || "Demo Class"}</p>
                  <p className="text-xs text-gray-400">
                    {b.studentName}
                    {b.confirmedDate
                      ? ` · ${fmtDate(b.confirmedDate)}${b.confirmedTime ? ` at ${b.confirmedTime}` : ""}`
                      : ` · ${fmtDate(b.createdAt)}`}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onNav("classes")} className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-3 group-hover:bg-orange-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-700">Explore Classes</p>
          <p className="text-xs text-gray-400 mt-0.5">Browse & book demos</p>
        </button>
        <button onClick={() => onNav("bookings")} className="bg-white border border-gray-100 rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-shadow group">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-bold text-slate-700">My Bookings</p>
          <p className="text-xs text-gray-400 mt-0.5">View & manage demos</p>
        </button>
      </div>
    </div>
  );
};

export default OverviewTab;
