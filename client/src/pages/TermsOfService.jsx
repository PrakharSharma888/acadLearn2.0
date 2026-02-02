import React from "react";
import Navbar from "../components/Navbar";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>
        <p className="text-lg text-gray-700">
          By using our platform, you agree to these terms. This is a placeholder
          for the Terms of Service content.
        </p>
      </div>
    </div>
  );
};

export default TermsOfService;
