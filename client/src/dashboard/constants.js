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
  { key: "dashboard", label: "Dashboard" },
  { key: "classes",   label: "My Classes" },
  { key: "bookings",  label: "Demo Bookings" },
  { key: "progress",  label: "Progress" },
  { key: "profile",   label: "Profile" },
];
