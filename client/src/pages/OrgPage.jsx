import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_BASE from "../config/api";
import Logo from "../assets/logo.jpeg";
import BannerCarousel from "../components/BannerCarousel";
import BookDemoModal from "../components/BookDemoModal";

// ── Event Registration Modal ───────────────────────────────────────────────────
const EventRegModal = ({ event, onClose }) => {
  const [form, setForm]     = useState({ name: "", email: "", phone: "", college: "", department: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState("");
  const [done, setDone]     = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFreeReg = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/events/${event._id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setMsg(data.message || "Could not create payment order."); return; }

      const options = {
        key:          data.keyId,
        amount:       data.amount,
        currency:     data.currency,
        name:         "AcadLearn",
        description:  data.eventTitle,
        order_id:     data.orderId,
        handler: async (response) => {
          try {
            const vRes = await fetch(`${API_BASE}/api/events/${event._id}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, ...form }),
            });
            const vData = await vRes.json();
            if (vRes.ok) { setDone(true); }
            else { setMsg(vData.message || "Payment verification failed."); }
          } catch { setMsg("Verification error. Contact support."); }
        },
        prefill:      { name: form.name, email: form.email, contact: form.phone },
        theme:        { color: "#4f46e5" },
        modal:        { ondismiss: () => setSaving(false) },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch { setMsg("Server error. Please try again."); }
    finally { setSaving(false); }
  };

  const slotsLeft = event.totalSlots > 0 ? event.totalSlots - event.registeredCount : null;
  const isFull    = slotsLeft !== null && slotsLeft <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-500 p-5 text-white">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Event Registration</p>
          <h2 className="text-lg font-bold leading-snug">{event.title}</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {new Date(event.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {event.time ? ` · ${event.time}` : ""}
            </span>
            {event.isFree
              ? <span className="text-xs font-bold bg-green-400/30 text-green-100 px-2 py-0.5 rounded-full">FREE</span>
              : <span className="text-xs font-bold bg-orange-400/30 text-orange-100 px-2 py-0.5 rounded-full">₹{event.price}</span>
            }
            {slotsLeft !== null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isFull ? "bg-red-400/30 text-red-100" : "bg-white/20"}`}>
                {isFull ? "FULL" : `${slotsLeft} slots left`}
              </span>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5">
          {done ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">You're Registered!</h3>
              <p className="text-sm text-gray-500 mb-4">
                {event.isFree ? "Registration confirmed." : "Payment successful & registration confirmed."}
                {" "}We'll send details to <strong>{form.email}</strong>.
              </p>
              <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors">
                Close
              </button>
            </div>
          ) : isFull ? (
            <div className="text-center py-6">
              <div className="text-5xl mb-3">😔</div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Slots Full</h3>
              <p className="text-sm text-gray-500">All slots for this event are taken. Check back for upcoming events.</p>
              <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={event.isFree ? handleFreeReg : handlePaidReg} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Your Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="you@email.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="10-digit number"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                  <input name="department" value={form.department} onChange={handleChange}
                    placeholder="e.g. CSE"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">College / Institution</label>
                <input name="college" value={form.college} onChange={handleChange}
                  placeholder="College name"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {msg && <p className="text-sm text-red-500 font-medium">{msg}</p>}
              <button type="submit" disabled={saving}
                className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving
                  ? "Please wait..."
                  : event.isFree ? "Register for Free" : `Pay ₹${event.price} & Register`}
              </button>
              {!event.isFree && (
                <p className="text-[11px] text-gray-400 text-center">
                  Secure payment powered by Razorpay
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

// Format "YYYY-MM-DD" → "3 Mar 2025"
const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

// Format "HH:MM" → "3:30 PM"
const fmtTime = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const s = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${s}`;
};

const OrgPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [university,   setUniversity]   = useState(null);
  const [banners,      setBanners]      = useState([]);
  const [courses,      setCourses]      = useState([]);
  const [events,       setEvents]       = useState([]);
  const [regModal,     setRegModal]     = useState(null); // event object
  const [user,         setUser]         = useState(null);
  const [demoModal,    setDemoModal]    = useState(null); // { cls, banner }
  const [notFound,     setNotFound]     = useState(false);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1. Fetch university by slug
        const uRes = await fetch(`${API_BASE}/api/universities/slug/${slug}`);
        if (!uRes.ok) { setNotFound(true); setLoading(false); return; }
        const univ = await uRes.json();
        setUniversity(univ);

        // 2. Fetch all active banners and filter by this university
        const [bRes, cRes, eRes] = await Promise.all([
          fetch(`${API_BASE}/api/banners`),
          fetch(`${API_BASE}/api/classes`),
          fetch(`${API_BASE}/api/events?universityId=${univ._id}`),
        ]);

        const allBanners  = bRes.ok ? await bRes.json() : [];
        const allClasses  = cRes.ok ? await cRes.json() : [];
        const univEvents  = eRes.ok ? await eRes.json() : [];
        setEvents(univEvents);

        // Banners targeted at this university (active ones)
        const univBanners = allBanners.filter(
          (b) => b.isActive && b.universityId === univ._id.toString()
        );
        setBanners(univBanners);

        // Courses linked via those banners (unique by classId)
        const seenIds = new Set();
        const linkedCourses = [];
        univBanners.forEach((b) => {
          if (b.classId && !seenIds.has(b.classId)) {
            seenIds.add(b.classId);
            const course = allClasses.find((c) => c._id === b.classId);
            if (course) linkedCourses.push({ course, banner: b });
          }
        });
        setCourses(linkedCourses);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleBannerClick = (banner) => {
    if (!banner.classId) {
      if (banner.link) window.open(banner.link, "_blank", "noopener,noreferrer");
      return;
    }
    openDemoModal(banner);
  };

  const openDemoModal = (banner) => {
    setDemoModal({
      _id:               banner.classId,
      title:             banner.className || banner.title,
      category:          banner.category || "professional",
      classSlug:         banner.classSlug,
      department:        banner.department,
      universityId:      banner.universityId,
      universityName:    banner.universityName || university?.name || "",
      targetDepartments: banner.targetDepartments || [],
      sessionDate:       banner.eventDate || "",
      sessionTime:       banner.eventTime || "",
    });
  };

  const handleBookCourse = (banner, course) => {
    if (!user) { navigate("/login"); return; }
    openDemoModal(banner);
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading organization page...</p>
        </div>
      </div>
    );
  }

  // ── Not found state ────────────────────────────────────────────────────────
  if (notFound || !university) {
    return (
      <div className="min-h-screen bg-[#F8FAFF] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-6xl mb-4">🏛️</div>
        <h1 className="text-3xl font-black text-slate-800 mb-3">Organization Not Found</h1>
        <p className="text-gray-500 mb-6 max-w-sm">
          This organization page doesn't exist or hasn't been activated yet.
        </p>
        <Link to="/" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFF] font-sans text-gray-800">

      {/* ── Navbar ── */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 overflow-hidden">
              <img src={Logo} alt="AcadLearn" className="w-full h-full object-contain" />
            </div>
            <span className="text-lg font-black text-gray-800">
              Acad<span className="text-blue-600">Learn</span>
            </span>
          </Link>

          {/* University name in center */}
          <div className="hidden sm:flex items-center gap-2">
            {university.logoUrl && (
              <img src={university.logoUrl} alt={university.name} className="h-7 w-auto object-contain" />
            )}
            <span className="font-bold text-slate-700 text-sm">{university.name}</span>
            {university.shortName && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-semibold">
                {university.shortName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/dashboard" className="px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-200 rounded-full hover:bg-blue-50 transition-colors">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>

        {/* ── Hero: University branding ── */}
        <section className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-10 flex flex-col sm:flex-row items-center gap-6">
            {university.logoUrl ? (
              <img
                src={university.logoUrl}
                alt={university.name}
                className="w-24 h-24 object-contain rounded-2xl border border-gray-100 shadow-sm bg-white p-2 shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <span className="text-4xl font-black text-blue-300">
                  {university.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Official AcadLearn Partner
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">{university.name}</h1>
              {university.shortName && (
                <p className="text-gray-500 font-medium mt-1">{university.shortName}</p>
              )}
              {university.departments?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {university.departments.slice(0, 6).map((d) => (
                    <span key={d._id} className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                      {d.name}{d.code ? ` (${d.code})` : ""}
                    </span>
                  ))}
                  {university.departments.length > 6 && (
                    <span className="text-xs font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                      +{university.departments.length - 6} more
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Banners carousel ── */}
        {banners.length > 0 && (
          <BannerCarousel banners={banners} onBannerClick={handleBannerClick} />
        )}

        {/* ── No banners placeholder ── */}
        {banners.length === 0 && (
          <section className="py-12 text-center text-gray-400">
            <div className="text-5xl mb-3">📢</div>
            <p className="font-semibold">No active campaigns yet for this organization.</p>
          </section>
        )}

        {/* ── Courses/Classes section ── */}
        <section className="py-16 container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
              Courses for {university.shortName || university.name} Students
            </h2>
            <p className="text-gray-500">
              Exclusive sessions curated for your institution
            </p>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">📚</div>
              <p className="font-semibold text-lg">No courses linked yet.</p>
              <p className="text-sm mt-1">Check back soon — new sessions are being added.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(({ course, banner }) => {
                const isLocked = banner.universityId && !banner.allowPublicBooking;
                const hasDemo  = !!course.nextDemoSession;

                return (
                  <div
                    key={course._id}
                    className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                  >
                    {/* Course color banner */}
                    <div className={`h-32 w-full flex items-center justify-center text-5xl ${course.color || "bg-blue-600"}`}>
                      {course.badge || "📘"}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
                        {course.level}
                      </p>
                      <h3 className="text-xl font-black text-slate-900 mb-1">{course.title}</h3>
                      {course.subtitle && (
                        <p className="text-sm text-blue-500 font-medium mb-2">{course.subtitle}</p>
                      )}
                      <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-3">{course.description}</p>

                      {/* Course meta */}
                      <ul className="space-y-1 text-sm text-gray-600 mb-4">
                        {course.instructor && (
                          <li><span className="font-semibold">Instructor:</span> {course.instructor}</li>
                        )}
                        {course.duration && (
                          <li><span className="font-semibold">Duration:</span> {course.duration}</li>
                        )}
                        {/* Show scheduled demo from banner or course */}
                        {(banner.eventDate || course.nextDemoSession) && (
                          <li className="text-blue-600 font-semibold">
                            Next Demo:{" "}
                            {banner.eventDate
                              ? `${fmtDate(banner.eventDate)}${banner.eventTime ? ` · ${fmtTime(banner.eventTime)}` : ""}`
                              : `${fmtDate(course.nextDemoSession.date)} · ${fmtTime(course.nextDemoSession.time)}`}
                          </li>
                        )}
                      </ul>

                      {/* University targeting badges */}
                      {banner.targetDepartments?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {banner.targetDepartments.map((d) => (
                            <span key={d} className="text-[11px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                              {d}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA — always bookable through org page (isLocked only blocks public landing pages) */}
                      {hasDemo ? (
                        <button
                          onClick={() => handleBookCourse(banner, course)}
                          className="mt-auto inline-flex justify-center items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold bg-blue-600 text-white shadow hover:bg-blue-700 hover:shadow-md transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Book Free Demo
                        </button>
                      ) : (
                        <button disabled className="mt-auto inline-flex justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed">
                          No Demo Scheduled
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Events section ── */}
        {events.length > 0 && (
          <section className="py-16 bg-white border-t border-gray-100">
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                  Upcoming Events
                </h2>
                <p className="text-gray-500">Register for exclusive sessions and workshops</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((ev) => {
                  const slotsLeft = ev.totalSlots > 0 ? ev.totalSlots - ev.registeredCount : null;
                  const isFull    = slotsLeft !== null && slotsLeft <= 0;
                  return (
                    <div key={ev._id} className="bg-[#F8FAFF] rounded-4xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                      {/* Event image or gradient */}
                      {ev.imageUrl ? (
                        <div className="h-40 w-full overflow-hidden">
                          <img src={ev.imageUrl} alt={ev.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-40 w-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl">
                          🎯
                        </div>
                      )}

                      <div className="p-5 flex-1 flex flex-col">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {ev.isFree
                            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">FREE</span>
                            : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">₹{ev.price}</span>
                          }
                          {isFull
                            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200">FULL</span>
                            : slotsLeft !== null && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                {slotsLeft} slots left
                              </span>
                            )
                          }
                        </div>

                        <h3 className="text-lg font-black text-slate-900 mb-1 leading-snug">{ev.title}</h3>
                        {ev.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-1">{ev.description}</p>
                        )}

                        {/* Date & time */}
                        <div className="flex items-center gap-1.5 text-sm text-indigo-600 font-semibold mb-1">
                          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(ev.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {ev.time && <span className="text-gray-500 font-normal">· {ev.time}</span>}
                        </div>

                        {/* Dept chips */}
                        {ev.targetDepartments?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {ev.targetDepartments.map((d) => (
                              <span key={d} className="text-[10px] font-semibold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">{d}</span>
                            ))}
                          </div>
                        )}

                        {/* CTA */}
                        <button
                          onClick={() => setRegModal(ev)}
                          disabled={isFull}
                          className={`mt-auto w-full py-2.5 text-sm font-bold rounded-full transition-all ${
                            isFull
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : ev.isFree
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow hover:shadow-md"
                                : "bg-linear-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow hover:shadow-md"
                          }`}
                        >
                          {isFull
                            ? "Slots Full"
                            : ev.isFree
                              ? "Register for Free"
                              : `Pay ₹${ev.price} & Register`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer CTA ── */}
        <section className="bg-slate-900 text-white py-16 text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-3">
              Exclusive for {university.shortName || university.name}
            </p>
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to level up your skills?
            </h2>
            <p className="text-slate-400 mb-8">
              Book a free demo session and see how AcadLearn can accelerate your career.
            </p>
            {banners.length > 0 && banners[0].classId ? (
              <button
                onClick={() => handleBannerClick(banners[0])}
                className="px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-900/40"
              >
                Book My Free Demo
              </button>
            ) : (
              <Link
                to="/professional"
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full font-bold text-lg hover:bg-blue-700 hover:scale-105 transition-all shadow-lg shadow-blue-900/40"
              >
                Explore All Courses
              </Link>
            )}
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-slate-600 border-t border-slate-800 pt-8">
              <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Demo modal ── */}
      {demoModal && (
        <BookDemoModal
          cls={demoModal}
          user={user}
          onClose={() => setDemoModal(null)}
        />
      )}

      {/* ── Event registration modal ── */}
      {regModal && (
        <EventRegModal
          event={regModal}
          onClose={() => setRegModal(null)}
        />
      )}
    </div>
  );
};

export default OrgPage;
