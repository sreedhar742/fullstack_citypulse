import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import notificationsService from "../../api/notificationsService";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error("Failed to fetch unread notifications:", error);
      }
    };

    if (user) {
      fetchUnreadCount();

      // Poll for new notifications every 60 seconds
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full">
        <Navbar toggleSidebar={toggleSidebar} unreadCount={unreadCount} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="container mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        <footer className="py-4 px-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto max-w-7xl text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} CityPulse. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AppLayout;
