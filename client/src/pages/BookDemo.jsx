import React, { useState } from "react";
import JuniorNavbar from "../components/JuniorNavbar";
import DemoImage from "../assets/demoIpagemage.png";

const BookDemo = () => {
  const [formData, setFormData] = useState({
    parentName: "",
    phone: "",
    email: "",
    studentName: "",
    grade: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Oh noooooooooooo");
    try {
      // TODO: Replace with your actual Google Apps Script / Forms endpoint
      const endpoint = "https://script.google.com/macros/s/AKfycbxC6PwjWb7XaBFnjPZd3zRaUiJg7cSyD6JhKINaTNEydbS4zM9dHui9hR4N2zv98vkZ/exec";

      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      alert("Demo booked! We will reach out to you shortly.");
      setFormData({
        parentName: "",
        phone: "",
        email: "",
        studentName: "",
        grade: "",
      });
    } catch (error) {
      console.error("Demo form submission failed", error);
      alert("Something went wrong. Please try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF5] font-sans text-gray-800 selection:bg-orange-200">
      <JuniorNavbar />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          {/* Left: Copy + Form */}
          <section>
            <p className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 mb-4">
              Invest in the future for just ₹9/-
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Book a 60-minute demo class for your child
            </h1>
            <p className="text-base md:text-lg text-gray-700 mb-4">
              Most children find their daily lessons boring because they don't
              see how they connect to the real world. Our 60-minute demo class
              changes that by showing your child a faster and much more exciting
              way to learn. We spend this hour connecting with your child to
              find out what makes them curious and how we can make their current
              school subjects feel easier to handle.
            </p>
            <p className="text-base md:text-lg text-gray-700 mb-4">
              Instead of just memorizing facts, they will start learning how to
              actually solve problems on their own.
            </p>
            <p className="text-base md:text-lg text-gray-700 mb-8">
              For just ₹9, you can give your child the tools to feel smarter in
              class and more confident about their future.
            </p>

            <div className="bg-white rounded-3xl shadow-md border border-orange-100 p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Fill out the form to see the change in your child today.
              </h2>
              <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent’s Name
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                    placeholder="Enter parent’s full name"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student’s Name
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                    placeholder="Enter student’s full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student’s Grade / Class
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none"
                    placeholder="e.g., Class 4, Grade 7, etc."
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex justify-center rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-orange-600 hover:shadow-lg transition-all"
                >
                  Book Demo for ₹9
                </button>
              </form>
            </div>
          </section>

          {/* Right: Demo image */}
          <section className="w-full">
            <div className="relative h-72 md:h-[420px] rounded-3xl border-2 border-orange-200 bg-orange-50 overflow-hidden flex items-center justify-center">
              <img
                src={DemoImage}
                alt="AcadLearn Jr demo class"
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BookDemo;


