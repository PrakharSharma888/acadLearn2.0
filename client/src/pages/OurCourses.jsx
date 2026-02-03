import React from "react";
import JuniorNavbar from "../components/JuniorNavbar";

const OurCourses = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      <JuniorNavbar />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Our Courses
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl">
            At AcadLearn Jr, we design learning experiences that are practical,
            fun, and deeply connected to the real world. Whether your child is
            just starting to explore or preparing for bigger challenges, we have
            a learning path ready.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-orange-100">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                Junior Explorer Program
              </h2>
              <p className="text-sm md:text-base text-gray-700 mb-4">
                Perfect for school-going children who are curious but feel
                overwhelmed by regular homework and exams.
              </p>
              <ul className="space-y-2 text-sm md:text-base text-gray-700 list-disc pl-5">
                <li>Concept-first lessons that make school subjects feel easy</li>
                <li>Interactive activities, quizzes, and real-life examples</li>
                <li>Weekly progress updates for parents</li>
              </ul>
            </div>

            <div className="p-6 md:p-8 bg-white rounded-3xl shadow-sm border border-orange-100">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">
                Future Skills Foundation
              </h2>
              <p className="text-sm md:text-base text-gray-700 mb-4">
                For students who want to go beyond textbooks and build skills
                that actually matter in the real world.
              </p>
              <ul className="space-y-2 text-sm md:text-base text-gray-700 list-disc pl-5">
                <li>Problem-solving and logical thinking exercises</li>
                <li>Project-based learning with everyday scenarios</li>
                <li>Guided practice to build confidence and independence</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OurCourses;


