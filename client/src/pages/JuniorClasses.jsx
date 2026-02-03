import React from "react";
import { Link } from "react-router-dom";
import JuniorNavbar from "../components/JuniorNavbar";

const JuniorClasses = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      <JuniorNavbar />
      <main className="container mx-auto px-4 py-10">
        <Link
          to="/junior"
          className="inline-block mb-6 text-orange-500 font-bold hover:underline"
        >
          ← Back to Junior Home
        </Link>
        <h1 className="text-4xl font-black text-gray-800 mb-3">My Classes</h1>
        <p className="text-lg md:text-xl text-gray-600">
          Here are the classes you are currently enrolled in. Keep learning!
        </p>
        {/* Placeholder content */}
        <div className="mt-10 p-10 bg-white rounded-3xl border-4 border-dashed border-gray-200 text-center text-gray-400 font-bold">
          No active classes yet. Go explore worlds!
        </div>
      </main>
    </div>
  );
};

export default JuniorClasses;
