import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProHeroImg from "../assets/pro-hero.png";
import Pro1 from "../assets/pro1.png";
import Pro2 from "../assets/pro2.png";
import Pro3 from "../assets/pro3.png";
import Pro4 from "../assets/pro4.png";
import Pro5 from "../assets/pro5.png";
import Pro6 from "../assets/pro6.png";
import Logo from "../assets/logo.jpeg";

const ProfessionalHome = () => {
  const [activeCategory, setActiveCategory] = useState("All Courses");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      console.log("Searching...");
    }
  };

  const handleNavClick = (sectionId, e) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEnroll = (title) => {
    navigate(`/checkout/${title.toLowerCase().replace(/\s+/g, "-")}`);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    console.log("Filter by:", cat);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Header */}
      <nav className="bg-white border-b border-gray-100 py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center">
              <img
                src={Logo}
                alt="AcadLearn Pro Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight">
              AcadLearn <span className="text-blue-600">Pro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a
              href="#"
              onClick={(e) => handleNavClick("courses-section", e)}
              className="hover:text-blue-600"
            >
              Browse Courses
            </a>
            <a
              href="#"
              onClick={(e) => handleNavClick("pricing", e)}
              className="hover:text-blue-600"
            >
              Pricing
            </a>
            <a
              href="#"
              onClick={(e) => handleNavClick("teams", e)}
              className="hover:text-blue-600"
            >
              For Teams
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold border border-gray-200 rounded text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-[#1e293b] rounded-3xl p-10 md:p-20 text-center relative overflow-hidden mb-12 group">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={ProHeroImg}
              alt="Professional Background"
              className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#1e293b]/80 to-[#1e293b]/90"></div>
          </div>

          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <path d="M0 100 L0 0 L100 0 L100 100 Z" fill="#ffffff" />
              <path d="M0 100 L50 0 L100 100 Z" fill="#000000" opacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Advance Your Career with <br /> Expert-Led Courses
            </h1>
            <p className="text-blue-100 text-lg mb-10">
              Join 50,000+ professionals mastering new skills today.
            </p>

            <div className="bg-white p-2 rounded-lg max-w-2xl mx-auto flex shadow-xl">
              <div className="flex-1 flex items-center px-4 border-r border-gray-200">
                <svg
                  className="w-5 h-5 text-gray-400 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
                <input
                  type="text"
                  placeholder="What do you want to learn today?"
                  className="w-full outline-none text-gray-700"
                  onKeyDown={handleSearch}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-gray-100/50 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">
                Active Learners
              </div>
              <div className="text-2xl font-bold text-gray-900">50,000+</div>
            </div>
          </div>
          <div className="bg-gray-100/50 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4.002z" />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">
                Expert Instructors
              </div>
              <div className="text-2xl font-bold text-gray-900">200+</div>
            </div>
          </div>
          <div className="bg-gray-100/50 rounded-xl p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <div className="text-sm text-gray-500 font-medium">
                Career Courses
              </div>
              <div className="text-2xl font-bold text-gray-900">150+</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <h2 id="courses-section" className="text-2xl font-bold">
              Explore Categories
            </h2>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                // Clear filter logic would go here
                setActiveCategory("All Courses");
              }}
              className="text-blue-600 text-sm font-semibold hover:underline flex items-center"
            >
              View All{" "}
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </a>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "All Courses",
              "Data Science",
              "Product Management",
              "Digital Marketing",
              "Software Engineering",
              "Leadership",
            ].map((cat, i) => (
              <button
                key={i}
                onClick={() => handleCategoryClick(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Trending Courses */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold mb-8">Trending Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProCourseCard
              category="Data Science"
              title="Advanced Data Analytics with Python"
              desc="Master Python libraries like Pandas and NumPy to analyze complex datasets."
              price="$89.99"
              rating="4.8"
              tags={["Python", "Pandas", "Visualization"]}
              imageColor="bg-sky-700"
              image={Pro1}
              onEnroll={() =>
                handleEnroll("Advanced Data Analytics with Python")
              }
            />
            <ProCourseCard
              category="Product Mgmt"
              title="Product Strategy for Senior Managers"
              desc="Learn to build roadmaps, manage stakeholders, and lead product teams."
              price="$129.99"
              rating="4.9"
              tags={["Strategy", "Agile", "Leadership"]}
              imageColor="bg-indigo-800"
              image={Pro2}
            />
            <ProCourseCard
              category="Engineering"
              title="Full-Stack Web Development Bootcamp"
              desc="Become a full-stack developer with React, Node.js, and modern tools."
              price="$149.99"
              rating="4.7"
              tags={["React", "Node.js", "MongoDB"]}
              imageColor="bg-slate-800"
              image={Pro3}
            />
            <ProCourseCard
              category="Marketing"
              title="Digital Marketing & SEO Mastery"
              desc="Drive traffic and sales with comprehensive SEO, social media strategies."
              price="$79.99"
              rating="4.6"
              tags={["SEO", "Ads", "Analytics"]}
              imageColor="bg-emerald-700"
              image={Pro4}
            />
            <ProCourseCard
              category="Leadership"
              title="Effective Leadership & Communication"
              desc="Develop the soft skills needed to lead teams, resolve conflicts, and inspire."
              price="$99.99"
              rating="4.9"
              tags={["Mgmt", "Soft Skills", "Public Speaking"]}
              imageColor="bg-neutral-800"
              image={Pro5}
            />
            <ProCourseCard
              category="Design"
              title="UI/UX Design Fundamentals"
              desc="Create intuitive and beautiful user interfaces. Learn Figma, wireframing."
              price="$109.99"
              rating="4.7"
              tags={["Figma", "Prototyping", "User Research"]}
              imageColor="bg-pink-800"
              image={Pro6}
            />
          </div>
        </div>
      </main>

      {/* New Sections for Real Navigation */}
      <section id="pricing" className="py-20 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border border-gray-200 p-8 rounded-2xl hover:shadow-lg transition-all">
              <h3 className="font-bold text-xl mb-4">Basic</h3>
              <div className="text-4xl font-bold mb-6">
                $29
                <span className="text-sm text-gray-500 font-normal">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8 text-gray-600">
                <li>• Access to 100+ courses</li>
                <li>• Community support</li>
                <li>• Mobile app access</li>
              </ul>
              <button className="w-full py-3 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50">
                Start Free Trial
              </button>
            </div>
            <div className="border border-blue-600 bg-blue-50 p-8 rounded-2xl hover:shadow-lg transition-all relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                MOST POPULAR
              </div>
              <h3 className="font-bold text-xl mb-4 text-blue-900">Pro</h3>
              <div className="text-4xl font-bold mb-6 text-blue-900">
                $59
                <span className="text-sm text-blue-700 font-normal">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8 text-blue-800">
                <li>• Access to ALL courses</li>
                <li>• Certificate of completion</li>
                <li>• 1-on-1 Mentorship</li>
                <li>• Offline downloads</li>
              </ul>
              <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                Get Started
              </button>
            </div>
            <div className="border border-gray-200 p-8 rounded-2xl hover:shadow-lg transition-all">
              <h3 className="font-bold text-xl mb-4">Team</h3>
              <div className="text-4xl font-bold mb-6">
                $99
                <span className="text-sm text-gray-500 font-normal">/user</span>
              </div>
              <ul className="text-left space-y-3 mb-8 text-gray-600">
                <li>• Admin dashboard</li>
                <li>• Team analytics</li>
                <li>• SSO Integration</li>
                <li>• Dedicated account manager</li>
              </ul>
              <button className="w-full py-3 border border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="teams" className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Upskill Your Entire Team</h2>
          <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">
            Join 500+ companies that use AcadLearn Pro to train their workforce.
          </p>
          <div className="flex flex-wrap justify-center gap-12 font-bold text-2xl text-slate-600 opacity-50">
            <span>ACME Corp</span>
            <span>Globex</span>
            <span>Soylent Corp</span>
            <span>Initech</span>
            <span>Umbrella</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12 border-t border-gray-200 text-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded overflow-hidden flex items-center justify-center">
                  <img
                    src={Logo}
                    alt="AcadLearn Pro Logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-slate-800">AcadLearn Pro</span>
              </div>
              <p className="text-gray-500">
                Empowering professionals to achieve their career goals through
                world-class education.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">
                Company
              </h4>
              <ul className="space-y-2 text-gray-500">
                <li>
                  <Link to="/about" className="hover:text-blue-600">
                    About Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Press
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">
                Resources
              </h4>
              <ul className="space-y-2 text-gray-500">
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-600">
                    Help Center
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-blue-600">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">
                Legal
              </h4>
              <ul className="space-y-2 text-gray-500">
                <li>
                  <Link to="/terms" className="hover:text-blue-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-blue-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-blue-600">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
            <div className="text-gray-400 mb-4 md:mb-0">
              © 2026 AcadLearn Pro. All rights reserved.
            </div>
            <div className="flex gap-4 text-gray-400">
              <a href="#" className="hover:text-blue-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="hover:text-blue-600">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ProCourseCard = ({
  category,
  title,
  desc,
  price,
  rating,
  tags,
  imageColor,
  image,
  onEnroll,
}) => (
  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
    <div className={`h-48 ${imageColor} relative overflow-hidden group`}>
      {/* Course Image */}
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
      <div className="absolute top-4 left-4 bg-white text-gray-800 text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase z-10">
        {category}
      </div>
    </div>

    <div className="p-6 flex-1 flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex text-yellow-400 text-xs">
          {"★".repeat(Math.floor(Number(rating)))}
        </div>
        <span className="text-xs font-bold text-slate-800 bg-yellow-100 px-1.5 rounded">
          {rating}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
        {title}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{desc}</p>

      <div className="flex flex-wrap gap-2 mb-6 mt-auto">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <div>
          <span className="text-xs text-gray-400 block">Price</span>
          <span className="text-lg font-bold text-gray-900">{price}</span>
        </div>
        <button
          onClick={onEnroll || (() => {})}
          className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition-colors"
        >
          Enroll Now
        </button>
      </div>
    </div>
  </div>
);

export default ProfessionalHome;
