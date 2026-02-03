import React from "react";
import JuniorNavbar from "../components/JuniorNavbar";
import AboutImage from "../assets/about-us.jpeg";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      <JuniorNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 items-center mb-10 lg:mb-0">

          {/* IMAGE — first on mobile, right on desktop */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md h-64 sm:h-72 md:h-80 lg:h-full rounded-2xl overflow-hidden border-2 border-orange-200 bg-orange-50 shadow-sm">
              <img
                src={AboutImage}
                alt="AcadLearn Jr students learning"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* CONTENT — second on mobile, left on desktop */}
          <div className="order-2 lg:order-1 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
              About AcadLearn Jr
            </h1>

            <p className="inline-block px-4 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-4">
              Helping students do better in school and life
            </p>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-4 leading-relaxed">
              At AcadLearn Jr, we want every student to feel confident. While
              school is important, the world is changing fast. We help students
              from Classes 3 to 12 learn skills that support their daily studies
              and future goals.
            </p>

            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
              Our focus is on your child’s growth. We don't just teach technology;
              we teach students how to think clearly and solve difficult problems.
              These skills help them understand school subjects like Math and
              Science much better. With us, your child becomes a stronger student,
              stays curious, and feels ready for whatever comes next.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default About;
