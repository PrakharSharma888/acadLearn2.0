const ProgressTab = ({ bookings, classes }) => {
  const completed  = bookings.filter((b) => b.status === "completed").length;
  const totalDemos = bookings.length;
  const pct        = totalDemos > 0 ? Math.round((completed / totalDemos) * 100) : 0;

  const stats = [
    { label: "Total Bookings",    value: totalDemos,  color: "text-orange-600",  bg: "bg-orange-50" },
    { label: "Demos Completed",   value: completed,   color: "text-emerald-600", bg: "bg-emerald-50" },
    {
      label: "Active Bookings",
      value: bookings.filter((b) => b.status === "pending" || b.status === "confirmed").length,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    { label: "Classes Available", value: classes.length, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const milestones = [
    { label: "First Demo Booked",    done: totalDemos >= 1 },
    { label: "3 Demos Completed",    done: completed >= 3 },
    { label: "5 Classes Explored",   done: classes.length >= 5 },
    { label: "Full Course Enrolled", done: false },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800">My Progress</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
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
          <span className="text-sm font-bold text-orange-600">{pct}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div
            className="bg-orange-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
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
                {m.done ? (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${m.done ? "text-emerald-700" : "text-gray-400"}`}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational quote */}
      <div className="bg-linear-to-br from-orange-600 to-amber-600 rounded-2xl p-6 text-white shadow-md">
        <p className="italic text-orange-100 text-sm leading-relaxed mb-3">
          "The beautiful thing about learning is that no one can take it away from you."
        </p>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-70">
          <span className="w-4 h-px bg-white inline-block" /> B.B. King
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;
