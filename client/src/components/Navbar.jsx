import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.jpeg";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
            <img
              src={Logo}
              alt="AcadLearn Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold text-dark">AcadLearn</span>
        </Link>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Logout
              </button>
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
