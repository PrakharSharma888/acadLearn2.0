import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE from "../config/api";

const INPUT_CLS = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400";

// ── Locked field display ───────────────────────────────────────────────────────
const LockedField = ({ value }) => (
  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
    <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
    <span className="text-sm font-semibold text-blue-700 truncate">{value}</span>
  </div>
);

// ── Minimal Pro Navbar ────────────────────────────────────────────────────────
const ProNavbarMin = () => {
  const navigate   = useNavigate();
  const [user, setUser] = useState(null);
  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/professional" className="font-black text-blue-600 text-lg tracking-tight">AcadLearn</Link>
        <div className="flex items-center gap-3">
          {user ? (
            <button
              onClick={() => navigate("/dashboard/overview")}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// ── Event Registration Modal ───────────────────────────────────────────────────
const EventRegModal = ({ event, onClose, user }) => {
  const [form,    setForm]    = useState({ name: "", parentName: "", phone: "", email: "", batchYear: "", college: "", department: "" });
  const [depts,   setDepts]   = useState([]); // departments from user's university
  const [profile, setProfile] = useState(null);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");
  const [done,    setDone]    = useState(false);

  // Auto-fill from logged-in user profile + fetch university departments
  useEffect(() => {
    // Always set form.college from event.universityName if present
    setForm((f) => ({
      ...f,
      college: event.universityName || f.college,
      department: event.targetDepartments && event.targetDepartments.length === 1 ? event.targetDepartments[0] : f.department,
    }));
    // Fetch user profile if logged in (for other fields)
    if (!user?.token) return;
    fetch(`${API_BASE}/api/profile/me`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((p) => {
        if (!p) return;
        setProfile(p);
        setForm((f) => ({
          ...f,
          name:       p.name           || f.name,
          email:      p.email          || f.email,
          phone:      p.phone          || f.phone,
          batchYear:  p.year           || f.batchYear,
          // Do NOT overwrite college if event.universityName is present
          college:    event.universityName || f.college,
        }));
        // Fetch this university's departments for the dropdown
        if (p.university) {
          fetch(`${API_BASE}/api/universities/${p.university}`)
            .then((r) => r.ok ? r.json() : null)
            .then((uni) => { if (uni?.departments) setDepts(uni.departments); })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [user, event]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFreeReg = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const payload = {
        ...form,
        universityId: event.universityId || undefined,
      };
      const res  = await fetch(`${API_BASE}/api/events/${event._id}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.message || "Registration failed."); return; }
      setDone(true);
    } catch { setMsg("Server error. Please try again."); }
    finally   { setSaving(false); }
  };

  const handlePaidReg = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setMsg("Name and email are required."); return; }
    setSaving(true); setMsg("");
    try {
      const payload = {
        ...form,
        universityId: event.universityId || undefined,
      };
      const res  = await fetch(`${API_BASE}/api/events/${event._id}/create-order`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.message || "Could not create payment order."); return; }
      const options = {
        key: data.keyId, amount: data.amount, currency: data.currency,
        name: "AcadLearn", description: data.eventTitle, order_id: data.orderId,
        handler: async (response) => {
          const vRes  = await fetch(`${API_BASE}/api/events/${event._id}/verify-payment`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, ...form, universityId: event.universityId || undefined }),
          });
          const vData = await vRes.json();
          if (vRes.ok) setDone(true);
          else setMsg(vData.message || "Payment verification failed.");
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme:   { color: "#2563eb" },
        modal:   { ondismiss: () => setSaving(false) },
      };
      new window.Razorpay(options).open();
    } catch { setMsg("Server error. Please try again."); }
    finally   { setSaving(false); }
  };

  const slotsLeft  = event.totalSlots > 0 ? event.totalSlots - event.registeredCount : null;
  const isFull     = slotsLeft !== null && slotsLeft <= 0;
  const isLoggedIn = Boolean(profile);

  // Department options: university depts > event targetDepartments > free text
  const deptOptions = depts.length > 0
    ? depts.map((d) => d.name)
    : (event.targetDepartments?.length > 0 ? event.targetDepartments : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-linear-to-r from-blue-600 to-indigo-500 p-5 text-white">
          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm">✕</button>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Register</p>
          <h2 className="text-lg font-bold leading-snug">{event.title}</h2>
          <div className="flex gap-2 mt-2 flex-wrap">
            {event.isFree
              ? <span className="text-xs font-bold bg-green-400/30 border border-green-300/50 px-2 py-0.5 rounded-full">FREE</span>
              : <span className="text-xs font-bold bg-white/20 border border-white/30 px-2 py-0.5 rounded-full">₹{event.price}</span>
            }
            {slotsLeft !== null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFull ? "bg-red-400/30 border border-red-300/50" : "bg-white/20 border border-white/30"}`}>
                {isFull ? "FULL" : `${slotsLeft} slots left`}
              </span>
            )}
          </div>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-black text-slate-800 mb-1">Registered!</h3>
            <p className="text-sm text-gray-500 mb-4">We'll send details to <strong>{form.email}</strong></p>
            <button onClick={onClose} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700">Done</button>
          </div>
        ) : (
          <form onSubmit={event.isFree ? handleFreeReg : handlePaidReg} className="p-5 space-y-3 max-h-[65vh] overflow-y-auto">
            {isFull && <p className="text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">Sorry, all slots are full!</p>}

            {/* Auto-filled info strip for logged-in users */}
            {isLoggedIn && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-xs text-blue-700 font-medium">Details auto-filled from your profile</p>
              </div>
            )}

            <div className="space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Name *</label>
                {isLoggedIn ? <LockedField value={form.name} /> : (
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className={INPUT_CLS} />
                )}
              </div>

              {/* Parent Name — always editable */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Parent Name</label>
                <input name="parentName" value={form.parentName} onChange={handleChange} placeholder="Parent / Guardian name" className={INPUT_CLS} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone *</label>
                  {isLoggedIn && form.phone ? <LockedField value={form.phone} /> : (
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile" className={INPUT_CLS} />
                  )}
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                  {isLoggedIn ? <LockedField value={form.email} /> : (
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className={INPUT_CLS} />
                  )}
                </div>
              </div>

              {/* Batch & Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Batch &amp; Year</label>
                {isLoggedIn && form.batchYear ? <LockedField value={form.batchYear} /> : (
                  <input name="batchYear" value={form.batchYear} onChange={handleChange} placeholder="e.g. B.Tech 2nd Year / 2022–26" className={INPUT_CLS} />
                )}
              </div>

              {/* College / Institute / University */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">College / Institute</label>
                {event.universityName ? (
                  <LockedField value={event.universityName} />
                ) : isLoggedIn && form.college ? (
                  <LockedField value={form.college} />
                ) : (
                  <input name="college" value={form.college} onChange={handleChange} placeholder="Your college / institute" className={INPUT_CLS} />
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                {deptOptions.length > 0 ? (
                  <select name="department" value={form.department} onChange={handleChange} className={INPUT_CLS}>
                    <option value="">— Select department —</option>
                    {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : isLoggedIn && form.department ? (
                  <LockedField value={form.department} />
                ) : (
                  <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. CSE, ECE" className={INPUT_CLS} />
                )}
              </div>
            </div>

            {msg && <p className="text-xs text-red-500 font-medium">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button
                type="submit" disabled={saving || isFull}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${
                  event.isFree
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-linear-to-r from-blue-600 to-indigo-500 text-white hover:opacity-90"
                }`}
              >
                {saving ? "Processing..." : event.isFree ? "Register for Free" : `Pay ₹${event.price} & Register`}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

const isUpcoming = (ev) => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return new Date(ev.date + "T00:00:00") >= today;
};

const PILLS = [
  { key: "all",      label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past",     label: "Past" },
  { key: "free",     label: "Free" },
  { key: "paid",     label: "Paid" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
const ProfessionalEvents = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [pill,      setPill]      = useState("all");
  const [regModal,  setRegModal]  = useState(null);
  const [user,      setUser]      = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events?page=professional`);
      setAllEvents(res.ok ? await res.json() : []);
    } catch { setAllEvents([]); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  // Sort: upcoming asc, then past desc
  const sorted = [
    ...allEvents.filter(isUpcoming),
    ...[...allEvents.filter((ev) => !isUpcoming(ev))].reverse(),
  ];

  // Apply pill filter
  const afterPill = sorted.filter((ev) => {
    if (pill === "upcoming") return isUpcoming(ev);
    if (pill === "past")     return !isUpcoming(ev);
    if (pill === "free")     return ev.isFree;
    if (pill === "paid")     return !ev.isFree;
    return true;
  });

  // Apply search
  const q = search.trim().toLowerCase();
  const filtered = q.length > 0
    ? afterPill.filter((ev) =>
        (ev.title        || "").toLowerCase().includes(q) ||
        (ev.description  || "").toLowerCase().includes(q) ||
        (ev.universityName || "").toLowerCase().includes(q)
      )
    : afterPill;

  return (
    <div className="min-h-screen bg-[#f8faff] font-sans text-gray-800">
      <ProNavbarMin />

      {/* Hero strip */}
      <div className="bg-linear-to-r from-blue-600 to-indigo-500 text-white py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link to="/professional" className="inline-flex items-center gap-1.5 text-blue-100 hover:text-white text-sm font-semibold mb-4 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Professional Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-2">All Events</h1>
          <p className="text-blue-100 text-lg">Workshops, seminars &amp; live sessions — build your professional edge!</p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by title, description, university..."
            className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            autoComplete="off"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          )}
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {PILLS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPill(p.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
                pill === p.key
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {p.label}
            </button>
          ))}
          {(search || pill !== "all") && (
            <button
              onClick={() => { setSearch(""); setPill("all"); }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
          <span className="ml-auto self-center text-xs text-gray-400">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Events grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-36 bg-gray-100" />
                <div className="p-5 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-9 bg-gray-100 rounded-2xl mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-lg font-bold text-slate-700 mb-1">
              {search ? `No results for "${search}"` : allEvents.length === 0 ? "No events yet" : "No events match this filter"}
            </p>
            <p className="text-sm text-gray-400">
              {allEvents.length === 0
                ? "Events for Professional page will appear here once created by admin."
                : "Try clearing your search or changing the filter."}
            </p>
            {(search || pill !== "all") && (
              <button
                onClick={() => { setSearch(""); setPill("all"); }}
                className="mt-4 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700"
              >
                Show all events
              </button>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((ev) => {
              const upcoming  = isUpcoming(ev);
              const slotsLeft = ev.totalSlots > 0 ? ev.totalSlots - ev.registeredCount : null;
              const isFull    = slotsLeft !== null && slotsLeft <= 0;
              return (
                <div
                  key={ev._id}
                  className={`bg-white rounded-3xl overflow-hidden border flex flex-col transition-all ${
                    upcoming ? "border-blue-100 shadow-sm hover:shadow-md" : "border-gray-100 opacity-60"
                  }`}
                >
                  {/* Image */}
                  <div className="h-36 relative overflow-hidden">
                    {ev.imageUrl
                      ? <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                      : <div className={`w-full h-full ${upcoming ? "bg-linear-to-br from-blue-500 to-indigo-400" : "bg-linear-to-br from-gray-300 to-gray-200"}`} />
                    }
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      {ev.isFree
                        ? <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-green-500 text-white">FREE</span>
                        : <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">₹{ev.price}</span>
                      }
                      {slotsLeft !== null && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFull ? "bg-red-500 text-white" : "bg-white/90 text-gray-700"}`}>
                          {isFull ? "FULL" : `${slotsLeft} slots`}
                        </span>
                      )}
                    </div>
                    {/* Past overlay */}
                    {!upcoming && (
                      <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
                        <span className="text-xs font-black text-white bg-gray-800/70 px-3 py-1 rounded-full uppercase tracking-wide">Event Ended</span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col">
                    <p className={`text-xs font-semibold mb-1 ${upcoming ? "text-blue-500" : "text-gray-400"}`}>
                      {fmtDate(ev.date)}{ev.time ? ` · ${ev.time}` : ""}
                    </p>
                    <h3 className="font-black text-slate-900 text-base mb-1 line-clamp-2">{ev.title}</h3>
                    {ev.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{ev.description}</p>
                    )}
                    {ev.universityName && (
                      <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full self-start mb-3">
                        {ev.universityName}
                      </span>
                    )}
                    <button
                      onClick={() => upcoming && !isFull && setRegModal(ev)}
                      disabled={!upcoming || isFull}
                      className={`mt-auto w-full py-2.5 rounded-2xl text-sm font-bold transition-all ${
                        !upcoming
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : isFull
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : ev.isFree
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                              : "bg-linear-to-r from-blue-600 to-indigo-500 text-white hover:opacity-90 shadow-sm"
                      }`}
                    >
                      {!upcoming ? "Event Ended" : isFull ? "Fully Booked" : ev.isFree ? "Register for Free" : `Pay ₹${ev.price} & Register`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {regModal && (
        <EventRegModal event={regModal} onClose={() => setRegModal(null)} user={user} />
      )}
    </div>
  );
};

export default ProfessionalEvents;
