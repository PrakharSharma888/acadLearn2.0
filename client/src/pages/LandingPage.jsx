import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import LandingJuniorImg from "../assets/landing-junior.png";
import LandingProfessionalImg from "../assets/landing-professional.png";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-dark selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="container mx-auto px-4 py-16 md:py-24">
        {/* Header Section */}
        <div className="text-center mb-16 md:mb-24">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Where would you like to <br />
            <span className="text-blue-500">start learning</span> today?
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Choose your dedicated path. Whether you're advancing your career or
            just starting your journey, we have the right tools for you.
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Professionals Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <div className="h-64 bg-gray-200 relative overflow-hidden group">
              <img
                src={LandingProfessionalImg}
                alt="Professional Learning"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              <div className="absolute bottom-6 left-6 w-16 h-16 bg-blue-100/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-blue-600 shadow-lg z-20">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="p-8 md:p-10 flex-1 flex flex-col">
              <h2 className="text-3xl font-bold mb-4">For Professionals</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Upskill, certify, and advance your career with industry-standard
                courses designed for working adults.
              </p>

              <ul className="space-y-4 mb-10 flex-1">
                {[
                  "Certification Programs",
                  "Career Networking",
                  "Flexible Schedules",
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center text-gray-700 font-medium"
                  >
                    <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3 shadow-sm">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/professional"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center group"
              >
                Enter Professional Hub
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Juniors Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col">
            <div className="h-64 bg-emerald-50 relative overflow-hidden group">
              <img
                src={LandingJuniorImg}
                alt="Junior Learning"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

              <div className="absolute bottom-6 left-6 w-16 h-16 bg-emerald-100/90 backdrop-blur-sm rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg z-20">
                <svg
                  className="w-9 h-9"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
                </svg>
              </div>
            </div>

            <div className="p-8 md:p-10 flex-1 flex flex-col">
              <h2 className="text-3xl font-bold mb-4">For Juniors</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Fun, interactive lessons, games and quizzes for school students
                from grades K-12 to spark curiosity.
              </p>

              <ul className="space-y-4 mb-10 flex-1">
                {["Gamified Learning", "Homework Help", "Parent Dashboard"].map(
                  (item, i) => (
                    <li
                      key={i}
                      className="flex items-center text-gray-700 font-medium"
                    >
                      <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white mr-3 shadow-sm">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </span>
                      {item}
                    </li>
                  ),
                )}
              </ul>

              <Link
                to="/junior"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center group"
              >
                Enter Junior Zone
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-10 mt-10 border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center gap-8 mb-6 text-sm font-semibold text-gray-600">
            <Link to="/about" className="hover:text-blue-600">
              About Us
            </Link>
            <Link to="/contact" className="hover:text-blue-600">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-blue-600">
              Terms of Service
            </Link>
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 AcadLearn. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
