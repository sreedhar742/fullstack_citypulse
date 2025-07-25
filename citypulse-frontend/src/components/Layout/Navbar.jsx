import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  Users, 
  Bell, 
  LogOut,
  User
} from 'lucide-react';
import './navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Complaints', href: '/complaints', icon: FileText },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Workers', href: '/workers', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-logo-container">
            <Link to="/" className="navbar-logo">
              <div className="logo-icon">
                <span className="logo-text">C</span>
              </div>
              <span className="brand-name">CityPulse</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${
                    isActive(item.href)
                      ? 'nav-item-active'
                      : 'nav-item-inactive'
                  }`}
                >
                  <Icon className="nav-icon" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="user-menu">
            <div className="user-greeting">
              <User className="greeting-icon" />
              <span>Welcome, {user?.first_name || user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              <LogOut className="logout-icon" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu-button">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="menu-button"
            >
              {isOpen ? <X className="menu-icon" /> : <Menu className="menu-icon" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-container">
            <div className="mobile-nav-items">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`mobile-nav-item ${
                      isActive(item.href)
                        ? 'nav-item-active'
                        : 'nav-item-inactive'
                    }`}
                  >
                    <Icon className="mobile-nav-icon" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="mobile-user-section">
                <div className="mobile-greeting">
                  <User className="greeting-icon" />
                  <span>Welcome, {user?.first_name || user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="mobile-logout"
                >
                  <LogOut className="mobile-nav-icon" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;