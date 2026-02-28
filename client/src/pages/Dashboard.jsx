import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BookDemoModal from "../components/BookDemoModal";
import useDashboard from "../hooks/useDashboard";
import { NAV_ITEMS } from "../dashboard/constants";
import DashboardSidebar from "../dashboard/DashboardSidebar";
import OverviewTab    from "../dashboard/OverviewTab";
import ClassesTab     from "../dashboard/ClassesTab";
import BookingsTab    from "../dashboard/BookingsTab";
import ProgressTab    from "../dashboard/ProgressTab";
import ProfileTab     from "../dashboard/ProfileTab";
import AdminTab          from "../dashboard/AdminTab";
import UniversitiesTab  from "../dashboard/UniversitiesTab";
import PromoteTab        from "../dashboard/PromoteTab";
import EventsTab         from "../dashboard/EventsTab";

const Dashboard = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const {
    user, setUser, handleLogout,
    classes, setClasses, classesLoading, classesError, activeCategory, setActiveCategory,
    bookings, bookingsLoading, loadBookings,
    handleCancel, handleStatusUpdate,
    demoSessions,
    lockedCourseIds,
  } = useDashboard();

  const handleNav = (pathOrKey) => {
    // If it's a key like "bookings", convert to path
    const path = pathOrKey.startsWith("/") 
      ? pathOrKey 
      : `/dashboard/${pathOrKey}`;
    navigate(path);
    setSidebarOpen(false);
  };

  const renderTab = () => {
    switch (tab) {
      case "overview":
        return <OverviewTab user={user} classes={classes} bookings={bookings} demoSessions={demoSessions} onNav={handleNav} onBookDemo={setSelectedClass} />;
      case "classes":
        return (
          <ClassesTab
            classes={classes}
            loading={classesLoading}
            error={classesError}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onBookDemo={setSelectedClass}
            user={user}
            onCourseCreated={(newClass) => setClasses((prev) => [newClass, ...prev])}
            lockedCourseIds={lockedCourseIds}
          />
        );
      case "bookings":
        return (
          <BookingsTab
            bookings={bookings}
            loading={bookingsLoading}
            onCancel={handleCancel}
            user={user}
            onStatusUpdate={handleStatusUpdate}
            demoSessions={demoSessions}
            onBookDemo={setSelectedClass}
          />
        );
      case "progress":
        return <ProgressTab bookings={bookings} classes={classes} />;
      case "profile":
        return <ProfileTab user={user} token={user.token} onUserUpdate={setUser} />;
      case "admin":
        return <AdminTab token={user.token} />;
      case "universities":
        return <UniversitiesTab token={user.token} />;
      case "promote":
        return <PromoteTab token={user.token} />;
      case "events":
        return <EventsTab token={user.token} />;
      default:
        return <OverviewTab user={user} classes={classes} bookings={bookings} demoSessions={demoSessions} onNav={handleNav} onBookDemo={setSelectedClass} />;
    }
  };

  const sidebarProps = {
    user,
    activeNav: tab,
    bookings,
    onLogout: handleLogout,
  };

  const currentNav = NAV_ITEMS.find((n) => n.key === tab) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col fixed inset-y-0 left-0 z-30">
        <DashboardSidebar {...sidebarProps} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-64 bg-white h-full flex flex-col shadow-xl z-10">
            <DashboardSidebar {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-60 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <p className="hidden md:block text-sm font-semibold text-gray-400 capitalize">
            {currentNav.label}
          </p>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-linear-to-tr from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-white shadow-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-semibold text-slate-700">{user.name}</span>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {bookings.filter((b) => b.status === "pending").length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 px-4 md:px-8 py-8">
          {renderTab()}
        </main>
      </div>

      {/* Book Demo Modal */}
      {selectedClass && (
        <BookDemoModal
          cls={selectedClass}
          user={user}
          onClose={() => {
            setSelectedClass(null);
            loadBookings();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
