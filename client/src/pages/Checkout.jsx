import React from "react";

import { useParams, Link } from "react-router-dom";

const Checkout = () => {
  const { courseId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Link
          to="/professional"
          className="text-blue-600 hover:underline mb-8 inline-block"
        >
          ← Back to Courses
        </Link>
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Secure Checkout
          </h1>
          <p className="text-gray-600 mb-8">
            You are enrolling in:{" "}
            <span className="font-bold text-gray-800">
              {courseId || "Selected Course"}
            </span>
          </p>

          <div className="space-y-4 mb-8">
            <div className="h-12 bg-gray-100 rounded border border-gray-300 w-full animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded border border-gray-300 w-full animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-12 bg-gray-100 rounded border border-gray-300 w-1/2 animate-pulse"></div>
              <div className="h-12 bg-gray-100 rounded border border-gray-300 w-1/2 animate-pulse"></div>
            </div>
          </div>

          <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
            Complete Purchase
          </button>
          <p className="text-center text-xs text-gray-400 mt-4">
            This is a secure 256-bit SSL encrypted payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
