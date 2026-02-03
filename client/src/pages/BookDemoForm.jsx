import React, { useState } from "react";

const initialState = {
  parentName: "",
  phone: "",
  email: "",
  studentName: "",
  grade: "",
};

const BookDemoForm = () => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};

    if (!formData.parentName.trim()) e.parentName = "Parent name is required";
    if (!/^[6-9]\d{9}$/.test(formData.phone))
      e.phone = "Enter a valid 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      e.email = "Enter a valid email address";
    if (!formData.studentName.trim())
      e.studentName = "Student name is required";
    if (!formData.grade.trim()) e.grade = "Grade / class is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxC6PwjWb7XaBFnjPZd3zRaUiJg7cSyD6JhKINaTNEydbS4zM9dHui9hR4N2zv98vkZ/exec",
        {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      alert("Demo booked! We will contact you shortly.");
      setFormData(initialState);
      setErrors({});
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-orange-100 p-6 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4">
        Fill out the form to get started
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {[
          { label: "Parent’s Name", name: "parentName", type: "text" },
          { label: "Phone Number", name: "phone", type: "tel" },
          { label: "Email Address", name: "email", type: "email" },
          { label: "Student’s Name", name: "studentName", type: "text" },
          { label: "Grade / Class", name: "grade", type: "text" },
        ].map((field) => (
          <div key={field.name}>
            <label className="text-sm font-medium">{field.label}</label>
            <input
              name={field.name}
              type={field.type}
              value={formData[field.name]}
              onChange={handleChange}
              className={`w-full mt-1 rounded-lg border px-3 py-2 text-sm bg-gray-50 focus:ring-2 focus:ring-orange-200 outline-none ${
                errors[field.name]
                  ? "border-red-400"
                  : "border-gray-200"
              }`}
              required
            />
            {errors[field.name] && (
              <p className="text-xs text-red-500 mt-1">
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}

        <button
          disabled={loading}
          className="mt-2 rounded-full bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          {loading ? "Booking..." : "Book Demo for ₹9"}
        </button>
      </form>
    </div>
  );
};

export default BookDemoForm;
