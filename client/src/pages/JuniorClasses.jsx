import React from "react";
import { Link } from "react-router-dom";

const JuniorClasses = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans p-8">
      <Link
        to="/junior"
        className="inline-block mb-8 text-orange-500 font-bold hover:underline"
      >
        ← Back to Junior Home
      </Link>
      <h1 className="text-4xl font-black text-gray-800 mb-4">My Classes</h1>
      <p className="text-xl text-gray-600">
        Here are the classes you are currently enrolled in. Keep learning!
      </p>
      {/* Placeholder content */}
      <div className="mt-12 p-12 bg-white rounded-3xl border-4 border-dashed border-gray-200 text-center text-gray-400 font-bold">
        No active classes yet. Go explore worlds!
      </div>
    </div>
  );
};

export default JuniorClasses;
