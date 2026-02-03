import React from "react";
import { useParams, Link } from "react-router-dom";
import JuniorNavbar from "../components/JuniorNavbar";

const CoursePlayer = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      <JuniorNavbar />
      <main className="container mx-auto px-4 py-10">
        <Link
          to="/junior"
          className="inline-block mb-6 text-orange-500 font-bold hover:underline"
        >
          ← Exit Quest
        </Link>
        <div className="flex flex-col items-center text-center">
          <div className="text-6xl mb-6">🎮</div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            Playing Course: {id}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-8">
            This is where the interactive lesson or game would load. Get ready
            for an adventure!
          </p>
          <div className="mt-4 w-full max-w-3xl aspect-video bg-slate-900 rounded-3xl flex items-center justify-center border-4 border-slate-800 shadow-xl">
            <span className="text-slate-400 font-mono text-sm md:text-base">
              Course Content Placeholder
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CoursePlayer;
