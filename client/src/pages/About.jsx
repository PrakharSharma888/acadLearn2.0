import React from "react";
import JuniorNavbar from "../components/JuniorNavbar";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      <JuniorNavbar />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
            About AcadLearn Jr
          </h1>
          <p className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-4">
            Helping students do better in school and life
          </p>
          <p className="text-lg md:text-xl text-gray-700 mb-4 leading-relaxed">
            At AcadLearn Jr, we want every student to feel confident. While
            school is important, the world is changing fast. We help students
            from Classes 3 to 12 learn skills that support their daily studies
            and future goals.
          </p>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Our focus is on your child’s growth. We don't just teach technology;
            we teach students how to think clearly and solve difficult problems.
            These skills help them understand school subjects like Math and
            Science much better. With us, your child becomes a stronger student,
            stays curious, and feels ready for whatever comes next.
          </p>
        </div>
      </main>
    </div>
  );
};

export default About;
