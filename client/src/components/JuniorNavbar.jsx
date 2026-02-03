import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../assets/logo.jpeg";

const JuniorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBookDemo = () => {
    navigate("/book-demo");
  };

  return (
    <nav className="border-b border-dashed border-gray-200 px-4 py-3 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-6">
        {/* Left: Logo + Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border border-orange-100">
            <img
              src={Logo}
              alt="AcadLearn Junior Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-2xl font-black text-gray-800 tracking-tight">
            Acad<span className="text-orange-500">Learn Jr.</span>
          </span>
        </Link>

        {/* Center: Junior navigation */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center text-sm font-bold">
          <Link
            to="/about"
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            About Us
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const scrollToCourses = () => {
                const el = document.getElementById("junior-courses-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              };

              if (location.pathname === "/junior") {
                scrollToCourses();
              } else {
                navigate("/junior");
                // Give React Router a moment to render then scroll
                setTimeout(scrollToCourses, 300);
              }
            }}
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            Our Courses
          </button>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            Contact Us
          </Link>
          <Link
            to="/junior/classes"
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            My Classes
          </Link>
          <Link
            to="/junior/trophies"
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            Trophies
          </Link>
        </div>

        {/* Right: Auth + primary CTA for Junior */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-orange-100 rounded-full hover:bg-orange-50 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="hidden sm:inline-flex px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-orange-500 rounded-full hover:bg-orange-600 shadow-sm transition-colors"
          >
            Register
          </Link>
          <button
            onClick={handleBookDemo}
            className="px-4 sm:px-6 py-2 text-xs sm:text-sm bg-[#111827] text-white font-bold rounded-full shadow-md shadow-orange-200 hover:bg-black hover:scale-105 transition-transform"
          >
            Book a Demo for ₹9
          </button>
        </div>
      </div>
    </nav>
  );
};

export default JuniorNavbar;


