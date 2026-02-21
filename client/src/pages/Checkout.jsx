import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API_BASE from "../config/api";

// Dynamically load Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id  = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [cls,     setCls]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [paying,  setPaying]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [payId,   setPayId]   = useState("");

  const [user, setUser] = useState(null);

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  // Fetch course details
  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const storedUser = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const headers    = storedUser?.token ? { Authorization: `Bearer ${storedUser.token}` } : {};
    fetch(`${API_BASE}/api/classes/${courseId}`, { headers })
      .then((r) => { if (!r.ok) throw new Error("Course not found"); return r.json(); })
      .then((data) => { setCls(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [courseId]);

  const handlePay = async () => {
    if (!user?.token) {
      navigate(`/login?redirect=/checkout/${courseId}`);
      return;
    }

    setPaying(true);
    setError("");

    // 1. Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Failed to load payment gateway. Check your internet connection.");
      setPaying(false);
      return;
    }

    // 2. Create order on backend
    let orderData;
    try {
      const res = await fetch(`${API_BASE}/api/payment/create-order`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${user.token}`,
        },
        body: JSON.stringify({ classId: courseId }),
      });
      orderData = await res.json();
      if (!res.ok) throw new Error(orderData.message || "Could not create order.");
    } catch (err) {
      setError(err.message);
      setPaying(false);
      return;
    }

    // 3. Open Razorpay modal
    const options = {
      key:         orderData.keyId,
      amount:      orderData.amount,
      currency:    orderData.currency,
      name:        "AcadLearn",
      description: orderData.className,
      order_id:    orderData.orderId,
      prefill: {
        name:  user.name  || "",
        email: user.email || "",
      },
      theme: { color: cls?.category === "professional" ? "#2563EB" : "#EA580C" },
      handler: async (response) => {
        // 4. Verify payment on backend
        try {
          const verRes = await fetch(`${API_BASE}/api/payment/verify`, {
            method:  "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization:  `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              classId: courseId,
            }),
          });
          const verData = await verRes.json();
          if (!verRes.ok) throw new Error(verData.message || "Verification failed.");
          setPayId(response.razorpay_payment_id);
          setSuccess(true);
        } catch (err) {
          setError(err.message);
        } finally {
          setPaying(false);
        }
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setError(response.error?.description || "Payment failed. Please try again.");
      setPaying(false);
    });
    rzp.open();
  };

  const t = cls?.category === "professional"
    ? { btn: "bg-blue-600 hover:bg-blue-700", accent: "text-blue-600", accentBg: "bg-blue-50", border: "border-blue-200" }
    : { btn: "bg-orange-600 hover:bg-orange-700", accent: "text-orange-600", accentBg: "bg-orange-50", border: "border-orange-200" };

  const backPath = cls?.category === "professional" ? "/professional" : "/junior";

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <svg className="w-8 h-8 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
      </svg>
    </div>
  );

  // ── Error fetching course ──
  if (error && !cls) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-orange-600 hover:underline text-sm font-semibold">← Go back</button>
      </div>
    </div>
  );

  // ── Success ──
  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-500 text-sm mb-1">You are now enrolled in</p>
        <p className="font-bold text-slate-700 text-base mb-4">{cls?.title}</p>
        {payId && (
          <p className="text-xs text-gray-400 mb-6">Payment ID: <span className="font-mono">{payId}</span></p>
        )}
        <button
          onClick={() => navigate("/dashboard/classes")}
          className={`w-full py-3 ${t.btn} text-white font-bold rounded-xl text-sm transition-colors`}
        >
          Go to Dashboard
        </button>
        <button
          onClick={() => navigate(backPath)}
          className="mt-3 w-full py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50"
        >
          Browse More Courses
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link to={backPath} className={`${t.accent} hover:underline text-sm font-semibold`}>← Back</Link>
          <span className="text-gray-300">|</span>
          <span className="text-sm text-gray-500 font-medium">Secure Checkout</span>
          <svg className="w-4 h-4 text-green-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span className="text-xs text-green-600 font-semibold">256-bit SSL</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">

        {/* Course summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Order Summary</h2>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 ${t.accentBg} rounded-xl flex items-center justify-center shrink-0`}>
              <svg className={`w-7 h-7 ${t.accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-base leading-snug">{cls?.title}</h3>
              {cls?.subtitle && <p className="text-xs text-gray-400 mt-0.5">{cls.subtitle}</p>}
              <div className="flex flex-wrap gap-3 mt-2">
                {cls?.instructor && (
                  <span className="text-xs text-gray-500">By {cls.instructor}</span>
                )}
                {cls?.duration && (
                  <span className="text-xs text-gray-500">· {cls.duration}</span>
                )}
                {cls?.level && (
                  <span className="text-xs text-gray-500">· {cls.level}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">Course fee</span>
            <span className="text-2xl font-black text-slate-800">
              ₹{cls?.price?.toLocaleString("en-IN") || "0"}
            </span>
          </div>
        </div>

        {/* What you get */}
        <div className={`${t.accentBg} border ${t.border} rounded-2xl p-5`}>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">What's included</h3>
          <div className="space-y-2">
            {[
              "Full course access",
              "Live interactive sessions",
              "Expert instructors",
              "Doubt clearing support",
              "Certificate on completion",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-sm">
                <svg className={`w-4 h-4 ${t.accent} shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Login notice if not logged in */}
        {!user?.token && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-medium">
            You need to be logged in to complete payment.{" "}
            <Link to={`/login?redirect=/checkout/${courseId}`} className="underline font-bold">Login here</Link>
          </div>
        )}

        {/* Payment error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={paying || !cls?.price}
          className={`w-full py-4 ${t.btn} text-white font-black rounded-2xl text-base transition-colors disabled:opacity-60 flex items-center justify-center gap-3`}
        >
          {paying ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Opening Payment…
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              Pay ₹{cls?.price?.toLocaleString("en-IN")} with Razorpay
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400">
          Payments are securely processed by Razorpay. We do not store your card details.
        </p>
      </div>
    </div>
  );
};

export default Checkout;
