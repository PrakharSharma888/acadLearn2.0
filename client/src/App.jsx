import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import JuniorHome from "./pages/JuniorHome";
import ProfessionalHome from "./pages/ProfessionalHome";

import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import JuniorClasses from "./pages/JuniorClasses";
import JuniorTrophies from "./pages/JuniorTrophies";
import CoursePlayer from "./pages/CoursePlayer";
import Checkout from "./pages/Checkout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/junior" element={<JuniorHome />} />
        <Route path="/professional" element={<ProfessionalHome />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/junior/classes" element={<JuniorClasses />} />
        <Route path="/junior/trophies" element={<JuniorTrophies />} />
        <Route path="/course/play/:id" element={<CoursePlayer />} />
        <Route path="/checkout/:courseId?" element={<Checkout />} />
      </Routes>
    </Router>
  );
}

export default App;
