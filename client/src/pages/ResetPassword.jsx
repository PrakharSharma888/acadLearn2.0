import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import API_BASE from "../config/api";
import Logo from "../assets/acad_learn _symbol.png";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate   = useNavigate();

  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");
  const [success,         setSuccess]         = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Reset failed. The link may have expired.");
      }
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md p-8 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/50 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-1 mb-2">
            <img src={Logo} alt="AcadLearn" className="w-12 h-12 object-contain" />
            <span className="text-2xl font-bold bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              AcadLearn
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
          <p className="text-gray-500 text-sm mt-1">Enter your new password below</p>
        </div>

        {success ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Password Reset!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Your password has been updated. Redirecting you to login…
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Resetting…
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-orange-500 font-semibold hover:text-orange-600">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
