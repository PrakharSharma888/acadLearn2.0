import React from "react";
import Navbar from "../components/Navbar";

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Contact Us</h1>
        <p className="text-lg text-gray-700">
          Have questions? Reach out to us at{" "}
          <a
            href="mailto:support@acadlearn.com"
            className="text-blue-600 hover:underline"
          >
            support@acadlearn.com
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Contact;
