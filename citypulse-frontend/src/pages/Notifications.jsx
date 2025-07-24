import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, Filter } from 'lucide-react';
import { notificationsAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

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
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with the latest system activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">
            {notifications.filter(n => !n.is_read).length} unread
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center space-x-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex space-x-2">
            {filters.map(filterOption => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterOption.value
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`card p-6 transition-all duration-200 ${
                !notification.is_read
                  ? 'border-l-4 border-l-primary-500 bg-primary-50/30'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="text-2xl">{getNotificationIcon(notification.message)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <p className="text-gray-900 font-medium">
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-2 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(notification.created_at)}</span>
                    </div>
                    {notification.is_read && (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-success-500" />
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
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-500">
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