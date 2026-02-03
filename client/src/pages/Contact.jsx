import React, { useState } from "react";
import JuniorNavbar from "../components/JuniorNavbar";

const Contact = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    query: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // TODO: Replace with your actual Google Apps Script / Forms endpoint
      const endpoint = "https://script.google.com/macros/s/YOUR_CONTACT_FORM_ID/exec";

      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      alert("Thank you! Your query has been submitted.");
      setFormData({ email: "", phone: "", query: "" });
    } catch (error) {
      console.error("Contact form submission failed", error);
      alert("Something went wrong. Please try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      <JuniorNavbar />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto grid gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-6">
              Contact Us
            </h1>
            <p className="text-lg text-gray-700 mb-4">
              If you have any questions about how our classes work or which
              course is best for your child, please get in touch. We are happy
              to help you make the right choice.
            </p>
            <p className="text-base text-gray-700 mb-6">
              You can fill out the form or reach us directly using the details
              below.
            </p>

            <div className="space-y-3 text-gray-800 text-sm">
              <div>
                <span className="font-semibold">Email:</span>{" "}
                <a
                  href="mailto:support@acadlearn.com"
                  className="text-orange-600 hover:underline"
                >
                  support@acadlearn.com
                </a>
              </div>
              <div>
                <span className="font-semibold">Phone:</span>{" "}
                <span>+91 78385 38283, +91 88966 63644</span>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Or you can directly call:{" "}
                <span className="font-semibold">
                  +917838538283, +918896663644
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-md border border-orange-100 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Send us a message
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="Your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Query
                </label>
                <textarea
                  rows="4"
                  name="query"
                  value={formData.query}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                  placeholder="Share your question about our classes or courses..."
                />
              </div>
              <button
                type="submit"
                className="mt-2 inline-flex justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 hover:shadow-lg transition-all"
              >
                Submit Query
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
