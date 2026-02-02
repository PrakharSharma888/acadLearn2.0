import React from "react";
import { Link } from "react-router-dom";

const JuniorTrophies = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans p-8">
      <Link
        to="/junior"
        className="inline-block mb-8 text-orange-500 font-bold hover:underline"
      >
        ← Back to Junior Home
      </Link>
      <h1 className="text-4xl font-black text-gray-800 mb-4">My Trophies</h1>
      <p className="text-xl text-gray-600">
        Look at all the shiny awards you've earned!
      </p>
      {/* Placeholder content */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="aspect-square bg-yellow-100 rounded-full flex items-center justify-center text-6xl shadow-lg border-4 border-yellow-200 opacity-50 grayscale">
          🏆
        </div>
        <div className="aspect-square bg-blue-100 rounded-full flex items-center justify-center text-6xl shadow-lg border-4 border-blue-200 opacity-50 grayscale">
          🚀
        </div>
        <div className="aspect-square bg-green-100 rounded-full flex items-center justify-center text-6xl shadow-lg border-4 border-green-200 opacity-50 grayscale">
          🌟
        </div>
        <div className="aspect-square bg-purple-100 rounded-full flex items-center justify-center text-6xl shadow-lg border-4 border-purple-200 opacity-50 grayscale">
          🎓
        </div>
      </div>
    </div>
  );
};

export default JuniorTrophies;
