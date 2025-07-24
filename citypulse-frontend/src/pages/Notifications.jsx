import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, Filter } from 'lucide-react';
import { notificationsAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const filters = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread Only' },
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
  ];

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      let response;
      switch (filter) {
        case 'unread':
          response = await notificationsAPI.getUnread();
          break;
        case '7':
        case '30':
          response = await notificationsAPI.getByTime(parseInt(filter));
          break;
        default:
          response = await notificationsAPI.getUnread(); // Fallback to unread
          break;
      }
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (message) => {
    if (message.toLowerCase().includes('complaint')) {
      return '📋';
    } else if (message.toLowerCase().includes('assigned')) {
      return '👷';
    } else if (message.toLowerCase().includes('resolved')) {
      return '✅';
    } else if (message.toLowerCase().includes('urgent')) {
      return '🚨';
    }
    return '📢';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="notifications-container animate-fade-in">
      {/* Header */}
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">Stay updated with the latest system activities</p>
        </div>
        <div className="unread-counter">
          <Bell className="unread-icon" />
          <span>
            {notifications.filter(n => !n.is_read).length} unread
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-container">
          <Filter className="filter-icon" />
          <div className="filters-buttons">
            {filters.map(filterOption => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={filter === filterOption.value ? 'filter-button filter-button-active' : 'filter-button filter-button-default'}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${!notification.is_read ? 'notification-card-unread' : ''}`}
            >
              <div className="notification-container">
                <div className="notification-icon">{getNotificationIcon(notification.message)}</div>
                <div className="notification-content">
                  <div className="notification-header">
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <div className="notification-indicator" />
                    )}
                  </div>
                  <div className="notification-meta">
                    <div className="notification-time">
                      <Clock className="time-icon" />
                      <span>{formatTimeAgo(notification.created_at)}</span>
                    </div>
                    {notification.is_read && (
                      <div className="notification-read-status">
                        <CheckCircle className="check-icon" />
                        <span>Read</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3 className="empty-title">No notifications</h3>
          <p className="empty-message">
            {filter === 'unread'
              ? "You're all caught up! No unread notifications."
              : 'No notifications found for the selected time period.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;