import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, Check } from "lucide-react";
import { toast } from "sonner";
import notificationsService from "../../api/notificationsService";
import { Notification } from "../../types/notifications";
import EmptyState from "../../components/ui/EmptyState";

function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await notificationsService.getAllNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);

      // Update the local state
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();

      // Update the local state
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true })),
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const hasUnreadNotifications = notifications.some(
    (notification) => !notification.isRead,
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h1>

        {hasUnreadNotifications && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-ghost text-teal-600 dark:text-teal-500"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 md:p-6 ${
                  !notification.isRead
                    ? "bg-teal-50 dark:bg-teal-900/10"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 pt-0.5 ${
                      !notification.isRead
                        ? "text-teal-600 dark:text-teal-500"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <Bell className="h-6 w-6" />
                  </div>

                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium ${
                          !notification.isRead
                            ? "text-teal-800 dark:text-teal-200"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {notification.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      {notification.link ? (
                        <Link
                          to={notification.link}
                          className="text-sm text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 flex items-center"
                        >
                          View details
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      ) : (
                        <span></span>
                      )}

                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No notifications"
            description="You don't have any notifications at the moment."
            icon={<Bell size={48} />}
          />
        )}
      </div>
    </div>
  );
}

export default Notifications;
