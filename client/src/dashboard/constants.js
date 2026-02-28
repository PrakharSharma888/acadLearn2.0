// ── Shared helpers ────────────────────────────────────────────────────────────
export const authHeader = (token) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

// ── Status badge colours ──────────────────────────────────────────────────────
export const STATUS_STYLES = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

// ── Sidebar nav items (labels + keys only — icons live in DashboardSidebar) ──
export const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", path: "/dashboard/overview" },
  { key: "classes", label: "Courses", path: "/dashboard/classes" },
  { key: "bookings", label: "Demo Bookings", path: "/dashboard/bookings" },
  { key: "progress", label: "Progress", path: "/dashboard/progress" },
  { key: "profile", label: "Profile", path: "/dashboard/profile" },
  { key: "admin", label: "Admin Panel", path: "/dashboard/admin", adminOnly: true },
  { key: "universities", label: "Universities", path: "/dashboard/universities", adminOnly: true },
  { key: "promote",      label: "Promote",      path: "/dashboard/promote",      adminOnly: true },
  { key: "events",       label: "Events",       path: "/dashboard/events",        adminOnly: true },
];
