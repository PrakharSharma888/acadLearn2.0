import React from "react";
import Navbar from "../components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>
        <p className="text-lg text-gray-700">
          Your privacy is important to us. This is a placeholder for the Privacy
          Policy content.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
