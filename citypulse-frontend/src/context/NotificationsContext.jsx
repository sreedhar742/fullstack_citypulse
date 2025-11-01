import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from './AuthContext';
import { notificationsAPI } from '../utils/api';

const NotificationsContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated, user, accessToken: token, refreshAccessToken } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token);
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  };

  const fetchUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await notificationsAPI.getUnread();
      setNotifications(response.data);
      setUnreadCount(response.data.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let ws = null;

    const connectWebSocket = async () => {
      if (!isAuthenticated || !user) return;

      let validToken = token;

      if (!validToken || isTokenExpired(validToken)) {
        validToken = await refreshAccessToken();
        if (!validToken) return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const baseHost =
        window.location.hostname === 'localhost'
          ? 'citypulse.aicraftalchemy.com'
          : window.location.host;

      const wsUrl = `${protocol}//${baseHost}/backend/ws/notifications/?token=${validToken}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setSocket(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📬 Message received:', data);
        const newNotification = data;

        console.log('📩 New notification received:', data);
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);

        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('CityPulse Notification', {
            body: newNotification.message,
          });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket closed. Reconnecting...');
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('🚨 WebSocket error:', error);
      };
    };

    if (isAuthenticated && user) {
      connectWebSocket();
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated, user, token, refreshAccessToken]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchUnreadNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
