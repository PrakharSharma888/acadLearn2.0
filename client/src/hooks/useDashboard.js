import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "../config/api";
import { authHeader } from "../dashboard/constants";

const useDashboard = () => {
  const navigate = useNavigate();

  // ── User ──────────────────────────────────────────────────────────────────
  const [user, setUser] = useState({ name: "Student", email: "", token: "" });

  useEffect(() => {
    const info = localStorage.getItem("userInfo");
    if (info) setUser(JSON.parse(info));
  }, []);

  // ── Classes ───────────────────────────────────────────────────────────────
  const [classes, setClasses]               = useState([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError]     = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    const fetchClasses = async () => {
      setClassesLoading(true);
      setClassesError("");
      try {
        const url = activeCategory === "all"
          ? `${API_BASE}/api/classes`
          : `${API_BASE}/api/classes?category=${activeCategory}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        setClasses(await res.json());
      } catch {
        setClassesError("Could not load classes. Please try again.");
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, [activeCategory]);

  // ── Banners → locked course IDs ───────────────────────────────────────────
  const [lockedCourseIds, setLockedCourseIds] = useState(new Set());

  useEffect(() => {
    fetch(`${API_BASE}/api/banners`)
      .then((r) => r.ok ? r.json() : [])
      .then((banners) => {
        const ids = new Set(
          banners
            .filter((b) => b.classId && b.universityId && b.allowPublicBooking === false)
            .map((b) => b.classId)
        );
        setLockedCourseIds(ids);
      })
      .catch(() => {});
  }, []);

  // ── Demo Sessions (public, upcoming) ─────────────────────────────────────
  const [demoSessions, setDemoSessions] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/demo-sessions`)
      .then((r) => r.ok ? r.json() : [])
      .then(setDemoSessions)
      .catch(() => setDemoSessions([]));
  }, []);

  // ── Bookings ──────────────────────────────────────────────────────────────
  const [bookings, setBookings]               = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const loadBookings = useCallback(async () => {
    if (!user.token) {
      setBookingsLoading(false);
      return;
    }
    setBookingsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/demo-booking/my`, {
        headers: authHeader(user.token),
      });
      if (!res.ok) throw new Error();
      setBookings(await res.json());
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user.token]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // ── Cancel booking ────────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this demo booking?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/demo-booking/${id}`, {
        method: "DELETE",
        headers: authHeader(user.token),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Could not cancel booking.");
      }
      await loadBookings();
    } catch (err) {
      alert(err.message || "Could not cancel booking. Please try again.");
    }
  };

  // ── Update booking status (Admin) ─────────────────────────────────────────
  const handleStatusUpdate = async (id, newStatus, confirmedDate, confirmedTime) => {
    try {
      const res = await fetch(`${API_BASE}/api/demo-booking/${id}/status`, {
        method: "PUT",
        headers: authHeader(user.token),
        body: JSON.stringify({ status: newStatus, confirmedDate: confirmedDate || "", confirmedTime: confirmedTime || "" }),
      });
      if (!res.ok) throw new Error();
      await loadBookings();
    } catch {
      alert("Could not update booking status. Please try again.");
    }
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return {
    // user
    user,
    setUser,
    handleLogout,
    // classes
    classes,
    setClasses,
    classesLoading,
    classesError,
    activeCategory,
    setActiveCategory,
    // bookings
    bookings,
    bookingsLoading,
    loadBookings,
    handleCancel,
    handleStatusUpdate,
    // demo sessions
    demoSessions,
    // locked courses (banner-only booking)
    lockedCourseIds,
  };
};

export default useDashboard;
