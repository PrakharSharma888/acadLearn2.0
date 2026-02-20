import { useState, useEffect } from "react";
import API_BASE from "../config/api";

const initialState = {
  parentName: "",
  phone: "",
  email: "",
  studentName: "",
};

// ── Theme tokens by category ─────────────────────────────────────────────────
const THEME = {
  junior: {
    header:      "bg-linear-to-r from-orange-500 to-amber-400",
    label:       "text-orange-100",
    subtext:     "text-orange-100",
    ring:        "focus:ring-orange-200 focus:border-orange-400",
    btn:         "bg-orange-500 hover:bg-orange-600 active:bg-orange-700",
    btnOutline:  "border-orange-500 text-orange-600 hover:bg-orange-50",
    badge:       "Junior Program",
    successBtn:  "bg-orange-500 hover:bg-orange-600",
    successRing: "bg-orange-50 text-orange-500",
    dot:         "bg-orange-500",
    numberBg:    "bg-orange-100 text-orange-600",
  },
  professional: {
    header:      "bg-linear-to-r from-blue-600 to-blue-500",
    label:       "text-blue-100",
    subtext:     "text-blue-100",
    ring:        "focus:ring-blue-200 focus:border-blue-400",
    btn:         "bg-blue-600 hover:bg-blue-700 active:bg-blue-800",
    btnOutline:  "border-blue-600 text-blue-600 hover:bg-blue-50",
    badge:       "Professional",
    successBtn:  "bg-blue-600 hover:bg-blue-700",
    successRing: "bg-blue-50 text-blue-500",
    dot:         "bg-blue-500",
    numberBg:    "bg-blue-100 text-blue-600",
  },
};

const BookDemoModal = ({ cls, user, onClose }) => {
  const theme = THEME[cls?.category] || THEME.professional;

  const [formData, setFormData] = useState(initialState);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);

  // Pre-fill from logged-in user each time modal opens
  useEffect(() => {
    setSuccess(false);
    setErrors({});
    setFormData({
      ...initialState,
      email:      user?.email || "",
      parentName: user?.name  || "",
    });
  }, [cls, user]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p)  => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!formData.parentName.trim())              e.parentName   = "Parent name is required";
    if (!/^[6-9]\d{9}$/.test(formData.phone))    e.phone        = "Enter a valid 10-digit mobile number";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))  e.email        = "Enter a valid email address";
    if (!formData.studentName.trim())             e.studentName  = "Student name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const gradeMatch = cls?.title?.match(/\b(\d{1,2})\b/);
      const grade = cls?.grade
        ? String(cls.grade)
        : gradeMatch
        ? `Grade ${gradeMatch[1]}`
        : cls?.title || "";

      const res = await fetch(`${API_BASE}/api/demo-booking`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          grade,
          classId:   cls?._id   || null,
          className: cls?.title || "",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Booking failed");
      }
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Reset form so user can book again without closing modal
  const handleBookAnother = () => {
    setSuccess(false);
    setErrors({});
    setFormData({
      ...initialState,
      email:      user?.email || "",
      parentName: user?.name  || "",
    });
  };

  const inputCls = (name) =>
    `w-full rounded-xl border px-3.5 py-2.5 text-sm bg-gray-50 outline-none transition ${theme.ring} ${
      errors[name] ? "border-red-400 bg-red-50" : "border-gray-200"
    }`;

  const FIELDS = [
    { label: "Parent's Name",   name: "parentName",  type: "text",  placeholder: "e.g. Rahul Sharma" },
    { label: "Phone Number",    name: "phone",        type: "tel",   placeholder: "10-digit mobile number" },
    { label: "Email Address",   name: "email",        type: "email", placeholder: "you@example.com" },
    { label: "Student's Name",  name: "studentName",  type: "text",  placeholder: "Child's full name" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className={`${theme.header} rounded-t-2xl p-6 text-white`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <p className={`${theme.label} text-xs font-semibold uppercase tracking-widest mb-1`}>
            {theme.badge} · Demo Booking
          </p>
          <h2 className="text-xl font-bold leading-tight">
            {cls?.title || "Book a Demo Class"}
          </h2>
          {cls?.instructor && (
            <p className={`${theme.subtext} text-sm mt-1`}>By {cls.instructor}</p>
          )}
        </div>

        {/* ── Success state ── */}
        {success ? (
          <div className="p-8 text-center">
            <div className={`w-16 h-16 ${theme.successRing} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Demo Booked!</h3>
            <p className="text-gray-500 text-sm mb-6">
              A confirmation email has been sent to <strong>{formData.email}</strong>.
              Our team will call you within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {/* Book another demo for a different class */}
              <button
                onClick={handleBookAnother}
                className={`px-5 py-2.5 ${theme.btn} text-white font-semibold rounded-xl transition-colors text-sm`}
              >
                Book Another Demo
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {FIELDS.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  {field.label}
                </label>
                <input
                  name={field.name}
                  type={field.type}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={inputCls(field.name)}
                />
                {errors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}

            {errors.submit && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {errors.submit}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 ${theme.btn} disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2`}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Booking...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Confirm Demo Booking
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookDemoModal;
