import React from "react";
import { useParams, Link } from "react-router-dom";

const CoursePlayer = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <div className="absolute top-8 left-8">
        <Link to="/junior" className="text-gray-400 hover:text-white font-bold">
          ← Exit Quest
        </Link>
      </div>
      <div className="text-6xl mb-8">🎮</div>
      <h1 className="text-4xl font-bold mb-4">Playing Course: {id}</h1>
      <p className="text-xl text-gray-400 max-w-xl text-center">
        This is where the interactive lesson or game would load. Get ready for
        an adventure!
      </p>
      <div className="mt-12 w-full max-w-3xl aspect-video bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
        <span className="text-gray-600 font-mono">
          Course Content Placeholder
        </span>
      </div>
    </div>
  );
};

export default CoursePlayer;
