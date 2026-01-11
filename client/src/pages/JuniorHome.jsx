import React from "react";
import { Link } from "react-router-dom";

const JuniorHome = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-yellow-200">
      {/* Header */}
      <nav className="border-b border-dashed border-gray-200 px-4 py-3 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500">
              {/* Graduation Cap Icon */}
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-gray-800 tracking-tight">
              Junior<span className="text-orange-500">Learn</span>
            </span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Find a fun topic..."
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-orange-300 outline-none transition-all"
            />
            <svg
              className="w-4 h-4 absolute left-3.5 top-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>

          <div className="flex items-center gap-4 font-bold text-sm">
            <a href="#" className="hidden hover:text-orange-500 md:block">
              My Classes
            </a>
            <a href="#" className="hidden hover:text-orange-500 md:block">
              Trophies
            </a>
            <Link
              to="/login"
              className="px-5 py-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-transform hover:scale-105 shadow-md shadow-orange-200"
            >
              Join for Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
          <div className="flex-1 space-y-6">
            <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-600 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              🚀 Blast Off!
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-dark leading-tight">
              Ready to learn, <br />
              <span className="text-orange-500">Junior Explorer?</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-lg">
              Pick a subject below and start your magical learning adventure
              today!
            </p>
            <button className="px-8 py-4 bg-cyan-400 text-white rounded-full font-bold text-xl shadow-lg shadow-cyan-200 hover:bg-cyan-500 hover:scale-105 transition-all flex items-center gap-2">
              Let's Go!
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                ></path>
              </svg>
            </button>
          </div>

          <div className="flex-1 relative">
            <div className="aspect-video bg-amber-200 rounded-[2rem] overflow-hidden shadow-2xl relative transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="absolute inset-0 bg-yellow-100/50"></div>
              {/* Simulated Image Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-yellow-400 rounded-full opacity-50 blur-2xl"></div>
                <div className="text-center">
                  <div className="text-6xl mb-2">⛺️🔬</div>
                  <div className="font-bold text-yellow-800 text-lg bg-white/80 px-4 py-1 rounded-full backdrop-blur-sm">
                    Summer Science Camp
                  </div>
                </div>
              </div>
              <div className="absolute top-4 left-4 bg-red-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                FEATURED ADVENTURE
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          <div className="bg-orange-50 rounded-3xl p-6 text-center border-b-4 border-orange-200 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-2xl">
              🔥
            </div>
            <div className="text-3xl font-black text-gray-800 mb-1">5 Days</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Learning Streak
            </div>
          </div>
          <div className="bg-yellow-50 rounded-3xl p-6 text-center border-b-4 border-yellow-200 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-2xl">
              ⭐
            </div>
            <div className="text-3xl font-black text-gray-800 mb-1">120</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Super Stars
            </div>
          </div>
          <div className="bg-purple-50 rounded-3xl p-6 text-center border-b-4 border-purple-200 hover:-translate-y-1 transition-transform">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-2xl">
              🏆
            </div>
            <div className="text-3xl font-black text-gray-800 mb-1">8</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Cool Badges
            </div>
          </div>
        </div>

        {/* Explore Title */}
        <div className="mb-8">
          <h2 className="flex items-center gap-3 text-3xl font-black text-dark mb-2">
            <span className="text-emerald-500">🪐</span> Explore Worlds
          </h2>
          <p className="text-gray-500">What do you want to discover today?</p>
        </div>

        {/* Categories */}
        <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide">
          {[
            "All Fun Stuff",
            "Math Puzzles",
            "Science Lab",
            "Art Studio",
            "Game Coding",
          ].map((cat, i) => (
            <button
              key={i}
              className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all ${
                i === 0
                  ? "bg-slate-800 text-white shadow-lg"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {i === 1 && "🔢 "} {i === 2 && "🧪 "} {i === 3 && "🎨 "}{" "}
              {i === 4 && "🎮 "}
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <CourseCard
            title="Math Mystery"
            desc="Master numbers by solving ancient puzzles and riddles!"
            color="cyan"
            icon="🔢"
            tag="Grade 3-5"
            bg="bg-cyan-50"
            btnColor="bg-cyan-400"
          />
          {/* Card 2 */}
          <CourseCard
            title="Science Lab"
            desc="Cool experiments with slime, volcanoes, and magnets."
            color="emerald"
            icon="🧪"
            tag="Grade 4-6"
            bg="bg-emerald-50"
            btnColor="bg-emerald-400"
          />
          {/* Card 3 */}
          <CourseCard
            title="Coding Tycoon"
            desc="Build your very first video game using lego-style code."
            color="purple"
            icon="💻"
            tag="Grade 5+"
            bg="bg-purple-50"
            btnColor="bg-purple-600"
          />
          {/* Card 4 */}
          <CourseCard
            title="Art Adventure"
            desc="Discover colors, shapes, and famous artists from around the world."
            color="red"
            icon="🎨"
            tag="All Ages"
            bg="bg-red-50"
            btnColor="bg-red-400"
          />
          {/* Card 5 */}
          <CourseCard
            title="World Traveler"
            desc="Travel the world from your chair! Learn about cool countries."
            color="teal"
            icon="🌍"
            tag="Grade 4-5"
            bg="bg-teal-50"
            btnColor="bg-teal-400"
          />
          {/* Card 6 */}
          <CourseCard
            title="Music Master"
            desc="Understand rhythm, melody, and how to read basic sheet music."
            color="gray"
            icon="🎸"
            tag="Super Pro"
            bg="bg-gray-700"
            btnColor="bg-gray-200"
            dark={true}
            locked={true}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-dashed border-gray-200 bg-white/50 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-500">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
            </svg>
          </div>
          <span className="text-xl font-black text-gray-800">
            Junior<span className="text-orange-500">Learn</span>
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-6">
          Empowering the next generation of explorers.
        </p>
        <div className="flex justify-center gap-6 text-xs font-bold text-gray-500">
          <a href="#" className="hover:text-orange-500">
            Help Center
          </a>
          <a href="#" className="hover:text-orange-500">
            Safety
          </a>
          <a href="#" className="hover:text-orange-500">
            Parents
          </a>
        </div>
      </footer>
    </div>
  );
};

const CourseCard = ({ title, desc, tag, bg, btnColor, dark, locked }) => (
  <div
    className={`rounded-3xl p-1 pb-6 overflow-hidden hover:-translate-y-2 transition-all duration-300 shadow-xl shadow-gray-100 ${
      dark ? "text-white" : "bg-white"
    }`}
  >
    <div
      className={`h-48 ${bg} rounded-t-[1.3rem] rounded-b-md relative mb-4 overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      <div className="absolute top-4 left-4 bg-white text-gray-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
        {tag}
      </div>
      {/* Placeholder Art */}
      <div className="w-full h-full flex items-center justify-center opacity-30 group-hover:scale-110 transition-transform duration-500">
        <div
          className={`w-32 h-32 rounded-full ${
            dark ? "bg-white" : "bg-current"
          } opacity-20`}
        ></div>
      </div>

      {locked && (
        <div className="absolute top-4 right-4 text-white/80 flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          Super Pro
        </div>
      )}
    </div>

    <div className={`px-6 ${dark ? "bg-gray-800" : ""}`}>
      <h3
        className={`text-2xl font-black mb-2 ${
          dark ? "text-white" : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-sm mb-6 leading-relaxed ${
          dark ? "text-gray-400" : "text-gray-500"
        }`}
      >
        {desc}
      </p>

      {locked ? (
        <button className="w-full py-3 bg-gray-200 text-gray-500 rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
          Unlock Now{" "}
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <button
          className={`w-full py-3 ${btnColor} text-white rounded-full font-bold text-sm shadow-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
        >
          Start Quest{" "}
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  </div>
);

export default JuniorHome;
