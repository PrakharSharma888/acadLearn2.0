import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ProHeroImg from "../assets/pro-hero.png";
import Logo from "../assets/logo.jpeg";
import API_BASE from "../config/api";
import BannerCarousel from "../components/BannerCarousel";
import BookDemoModal from "../components/BookDemoModal";

// ── Locked field display ───────────────────────────────────────────────────────
const LockedField = ({ value, accent = "blue" }) => (
  <div className={`flex items-center gap-2 bg-${accent}-50 border border-${accent}-200 rounded-xl px-3 py-2`}>
    <svg className={`w-3.5 h-3.5 text-${accent}-400 shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
    <span className={`text-sm font-semibold text-${accent}-700 truncate`}>{value}</span>
  </div>
);

// ── Event Registration Modal ───────────────────────────────────────────────────
const EventRegModal = ({ event, onClose, user }) => {
  const [form, setForm] = useState({ name: "", parentName: "", phone: "", email: "", batchYear: "", college: "", department: "" });
  const [depts, setDepts] = useState([]); // departments from user's university
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  // Auto-fill from logged-in user profile + fetch university departments
  useEffect(() => {
    if (!user?.token) return;
    fetch(`${API_BASE}/api/profile/me`, { headers: { Authorization: `Bearer ${user.token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((p) => {
        if (!p) return;
        setProfile(p);
        setForm((f) => ({
          ...f,
          name: p.name || f.name,
          email: p.email || f.email,
          phone: p.phone || f.phone,
          college: p.universityName || f.college,
          department: p.department || f.department,
          batchYear: p.year || f.batchYear,
        }));
        // Fetch this university's departments for the dropdown
        if (p.university) {
          fetch(`${API_BASE}/api/universities/${p.university}`)
            .then((r) => r.ok ? r.json() : null)
            .then((uni) => { if (uni?.departments) setDepts(uni.departments); })
            .catch(() => { });
        }
      })
      .catch(() => { });
  }, [user]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const INP = "w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white";

  const handleFreeReg = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/events/${event._id}/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.message || "Registration failed."); return; }
      setDone(true);
    } catch { setMsg("Server error. Please try again."); }
    finally { setSaving(false); }
  };

  const handlePaidReg = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { setMsg("Name and email are required."); return; }
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/events/${event._id}/create-order`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.message || "Could not create payment order."); return; }
      const options = {
        key: data.keyId, amount: data.amount, currency: data.currency,
        name: "AcadLearn", description: data.eventTitle, order_id: data.orderId,
        handler: async (response) => {
          const vRes = await fetch(`${API_BASE}/api/events/${event._id}/verify-payment`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, ...form }),
          });
          const vData = await vRes.json();
          if (vRes.ok) setDone(true);
          else setMsg(vData.message || "Payment verification failed.");
        },
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#2563eb" },
        modal: { ondismiss: () => setSaving(false) },
      };
      new window.Razorpay(options).open();
    } catch { setMsg("Server error. Please try again."); }
    finally { setSaving(false); }
  };

  const slotsLeft = event.totalSlots > 0 ? event.totalSlots - event.registeredCount : null;
  const isFull = slotsLeft !== null && slotsLeft <= 0;
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
                {isLoggedIn ? <LockedField value={form.name} accent="blue" /> : (
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className={INP} />
                )}
              </div>

              {/* Parent Name — always editable */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Parent Name</label>
                <input name="parentName" value={form.parentName} onChange={handleChange} placeholder="Parent / Guardian name" className={INP} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone *</label>
                  {isLoggedIn && form.phone ? <LockedField value={form.phone} accent="blue" /> : (
                    <input name="phone" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile" className={INP} />
                  )}
                </div>
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                  {isLoggedIn ? <LockedField value={form.email} accent="blue" /> : (
                    <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@email.com" className={INP} />
                  )}
                </div>
              </div>

              {/* Batch & Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Batch &amp; Year</label>
                {isLoggedIn && form.batchYear ? <LockedField value={form.batchYear} accent="blue" /> : (
                  <input name="batchYear" value={form.batchYear} onChange={handleChange} placeholder="e.g. B.Tech 2nd Year / 2022–26" className={INP} />
                )}
              </div>

              {/* College */}
              <label>College / Institute</label>
              {event.universityName ? (
                <LockedField value={event.universityName} />
              ) : isLoggedIn && form.college ? (
                <LockedField value={form.college} />
              ) : (
                <input name="college" value={form.college} onChange={handleChange} placeholder="Your college / institute" className={INP} />
              )}
              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                {deptOptions.length > 0 ? (
                  <select name="department" value={form.department} onChange={handleChange} className={INP}>
                    <option value="">— Select department —</option>
                    {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                ) : isLoggedIn && form.department ? (
                  <LockedField value={form.department} accent="blue" />
                ) : (
                  <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. CSE, ECE" className={INP} />
                )}
              </div>
            </div>

            {msg && <p className="text-xs text-red-500 font-medium">{msg}</p>}
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={saving || isFull}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 ${event.isFree ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-linear-to-r from-blue-600 to-indigo-500 text-white hover:opacity-90"}`}
              >
                {saving ? "Processing..." : event.isFree ? "Register for Free" : `Pay ₹${event.price} & Register`}
              </button>
              <button type="button" onClick={onClose} className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
// ── Navbar ─────────────────────────────────────────────────────────────────────
const ProNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToCourses = () => {
    setOpen(false);
    if (location.pathname === "/professional") {
      scrollTo("pro-courses-section");
    } else {
      navigate("/professional");
      setTimeout(() => scrollTo("pro-courses-section"), 300);
    }
  };

  return (
    <nav className="border-b border-dashed border-gray-200 px-4 py-3 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 overflow-hidden flex items-center justify-center shrink-0">
            <img src={Logo} alt="AcadLearn Pro Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg sm:text-2xl font-black text-gray-800 tracking-tight leading-none whitespace-nowrap">
            Acad<span className="text-blue-600">Learn Pro.</span>
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center text-sm font-bold">
          <Link to="/about" className="text-gray-700 hover:text-blue-600 transition-colors">About Us</Link>
          <button
            type="button"
            onClick={goToCourses}
            className="text-gray-700 hover:text-blue-600 transition-colors"
          >
            Our Courses
          </button>
          <Link to="/contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact Us</Link>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
              <div className="w-8 h-8 bg-linear-to-tr from-blue-600 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-blue-100 rounded-full hover:bg-blue-50 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-sm transition-colors"
              >
                Register
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md z-50">
          <div className="flex flex-col gap-4 px-6 py-4 text-sm font-bold">
            <Link to="/about" onClick={() => setOpen(false)}>About Us</Link>
            <button type="button" onClick={goToCourses} className="text-left">Our Courses</button>
            <Link to="/contact" onClick={() => setOpen(false)}>Contact Us</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const ProfessionalHome = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerDemo, setBannerDemo] = useState(null);
  const [courseDemo, setCourseDemo] = useState(null);
  const [noDemoMsg, setNoDemoMsg] = useState({});
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [regModal, setRegModal] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  const handleEnroll = () => navigate("/login");

  const handleBannerClick = (banner) => {
    if (banner.classId) {
      setBannerDemo({
        _id: banner.classId,
        title: banner.className || banner.title,
        category: banner.category || "professional",
        classSlug: banner.classSlug,
        department: banner.department,
        universityId: banner.universityId || "",
        universityName: banner.universityName || "",
        targetDepartments: banner.targetDepartments || [],
      });
    } else if (banner.link) {
      window.open(banner.link, "_blank", "noopener,noreferrer");
    }
    // else: no action for banners without classId or link
  };

  // Set of courseIds whose booking is locked to banner-only
  const lockedCourseIds = new Set(
    banners
      .filter((b) => b.classId && b.universityId && b.allowPublicBooking === false)
      .map((b) => b.classId)
  );

  const handleCourseBookDemo = (course) => {
    if (lockedCourseIds.has(course._id)) return; // button is disabled
    if (!course.nextDemoSession) {
      setNoDemoMsg((prev) => ({ ...prev, [course._id]: true }));
      setTimeout(() => setNoDemoMsg((prev) => ({ ...prev, [course._id]: false })), 3000);
      return;
    }
    if (!user) { navigate("/login"); return; }
    setCourseDemo({
      ...course,
      sessionDate: course.nextDemoSession?.date || "",
      sessionTime: course.nextDemoSession?.time || "",
    });
  };

  const loadData = useCallback(async () => {
    try {
      const [cRes, bRes, eRes] = await Promise.all([
        fetch(`${API_BASE}/api/classes`),
        fetch(`${API_BASE}/api/banners?page=professional`),
        fetch(`${API_BASE}/api/events?page=professional`),
      ]);
      if (cRes.ok) {
        const all = await cRes.json();
        setCourses(all.filter((c) => c.category === "professional" && c.isActive));
      }
      if (bRes.ok) setBanners(await bRes.json());
      if (eRes.ok) setEvents(await eRes.json());
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-sans text-gray-800 selection:bg-blue-200">
      <ProNavbar />

      <main>

        {/* Section 1: Hero */}
        <section className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-slate-900">
              Advance Your Career with{" "}
              <span className="text-blue-600">Industry-Ready Skills.</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-lg">
              Live, expert-led courses built for working professionals and
              college students. Learn at your pace, get certified, and land
              your dream role.
            </p>

            <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-700">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <span className="text-2xl">💼</span> Career-Focused
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <span className="text-2xl">🎓</span> Certified Courses
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <span className="text-2xl">🧑‍💻</span> Live Mentorship
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleEnroll}
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all"
              >
                Enroll for Free Demo
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("pro-courses-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-100 rounded-full font-bold text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <span>↓</span> Explore Courses
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="aspect-square md:aspect-4/3 bg-blue-100 rounded-[3rem] relative overflow-hidden transform -rotate-2 hover:rotate-0 transition-all duration-500">
              <img
                src={ProHeroImg}
                alt="Professional learning"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-blue-900/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* Section 2: Upcoming Events */}
        {(() => {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          const upcomingEvents = events
            .filter(ev => new Date(ev.date + "T00:00:00") >= today)
            .slice(0, 3);
          if (events.length === 0) return null;
          return (
            <section className="py-16 container mx-auto px-4">
              <div className="text-center mb-10">
                <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-full mb-3 text-sm uppercase tracking-wide">
                  Events
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-2">Upcoming Events</h2>
                <p className="text-lg text-gray-500">Workshops, seminars &amp; live sessions for professionals</p>
              </div>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">No upcoming events right now. Check back soon!</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((ev) => {
                    const slotsLeft = ev.totalSlots > 0 ? ev.totalSlots - ev.registeredCount : null;
                    const isFull = slotsLeft !== null && slotsLeft <= 0;
                    return (
                      <div key={ev._id} className="bg-white rounded-3xl overflow-hidden border border-blue-100 shadow-sm flex flex-col">
                        <div className="h-36 relative overflow-hidden">
                          {ev.imageUrl
                            ? <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-linear-to-br from-blue-500 to-indigo-400" />
                          }
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
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <p className="text-xs font-semibold text-blue-500 mb-1">
                            {new Date(ev.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            {ev.time ? ` · ${ev.time}` : ""}
                          </p>
                          <h3 className="font-black text-slate-900 text-base mb-1 line-clamp-2">{ev.title}</h3>
                          {ev.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{ev.description}</p>}
                          {ev.universityName && (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full self-start mb-3">
                              {ev.universityName}
                            </span>
                          )}
                          <button
                            onClick={() => !isFull && setRegModal(ev)}
                            disabled={isFull}
                            className={`mt-auto w-full py-2.5 rounded-2xl text-sm font-bold transition-all ${isFull
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : ev.isFree
                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                                : "bg-linear-to-r from-blue-600 to-indigo-500 text-white hover:opacity-90 shadow-sm"
                              }`}
                          >
                            {isFull ? "Fully Booked" : ev.isFree ? "Register for Free" : `Pay ₹${ev.price} & Register`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* View All link */}
              <div className="text-center mt-10">
                <Link
                  to="/professional/events"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-bold rounded-2xl transition-all text-sm"
                >
                  View All Events
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </section>
          );
        })()}

        {/* Section 3: The "Why" */}
        <section className="bg-white py-20 border-y border-dashed border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 font-bold rounded-full mb-4 text-sm uppercase tracking-wide">
              The Goal
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-16">
              From a "Degree Holder" to a{" "}
              <span className="text-blue-500">"Job-Ready Professional."</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-red-50 p-8 rounded-3xl border-b-4 border-red-200 text-left">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-xl font-black text-red-900 mb-2">The Problem</h3>
                <p className="text-red-800/80 font-medium">
                  Most graduates have degrees but lack the practical, in-demand
                  skills employers actually look for.
                </p>
              </div>

              <div className="bg-blue-50 p-8 rounded-3xl border-b-4 border-blue-200 text-left transform md:-translate-y-4 shadow-xl">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-black text-blue-900 mb-2">Our Solution</h3>
                <p className="text-blue-800/80 font-medium">
                  We teach industry tools, real projects, and career skills —
                  live, with mentors who have worked at top companies.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-3xl border-b-4 border-green-200 text-left">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-black text-green-900 mb-2">The Result</h3>
                <p className="text-green-800/80 font-medium">
                  Stronger resume, higher salary packages, and the confidence
                  to crack any interview.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Banners */}
        {banners.length > 0 && <BannerCarousel banners={banners} onBannerClick={handleBannerClick} />}

        {/* Section 3: Courses */}
        <section id="pro-courses-section" className="py-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">Our Courses</h2>
            <p className="text-lg md:text-xl text-gray-600">
              Pick the path that matches your career goals!
            </p>
          </div>

          {courses.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-lg">Courses coming soon — stay tuned!</p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-blue-100 shadow-sm flex flex-col">
                  <div className={`h-40 w-full flex items-center justify-center text-5xl ${course.color || "bg-blue-600"}`}>
                    {course.badge || "📘"}
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                      {course.level}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{course.title}</h3>
                    {course.subtitle && (
                      <p className="text-sm font-medium text-blue-500 mb-2">{course.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">{course.description}</p>
                    <ul className="space-y-1 text-sm text-gray-700 mb-4">
                      {course.instructor && (
                        <li><span className="font-semibold">Instructor:</span> {course.instructor}</li>
                      )}
                      {course.duration && (
                        <li><span className="font-semibold">Duration:</span> {course.duration}</li>
                      )}
                      {course.totalLessons > 0 && (
                        <li><span className="font-semibold">Lessons:</span> {course.totalLessons}</li>
                      )}
                      {course.nextDemoSession && (
                        <li className="text-blue-600 font-semibold">
                          Next Demo: {new Date(course.nextDemoSession.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" "}&middot; {(() => { const [h, m] = course.nextDemoSession.time.split(":").map(Number); const s = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${String(m).padStart(2, "0")} ${s}`; })()}
                        </li>
                      )}
                    </ul>
                    {lockedCourseIds.has(course._id) ? (
                      <div className="mt-2">
                        <button
                          disabled
                          className="inline-flex justify-center rounded-full px-5 py-2 text-sm font-semibold bg-gray-200 text-gray-400 cursor-not-allowed"
                        >
                          No Demo Scheduled
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCourseBookDemo(course)}
                          className={`mt-2 inline-flex justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all ${course.nextDemoSession
                            ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                          {course.nextDemoSession ? "Book a Demo" : "No Demo Scheduled"}
                        </button>
                        {noDemoMsg[course._id] && (
                          <p className="mt-2 text-xs text-red-500 font-medium text-center">
                            Demo not scheduled for this course yet.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Learning Tracks */}
        <section className="py-20 container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 text-slate-900">
            Learning Tracks for Every Stage
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 bg-blue-400 text-white font-black px-6 py-2 rounded-bl-2xl">
                Fresher
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 mt-4">Career Starter</h3>
              <div className="text-blue-600 font-bold mb-6 uppercase tracking-wider text-xs">
                Foundation & Skills
              </div>
              <p className="text-gray-600 mb-8 font-medium">
                Build core technical and soft skills from scratch. Perfect for
                college students and fresh graduates entering the job market.
              </p>
              <div className="bg-white rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-2xl">🛠️</span>
                <span className="font-bold text-sm text-gray-700">Hands-on Projects</span>
              </div>
            </div>

            <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 relative overflow-hidden group hover:shadow-xl transition-all transform lg:-translate-y-4">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white font-black px-6 py-2 rounded-bl-2xl">
                1–3 Years
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 mt-4">Growth Track</h3>
              <div className="text-indigo-600 font-bold mb-6 uppercase tracking-wider text-xs">
                Upskill & Promote
              </div>
              <p className="text-gray-600 mb-8 font-medium">
                Sharpen your specialization, learn leadership basics, and build
                a portfolio that speaks louder than your resume.
              </p>
              <div className="bg-white rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-2xl">📈</span>
                <span className="font-bold text-sm text-gray-700">Career Mentorship</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 bg-blue-600 text-white font-black px-6 py-2 rounded-bl-2xl">
                3+ Years
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 mt-4">Leadership Track</h3>
              <div className="text-blue-600 font-bold mb-6 uppercase tracking-wider text-xs">
                Lead & Scale
              </div>
              <p className="text-gray-600 mb-8 font-medium">
                Strategy, team management, executive presence, and advanced
                domain expertise to reach the C-Suite faster.
              </p>
              <div className="bg-white rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-2xl">🏆</span>
                <span className="font-bold text-sm text-gray-700">Executive Coaching</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Secret Sauce */}
        <section className="bg-[#1e293b] py-20 text-white rounded-[3rem] mx-4 my-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-2 block">
                The AcadLearn Pro Edge
              </span>
              <h2 className="text-4xl font-black">Our Secret Sauce</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  🧑‍🏫
                </div>
                <h4 className="font-bold text-lg mb-2">Industry Mentors</h4>
                <p className="text-slate-400 text-sm">
                  Every batch is taught by professionals with 5+ years of real
                  industry experience.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  📁
                </div>
                <h4 className="font-bold text-lg mb-2">Live Projects</h4>
                <p className="text-slate-400 text-sm">
                  Build real portfolio projects employers care about. Not just
                  theory, but production-ready work.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  🎯
                </div>
                <h4 className="font-bold text-lg mb-2">Placement Support</h4>
                <p className="text-slate-400 text-sm">
                  Resume reviews, mock interviews, and direct referrals to our
                  hiring partner network.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  🔄
                </div>
                <h4 className="font-bold text-lg mb-2">Lifetime Access</h4>
                <p className="text-slate-400 text-sm">
                  Course recordings, updated materials, and the alumni
                  community are yours forever.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Project Gallery */}
        <section className="py-20 overflow-hidden">
          <div className="container mx-auto px-4 mb-12 flex justify-between items-end">
            <h2 className="text-4xl font-black text-slate-900 max-w-lg">
              See What Our Learners are{" "}
              <span className="text-blue-600">Building!</span>
            </h2>
            <div className="hidden md:flex gap-2">
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">←</button>
              <button className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">→</button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 px-4 pl-4 md:pl-[calc((100vw-1280px)/2)] scrollbar-hide">
            {[
              { icon: "📊", title: "Sales Dashboard", by: "Built by Riya (Marketing Manager)", tags: [{ label: "Python", color: "bg-blue-50 text-blue-600" }, { label: "Analytics", color: "bg-indigo-50 text-indigo-600" }] },
              { icon: "🛒", title: "E-Commerce App", by: "Built by Arjun (CS Final Year)", tags: [{ label: "React", color: "bg-cyan-50 text-cyan-600" }, { label: "Node.js", color: "bg-green-50 text-green-600" }] },
              { icon: "📱", title: "Portfolio Website", by: "Built by Meera (Fresher)", tags: [{ label: "UI/UX", color: "bg-pink-50 text-pink-600" }, { label: "Figma", color: "bg-purple-50 text-purple-600" }] },
              { icon: "🤖", title: "ML Price Predictor", by: "Built by Karan (Data Analyst)", tags: [{ label: "ML", color: "bg-orange-50 text-orange-600" }, { label: "Scikit", color: "bg-yellow-50 text-yellow-600" }] },
            ].map((item, i) => (
              <div key={i} className="min-w-75 md:min-w-100 bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
                <div className="aspect-video bg-gray-100 rounded-2xl mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-4xl">{item.icon}</div>
                </div>
                <h3 className="font-black text-xl mb-1">{item.title}</h3>
                <p className="text-gray-500 mb-4">{item.by}</p>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map((t, j) => (
                    <span key={j} className={`px-3 py-1 text-xs font-bold rounded-full ${t.color}`}>{t.label}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 7: Testimonials */}
        <section className="bg-blue-50 py-24">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-3xl font-black mb-16 text-slate-900">
              Trusted by 10,000+ Working Professionals
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm text-left relative">
                <div className="text-6xl text-blue-200 absolute top-4 left-4">"</div>
                <p className="text-gray-700 italic mb-6 relative z-10 pt-4">
                  "I was a marketing executive with no data skills. After AcadLearn
                  Pro's Python course, I got promoted to Data Analyst in 3 months.
                  The live projects made all the difference!"
                </p>
                <div className="font-bold text-slate-900">— Neha S., Marketing → Data Analyst</div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm text-left relative">
                <div className="text-6xl text-blue-200 absolute top-4 left-4">"</div>
                <p className="text-gray-700 italic mb-6 relative z-10 pt-4">
                  "As a CS fresher, I had the theory but no projects. AcadLearn Pro
                  helped me build a full-stack app that got me my first job offer."
                </p>
                <div className="font-bold text-slate-900">— Rahul M., Fresher → SDE at Startup</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Footer CTA */}
        <section className="py-20 bg-slate-900 text-center text-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Give your career the AcadLearn Edge.
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Join 500+ professionals enrolling this month. Free demo available.
            </p>
            <button
              onClick={handleEnroll}
              className="px-10 py-5 bg-blue-600 text-white rounded-full font-bold text-xl shadow-lg shadow-blue-900/50 hover:bg-blue-700 hover:scale-105 transition-all mb-12"
            >
              Reserve My Free Demo Now
            </button>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-bold text-slate-500 border-t border-slate-800 pt-12">
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link>
            </div>
            <div className="mt-8 text-xs text-slate-700">
              © 2026 AcadLearn Pro. All rights reserved.
            </div>
          </div>
        </section>

      </main>

      {/* Book Demo Modal — triggered when banner with linked class is clicked */}
      {bannerDemo && (
        <BookDemoModal
          cls={bannerDemo}
          user={user}
          onClose={() => setBannerDemo(null)}
        />
      )}

      {/* Book Demo Modal — triggered when course card "Book a Demo" is clicked */}
      {courseDemo && (
        <BookDemoModal
          cls={courseDemo}
          user={user}
          onClose={() => setCourseDemo(null)}
        />
      )}

      {/* Event Registration Modal */}
      {regModal && <EventRegModal event={regModal} onClose={() => setRegModal(null)} user={user} />}
    </div>
  );
};

export default ProfessionalHome;
