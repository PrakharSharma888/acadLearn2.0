import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ProHeroImg from "../assets/pro-hero.png";
import Logo from "../assets/logo.jpeg";
import Pro4 from "../assets/pro4.png";
import Pro5 from "../assets/pro5.png";
import Pro6 from "../assets/pro6.png";
import API_BASE from "../config/api";
import BannerCarousel from "../components/BannerCarousel";
import BookDemoModal from "../components/BookDemoModal";

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
  const [courses, setCourses]       = useState([]);
  const [banners, setBanners]       = useState([]);
  const [bannerDemo, setBannerDemo] = useState(null);
  const [courseDemo, setCourseDemo] = useState(null);
  const [noDemoMsg, setNoDemoMsg]   = useState({});  // courseId → true/false
  const [user, setUser]             = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  const handleEnroll = () => navigate("/login");

  const handleBannerClick = (banner) => {
    if (banner.classId) {
      setBannerDemo({
        _id:               banner.classId,
        title:             banner.className || banner.title,
        category:          banner.category || "professional",
        classSlug:         banner.classSlug,
        department:        banner.department,
        universityName:    banner.universityName    || "",
        targetDepartments: banner.targetDepartments || [],
      });
    } else if (banner.link) {
      window.open(banner.link, "_blank", "noopener,noreferrer");
    }
    // else: no action for banners without classId or link
  };

  const handleCourseBookDemo = (course) => {
    if (!course.nextDemoSession) {
      setNoDemoMsg((prev) => ({ ...prev, [course._id]: true }));
      setTimeout(() => setNoDemoMsg((prev) => ({ ...prev, [course._id]: false })), 3000);
      return;
    }
    if (!user) { navigate("/login"); return; }
    setCourseDemo(course);
  };

  const loadData = useCallback(async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        fetch(`${API_BASE}/api/classes`),
        fetch(`${API_BASE}/api/banners?page=professional`),
      ]);
      if (cRes.ok) {
        const all = await cRes.json();
        setCourses(all.filter((c) => c.category === "professional" && c.isActive));
      }
      if (bRes.ok) setBanners(await bRes.json());
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

        {/* Section 2: The "Why" */}
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
                          {" "}&middot; {(() => { const [h,m] = course.nextDemoSession.time.split(":").map(Number); const s = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${String(m).padStart(2,"0")} ${s}`; })()}
                        </li>
                      )}
                    </ul>
                    <button
                      onClick={() => handleCourseBookDemo(course)}
                      className={`mt-2 inline-flex justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                        course.nextDemoSession
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
    </div>
  );
};

export default ProfessionalHome;
