import { Bell, LogOut, Menu, Moon, Settings, Sun, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import Dropdown from "../ui/Dropdown";

interface NavbarProps {
  toggleSidebar: () => void;
  unreadCount: number;
}

function Navbar({ toggleSidebar, unreadCount }: NavbarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="z-10 py-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container px-6 mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="p-1 mr-4 -ml-1 rounded-md md:hidden focus:outline-none focus:shadow-outline-teal"
            onClick={toggleSidebar}
            aria-label="Menu"
          >
            <Menu size={24} className="text-gray-600 dark:text-gray-400" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-teal-600 dark:text-teal-500">
              CityPulse
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? (
              <Moon size={20} className="text-gray-600" />
            ) : (
              <Sun size={20} className="text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            aria-label="Notifications"
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/3 -translate-y-1/3 bg-red-500 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:shadow-outline-teal"
              aria-label="Account"
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white">
                {user?.firstName?.[0] || user?.username?.[0] || (
                  <User size={16} />
                )}
              </div>
            </button>

            <Dropdown
              isOpen={profileDropdownOpen}
              onClose={() => setProfileDropdownOpen(false)}
              className="right-0 w-56 mt-2"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
                <div className="mt-1">
                  {/* <span className="px-2 py-0.5 text-xs rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100">
                    {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                  </span> */}
                </div>
              </div>
              <div className="py-1">
                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <User size={16} className="mr-2" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
