import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import junior_logo from "../assets/junior_logo.png";
import junior_logo_mob from "../assets/acad_learn _symbol.png";

const JuniorNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);

  const handleBookDemo = () => {
    navigate("/book-demo");
  };

  return (
    <nav className="border-b border-dashed border-gray-200 px-4 py-3 bg-white/70 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
        {/* Left: Logo + Brand */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Logo */}
          <div className="w-9 h-9 sm:w-10 sm:h-10 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={junior_logo_mob}
              alt="AcadLearn Junior Logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Text */}
          <span className="text-lg sm:text-2xl font-black text-gray-800 tracking-tight leading-none whitespace-nowrap max-[420px]:whitespace-normal">
            Acad
            <span className="text-orange-500">Learn Jr.</span>
          </span>
        </Link>


        {/* Center: Junior navigation */}
        <div className="hidden lg:flex items-center gap-6 flex-1 justify-center text-sm font-bold">
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
          {/* <Link
            to="/junior/classes"
            className="text-gray-700 hover:text-orange-500 transition-colors"
          >
            My Classes
          </Link> */}
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
            Book a Demo
          </button>
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-200 shadow-md">
          <div className="flex flex-col gap-4 px-6 py-4 text-sm font-bold">
            <Link to="/about" onClick={() => setOpen(false)}>
              About Us
            </Link>

            <Link
            >
              Our Courses
            </Link>

            <Link to="/contact" onClick={() => setOpen(false)}>
              Contact Us
            </Link>

            <Link to="/junior/trophies" onClick={() => setOpen(false)}>
              Trophies
            </Link>
          </div>
        </div>
      )}

    </nav>

  );
};

export default JuniorNavbar;


