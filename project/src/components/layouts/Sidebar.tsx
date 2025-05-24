import {
  X,
  Home,
  FileText,
  Bell,
  Users,
  Briefcase,
  Settings,
  PlusCircle,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../types/auth";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

function Sidebar({ isOpen, closeSidebar }: SidebarProps) {
  const location = useLocation();
  const { user, hasRole } = useAuth();

  const isActive = (path: string) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const linkClass = (path: string) => {
    return clsx(
      "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150",
      {
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100":
          isActive(path),
        "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100":
          !isActive(path),
      },
    );
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform lg:translate-x-0 lg:static lg:inset-0 transform",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
          },
        )}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <Link
              to="/"
              className="text-xl font-bold text-teal-600 dark:text-teal-500"
            >
              CityPulse
            </Link>
            <button
              onClick={closeSidebar}
              className="rounded-md p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <Link to="/dashboard" className={linkClass("/dashboard")}>
              <Home size={18} className="mr-3" />
              Dashboard
            </Link>

            <Link to="/complaints" className={linkClass("/complaints")}>
              <FileText size={18} className="mr-3" />
              Complaints
            </Link>

            <Link to="/notifications" className={linkClass("/notifications")}>
              <Bell size={18} className="mr-3" />
              Notifications
            </Link>

            {hasRole([UserRole.ADMIN]) && (
              <Link to="/admin/users" className={linkClass("/admin/users")}>
                <Users size={18} className="mr-3" />
                Manage Users
              </Link>
            )}

            {hasRole([UserRole.ADMIN, UserRole.WORKER]) && (
              <Link to="/admin/workers" className={linkClass("/admin/workers")}>
                <Briefcase size={18} className="mr-3" />
                Workers
              </Link>
            )}

            <Link to="/settings" className={linkClass("/settings")}>
              <Settings size={18} className="mr-3" />
              Settings
            </Link>
          </div>

          {/* New complaint button */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/complaints/new"
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <PlusCircle size={18} className="mr-2" />
              New Complaint
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
