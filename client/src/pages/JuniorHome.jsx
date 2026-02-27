import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_BASE from "../config/api";
import JuniorHeroImg from "../assets/junior-hero.png";
import Logo from "../assets/logo.jpeg";
import JuniorNavbar from "../components/JuniorNavbar";
import BannerCarousel from "../components/BannerCarousel";
import BookDemoModal from "../components/BookDemoModal";

const JuniorHome = () => {
  const navigate = useNavigate();
  const [banners, setBanners]       = useState([]);
  const [bannerDemo, setBannerDemo] = useState(null);
  const [courseDemo, setCourseDemo] = useState(null);
  const [user, setUser]             = useState(null);
  const [courses, setCourses]       = useState([]);
  const [noDemoMsg, setNoDemoMsg]   = useState({});

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/banners?page=junior`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setBanners(data))
      .catch(() => {});
  }, []);

  // Load junior courses from DB — each has its own nextDemoSession
  const loadCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/classes?category=junior`);
      if (res.ok) {
        const all = await res.json();
        setCourses(all.filter((c) => c.isActive));
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  // Banner click: if banner has a linked class, open BookDemoModal with pre-filled info
  const handleBannerClick = (banner) => {
    if (banner.classId) {
      setBannerDemo({
        _id:               banner.classId,
        title:             banner.className || banner.title,
        category:          banner.category || "junior",
        classSlug:         banner.classSlug,
        department:        banner.department,
        universityId:      banner.universityId      || "",
        universityName:    banner.universityName    || "",
        targetDepartments: banner.targetDepartments || [],
      });
    } else if (banner.link) {
      window.open(banner.link, "_blank", "noopener,noreferrer");
    }
    // else: no action for banners without classId or link
  };

  const handleBookDemo = () => {
    const el = document.getElementById("junior-courses-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Set of courseIds whose booking is locked to banner-only
  const lockedCourseIds = new Set(
    banners
      .filter((b) => b.classId && b.universityId && b.allowPublicBooking === false)
      .map((b) => b.classId)
  );

  const handleCourseBookDemo = (course) => {
    if (lockedCourseIds.has(course._id)) return; // should not happen (button disabled)
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

  const handleWatchVideo = () => {
    alert("Play video: How we teach (Coming Soon)");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      {/* Header / Navbar - shared across all Junior pages */}
      <JuniorNavbar />

      <main>

        {/* Section 1: The Hero Section (The Hook) */}
        <section className="container mx-auto px-4 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h1 className="text-5xl md:text-7xl font-black leading-tight text-slate-900">
              Where Curiosity Meets the{" "}
              <span className="text-orange-500">Skills of Tomorrow</span>.
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-lg">
              We help kids from Grades 1 to 10 master logic, math, and digital
              creativity through fun, live classes. Turn their "Screen Time"
              into "Learning Time."
            </p>

            <div className="flex flex-wrap gap-6 text-sm font-bold text-gray-700">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <span className="text-2xl">🏠</span> Learn from Home
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <span className="text-2xl">👨‍🏫</span> Friendly Mentors
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                <span className="text-2xl">🎮</span> Play-Based Learning
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleBookDemo}
                className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg shadow-lg shadow-orange-200 hover:bg-orange-600 hover:scale-105 transition-all"
              >
                Book a Free Demo Class
              </button>
              <button
                onClick={handleWatchVideo}
                className="px-8 py-4 bg-white text-orange-500 border-2 border-orange-100 rounded-full font-bold text-lg hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
              >
                <span>▶</span> Watch how we teach
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="aspect-square md:aspect-[4/3] bg-orange-100 rounded-[3rem] relative overflow-hidden transform rotate-2 hover:rotate-0 transition-all duration-500">
              <img
                src={JuniorHeroImg}
                alt="Happy kid learning"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent"></div>
            </div>
          </div>
        </section>

        {/* Section 2: The "Why" Section */}
        <section className="bg-white py-20 border-y border-dashed border-gray-200">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block px-4 py-1 bg-cyan-100 text-cyan-700 font-bold rounded-full mb-4 text-sm uppercase tracking-wide">
              The Goal
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-16">
              From a "Device User" to a{" "}
              <span className="text-cyan-500">"Digital Creator."</span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-red-50 p-8 rounded-3xl border-b-4 border-red-200 text-left">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-black text-red-900 mb-2">
                  The Problem
                </h3>
                <p className="text-red-800/80 font-medium">
                  Most kids use tablets just to watch videos or play games
                  passively.
                </p>
              </div>

              <div className="bg-cyan-50 p-8 rounded-3xl border-b-4 border-cyan-200 text-left transform md:-translate-y-4 shadow-xl">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-black text-cyan-900 mb-2">
                  Our Solution
                </h3>
                <p className="text-cyan-800/80 font-medium">
                  We teach them the logic behind the games. Whether they want to
                  be a scientist, artist, or engineer, we provide the
                  foundation.
                </p>
              </div>

              <div className="bg-green-50 p-8 rounded-3xl border-b-4 border-green-200 text-left">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-xl font-black text-green-900 mb-2">
                  The Result
                </h3>
                <p className="text-green-800/80 font-medium">
                  Better school grades, higher confidence, and a "Can-Do"
                  attitude toward problem solving.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Banners */}
        {banners.length > 0 && <BannerCarousel banners={banners} onBannerClick={handleBannerClick} />}

        {/* Section 3: Our Courses (Junior paths) */}
        <section
          id="junior-courses-section"
          className="py-20 container mx-auto px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-3">
              Our Courses
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Pick your path to a brighter future!
            </p>
          </div>

          {courses.length === 0 ? (
            <p className="text-center text-gray-400 py-12 text-lg">Courses coming soon — stay tuned!</p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course._id} className="bg-white rounded-[2.5rem] overflow-hidden border border-orange-100 shadow-sm flex flex-col">
                  <div className={`h-40 w-full flex items-center justify-center text-5xl ${course.color || "bg-orange-400"}`}>
                    {course.badge || "📚"}
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <p className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2">
                      {course.level}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{course.title}</h3>
                    {course.subtitle && (
                      <p className="text-sm font-medium text-orange-500 mb-2">{course.subtitle}</p>
                    )}
                    <p className="text-sm text-gray-600 mb-4 flex-1 line-clamp-3">{course.description}</p>
                    <ul className="space-y-1 text-sm text-gray-700 mb-4">
                      {course.instructor && (
                        <li><span className="font-semibold">Instructor:</span> {course.instructor}</li>
                      )}
                      {course.duration && (
                        <li><span className="font-semibold">Duration:</span> {course.duration}</li>
                      )}
                      {course.nextDemoSession && (
                        <li className="text-orange-600 font-semibold">
                          Next Demo: {new Date(course.nextDemoSession.date + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          {" "}&middot; {(() => { const [h,m] = course.nextDemoSession.time.split(":").map(Number); const s = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${String(m).padStart(2,"0")} ${s}`; })()}
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
                          className={`mt-2 inline-flex justify-center rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                            course.nextDemoSession
                              ? "bg-orange-500 text-white shadow-md hover:bg-orange-600 hover:shadow-lg"
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

        {/* Section 4: The Learning Tracks */}
        <section className="py-20 container mx-auto px-4">
          <h2 className="text-4xl font-black text-center mb-16 text-slate-900">
            Learning Tracks for Every Age
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Track 1 */}
            <div className="bg-yellow-50 rounded-[2.5rem] p-8 border border-yellow-100 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 bg-yellow-400 text-white font-black px-6 py-2 rounded-bl-2xl">
                Grades 1 - 3
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 mt-4">
                Young Explorers
              </h3>
              <div className="text-yellow-600 font-bold mb-6 uppercase tracking-wider text-xs">
                Logic & Curiosity
              </div>
              <p className="text-gray-600 mb-8 font-medium">
                Building patterns, basic math puzzles, and "how things work"
                stories.
              </p>
              <div className="bg-white rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-2xl">🧩</span>{" "}
                <span className="font-bold text-sm text-gray-700">
                  Pattern Recognition
                </span>
              </div>
            </div>

            {/* Track 2 */}
            <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 relative overflow-hidden group hover:shadow-xl transition-all transform lg:-translate-y-4">
              <div className="absolute top-0 right-0 bg-orange-500 text-white font-black px-6 py-2 rounded-bl-2xl">
                Grades 4 - 6
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 mt-4">
                Active Creators
              </h3>
              <div className="text-orange-600 font-bold mb-6 uppercase tracking-wider text-xs">
                Digital Foundations
              </div>
              <p className="text-gray-600 mb-8 font-medium">
                Creating simple animations, smart math tricks, and safe internet
                habits.
              </p>
              <div className="bg-white rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-2xl">🎨</span>{" "}
                <span className="font-bold text-sm text-gray-700">
                  Creative Coding
                </span>
              </div>
            </div>

            {/* Track 3 */}
            <div className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100 relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute top-0 right-0 bg-orange-500 text-white font-black px-6 py-2 rounded-bl-2xl">
                Grades 7 - 10
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2 mt-4">
                Future Leaders
              </h3>
              <div className="text-orange-600 font-bold mb-6 uppercase tracking-wider text-xs">
                Problem Solvers
              </div>
              <p className="text-gray-600 mb-8 font-medium">
                Real-world projects, introduction to how AI helps us, and
                advanced logic.
              </p>
              <div className="bg-white rounded-2xl p-4 flex gap-3 items-center">
                <span className="text-2xl">🤖</span>{" "}
                <span className="font-bold text-sm text-gray-700">
                  AI & Logic
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Secret Sauce */}
        <section className="bg-[#1e293b] py-20 text-white rounded-[3rem] mx-4 my-8">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-2 block">
                The AcadLearn Junior Edge
              </span>
              <h2 className="text-4xl font-black">Our Secret Sauce</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  👥
                </div>
                <h4 className="font-bold text-lg mb-2">Two-Teacher Support</h4>
                <p className="text-slate-400 text-sm">
                  One teacher explains, one mentor answers every single doubt
                  instantly.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  ⭐
                </div>
                <h4 className="font-bold text-lg mb-2">Reward Points</h4>
                <p className="text-slate-400 text-sm">
                  Kids earn "Acad-Stars" for every homework finished and quiz
                  won.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  📊
                </div>
                <h4 className="font-bold text-lg mb-2">Weekly Progress</h4>
                <p className="text-slate-400 text-sm">
                  Simple WhatsApp update for parents: "Here is what your child
                  built!"
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                  🆘
                </div>
                <h4 className="font-bold text-lg mb-2">Homework Help</h4>
                <p className="text-slate-400 text-sm">
                  Stuck on school math? Our mentors are available to help.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Project Gallery */}
        <section className="py-20 overflow-hidden">
          <div className="container mx-auto px-4 mb-12 flex justify-between items-end">
            <h2 className="text-4xl font-black text-slate-900 max-w-lg">
              See What Our Little Stars are{" "}
              <span className="text-orange-500">Building!</span>
            </h2>
            <div className="hidden md:flex gap-2">
              <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                ←
              </button>
              <button className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600">
                →
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 px-4 pl-4 md:pl-[calc((100vw-1280px)/2)] scrollbar-hide">
            <div className="min-w-[300px] md:min-w-[400px] bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
              <div className="aspect-video bg-gray-100 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  📱
                </div>
              </div>
              <h3 className="font-black text-xl mb-1">Calculator App</h3>
              <p className="text-gray-500 mb-4">
                Made by Rahul (Grade 4) for his Mom
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full">
                  Coding
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full">
                  Logic
                </span>
              </div>
            </div>

            <div className="min-w-[300px] md:min-w-[400px] bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
              <div className="aspect-video bg-gray-100 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🎬
                </div>
              </div>
              <h3 className="font-black text-xl mb-1">Story Animation</h3>
              <p className="text-gray-500 mb-4">Built by Priya (Grade 7)</p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-pink-50 text-pink-600 text-xs font-bold rounded-full">
                  Creativity
                </span>
                <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-xs font-bold rounded-full">
                  Storytelling
                </span>
              </div>
            </div>

            <div className="min-w-[300px] md:min-w-[400px] bg-white rounded-3xl p-6 border border-gray-100 shadow-lg">
              <div className="aspect-video bg-gray-100 rounded-2xl mb-6 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl">
                  🧩
                </div>
              </div>
              <h3 className="font-black text-xl mb-1">50 Logic Puzzles</h3>
              <p className="text-gray-500 mb-4">
                Solved by Aman (Grade 2) in one week!
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">
                  Math
                </span>
                <span className="px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full">
                  IQ
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: Trust Section */}
        <section className="bg-orange-50 py-24">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h2 className="text-3xl font-black mb-16 text-slate-900">
              Trusted by 50,000+ Happy Parents
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl shadow-sm text-left relative">
                <div className="text-6xl text-orange-200 absolute top-4 left-4">
                  "
                </div>
                <p className="text-gray-700 italic mb-6 relative z-10 pt-4">
                  "My son used to be addicted to YouTube. Now he spends his time
                  trying to build his own small games on AcadLearn. His math
                  marks have also improved!"
                </p>
                <div className="font-bold text-slate-900">
                  — Anjali, Parent of Grade 5
                </div>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm text-left relative">
                <div className="text-6xl text-orange-200 absolute top-4 left-4">
                  "
                </div>
                <p className="text-gray-700 italic mb-6 relative z-10 pt-4">
                  "The teachers are so patient. They don't just teach coding;
                  they teach my daughter how to think."
                </p>
                <div className="font-bold text-slate-900">
                  — Vikram, Parent of Grade 3
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Final Footer */}
        <section className="py-20 bg-slate-900 text-center text-white">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Give your child the AcadLearn Edge.
            </h2>
            <p className="text-xl text-slate-400 mb-10">
              Join 1,000+ kids attending our Free Workshop this Sunday.
            </p>
            <button
              onClick={handleBookDemo}
              className="px-10 py-5 bg-orange-500 text-white rounded-full font-bold text-xl shadow-lg shadow-orange-900/50 hover:bg-orange-600 hover:scale-105 transition-all mb-12"
            >
              Reserve My Free Spot Now
            </button>

            <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-sm font-bold text-slate-500 border-t border-slate-800 pt-12">
              <Link to="/about" className="hover:text-white transition-colors">
                About Us
              </Link>
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Safety for Kids
              </Link>
              <Link
                to="/contact"
                className="hover:text-white transition-colors"
              >
                Parent Dashboard
              </Link>
              <Link
                to="/contact"
                className="hover:text-white transition-colors"
              >
                Contact Support
              </Link>
            </div>
            <div className="mt-8 text-xs text-slate-700">
              © 2026 AcadLearn Junior. All rights reserved.
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

export default JuniorHome;
