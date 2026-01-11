import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "Student" });

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      // Redirect to login if strictly needed, but for now we might just allow viewing
      // navigate("/login");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
      {/* Navbar - Specific to Dashboard as per design */}
      <nav className="bg-white border-b border-gray-100 py-3 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  ></path>
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">
                AcadLearn
              </span>
            </Link>
            <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
              <a href="#" className="text-blue-600">
                Dashboard
              </a>
              <a href="#" className="hover:text-blue-600">
                Browse Courses
              </a>
              <a href="#" className="hover:text-blue-600">
                Community
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="Search courses..."
                className="bg-gray-100 px-4 py-2 pl-10 rounded-full text-sm outline-none focus:ring-2 focus:ring-blue-100 w-64"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-2.5"
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
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-500">
            You've completed{" "}
            <span className="font-bold text-blue-600">3 lessons</span> this
            week. You're on a 5-day streak! 🔥
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    ></path>
                  </svg>
                }
                number="2"
                label="Courses in Progress"
              />
              <StatCard
                icon={
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                }
                number="12"
                label="Completed Lessons"
              />
              <StatCard
                icon={
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    ></path>
                  </svg>
                }
                number="1"
                label="Certificate Earned"
              />
            </div>

            {/* My Courses Section */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">My Courses</h2>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button className="px-4 py-1.5 bg-slate-800 text-white rounded-md text-sm font-medium shadow-sm">
                    All Courses
                  </button>
                  <button className="px-4 py-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Active
                  </button>
                  <button className="px-4 py-1.5 text-gray-500 hover:text-gray-700 text-sm font-medium">
                    Completed
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <CourseCard
                  imageClass="bg-slate-900"
                  status="IN PROGRESS"
                  title="Advanced Python for Data Science"
                  instructor="Dr. Angela Yu"
                  progress={45}
                  totalLessons="12/26 Lessons"
                  action={
                    <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                      Continue Learning{" "}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        ></path>
                      </svg>
                    </button>
                  }
                />
                <CourseCard
                  imageClass="bg-teal-700"
                  status="NEW"
                  statusColor="bg-blue-500"
                  title="UX Design Fundamentals"
                  instructor="Google Career Certificates"
                  progress={0}
                  totalLessons="0/14 Modules"
                  action={
                    <button className="w-full py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                      Start Course{" "}
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 4l10 6-10 6V4z" />
                      </svg>
                    </button>
                  }
                />
                <CourseCard
                  imageClass="bg-yellow-600"
                  status="COMPLETED"
                  statusColor="bg-green-500"
                  title="Project Management 101"
                  instructor="Sarah Johnson"
                  progress={100}
                  totalLessons="Certified"
                  isCompleted={true}
                  action={
                    <div className="flex gap-3">
                      <button className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          ></path>
                        </svg>{" "}
                        Certificate
                      </button>
                      <button className="px-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                      </button>
                    </div>
                  }
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Deadlines Widget */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg">Upcoming Deadlines</h3>
                <a href="#" className="text-blue-600 text-xs font-semibold">
                  View Calendar
                </a>
              </div>
              <div className="space-y-6">
                <DeadlineItem
                  icon={
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                  }
                  title="Python Quiz 2"
                  course="Advanced Python"
                  time="Due in 2 days"
                />
                <DeadlineItem
                  icon={
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                        ></path>
                      </svg>
                    </div>
                  }
                  title="Wireframe Submission"
                  course="UX Design"
                  time="Due Oct 24"
                />
                <DeadlineItem
                  icon={
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                  }
                  title="Peer Review"
                  course="UX Design"
                  time="Due Oct 28"
                />
              </div>
            </div>

            {/* Recommended Widget */}
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="font-bold text-lg text-slate-800">
                  Recommended for you
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Based on your interest in Data Science, we think you'll love
                this course.
              </p>

              <div className="bg-white p-4 rounded-xl flex gap-4 shadow-sm mb-4">
                <div className="w-16 h-16 bg-teal-800 rounded-lg flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">
                    Data Visualization Mastery
                  </h4>
                  <div className="flex items-center text-xs text-orange-500 font-bold">
                    <span className="mr-1">★</span> 4.8 (1.2k)
                  </div>
                </div>
              </div>

              <button className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 font-semibold rounded-lg text-sm hover:bg-blue-600 hover:text-white transition-colors">
                View Course Details
              </button>
            </div>

            {/* Quote Widget */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-lg">
              <h3 className="font-bold text-lg mb-2">Quote of the Day</h3>
              <p className="text-indigo-100 italic text-sm mb-4">
                "The beautiful thing about learning is that no one can take it
                away from you."
              </p>
              <div className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase opacity-75">
                <span className="w-3 h-[1px] bg-white"></span> B.B. King
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon, number, label }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
    <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-slate-800">{number}</div>
      <div className="text-xs font-semibold text-gray-500">{label}</div>
    </div>
  </div>
);

const CourseCard = ({
  imageClass,
  status,
  statusColor = "bg-slate-800",
  title,
  instructor,
  progress,
  totalLessons,
  action,
  isCompleted,
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
    <div
      className={`w-full md:w-48 h-32 ${imageClass} rounded-xl flex-shrink-0 relative overflow-hidden group`}
    >
      {/* Simple coded overlay pattern */}
      <div className="absolute inset-0 opacity-20 font-mono text-[8px] p-2 leading-tight text-white break-all">
        {`function learn() { const future = "bright"; return future; } class Student extends Person { study() { this.knowledge++; } }`}
      </div>
      <div
        className={`absolute top-2 right-2 text-[10px] font-bold text-white px-2 py-0.5 rounded shadow-sm uppercase ${statusColor}`}
      >
        {status}
      </div>
    </div>

    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h3 className="font-bold text-xl text-slate-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">By {instructor}</p>
      </div>

      <div>
        {!isCompleted && (
          <div className="mb-4">
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
              <span>{progress}% Complete</span>
              <span>{totalLessons}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-green-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Certified
          </div>
        )}

        {action}
      </div>
    </div>

    <div className="hidden md:block">
      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
    </div>
  </div>
);

const DeadlineItem = ({ icon, title, course, time }) => (
  <div className="flex items-center gap-4">
    {icon}
    <div className="flex-1">
      <h4 className="font-bold text-sm text-slate-800">{title}</h4>
      <div className="text-xs text-gray-500">
        {course} • {time}
      </div>
    </div>
  </div>
);

export default Dashboard;
