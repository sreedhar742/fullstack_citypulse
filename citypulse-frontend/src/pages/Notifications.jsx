// Notifications.jsx - First version merged with second version's enhanced modal UI

import { useState, useEffect } from 'react';
import {
  Bell, Clock, CheckCircle, Filter, User, Calendar,
  CheckSquare, MapPin, AlertTriangle
} from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';
import { complaintsAPI, workersAPI, notificationsAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import './notifications.css';
import StatusBadge from '../components/UI/StatusBadge';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import { all } from 'axios';  

const Notifications = () => {
  const { notifications, unreadCount } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('unread');
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [allnotifications, setAllNotifications] = useState([]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'garbage': return '🗑️';
      case 'road': return '🛣️';
      case 'water': return '💧';
      case 'lights': return '💡';
      default: return '📋';
    }
  };
  
  const filters = [
    { value: 'unread', label: 'Unread Only' },
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: 'all', label: 'All Notifications' },

  ];
useEffect(() => {
  setLoading(true);

  const filterNotifications = async () => {
    if (!notifications || notifications.length === 0) {
      setFilteredNotifications([]);
      setLoading(false);
      return;
    }

    let filtered;
    const now = new Date();

    switch (filter) {
      case '7':
        filtered = notifications.filter(n =>
          (now - new Date(n.created_at)) / (1000 * 60 * 60 * 24) < 7
        );
        break;
      case '30':
        filtered = notifications.filter(n =>
          (now - new Date(n.created_at)) / (1000 * 60 * 60 * 24) < 30
        );
        break;
      case 'all':
        try {
          const response = await notificationsAPI.getByUser(); // assuming this returns a Promise
          setAllNotifications(response);
          filtered = response.data;
        } catch (err) {
          console.error('Failed to fetch all notifications:', err);
          filtered = [];
        }
        break;
      default:
        filtered = notifications.filter(n => !n.is_read);
        break;
    }

    setFilteredNotifications(filtered);
    setLoading(false);
  };

  filterNotifications();
}, [notifications, filter]);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setShowDetailModal(true);
    setStatusLoading(true);
    try {
      const [complaintRes, workersRes] = await Promise.all([
        complaintsAPI.getStatus(notification.complaint),
        workersAPI.getAll(),
        notificationsAPI.markAsRead(notification.id),
      ]);
      setComplaintDetails(complaintRes.data[0]);
      console.log('Complaint Details:', complaintRes.data[0]);
      setAvailableWorkers(workersRes.data);
    } catch (err) {
      console.error('Error fetching complaint or workers:', err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedWorker || !complaintDetails) return;
    setIsAssigning(true);
    const data={
      complaint_id: complaintDetails.id,
      worker_id: parseInt(selectedWorker),
    }
    try {
      const task_assign=await complaintsAPI.assignTask(data);
      console.log('Task assigned:', task_assign);
      alert('Worker assigned successfully!');
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error assigning worker:", error);
    } finally {
      setIsAssigning(false);
      setSelectedWorker('');
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
    setComplaintDetails(null);
    setSelectedWorker('');
  };

  const getNotificationIcon = (message = '') => {
    if (message.toLowerCase().includes('complaint')) return '📋';
    if (message.toLowerCase().includes('assigned')) return '👷';
    if (message.toLowerCase().includes('resolved')) return '✅';
    if (message.toLowerCase().includes('urgent')) return '🚨';
    return '📢';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour ago`;
    return `${Math.floor(diffInSeconds / 86400)} day ago`;
  };

  if (loading) {
    return <div className="loading-container"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="notifications-container animate-fade-in">
      <div className="notifications-header">
        <div>
          <h1 className="notifications-title">Notifications</h1>
          <p className="notifications-subtitle">Stay updated with system activities</p>
        </div>
        <div className="unread-counter">
          <Bell className="unread-icon" />
          <span>{unreadCount} unread</span>
        </div>
      </div>

      <div className="filters-card">
        <div className="filters-container">
          <Filter className="filter-icon" />
          <div className="filters-buttons">
            {filters.map(filterOption => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={filter === filterOption.value ? 'filter-button-active' : 'filter-button-default'}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredNotifications.length > 0 ? (
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`notification-card ${!notification.is_read ? 'notification-card-unread' : ''}`}
            >
              <div className="notification-container">
                <div className="notification-icon">{getNotificationIcon(notification.message)}</div>
                <div className="notification-content">
                  <div className="notification-header">
                    <p className="notification-message">{notification.message}</p>
                    {!notification.is_read && <div className="notification-indicator" />}
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
            {filter === 'unread' ? "You're all caught up!" : 'No notifications for selected filter.'}
          </p>
        </div>
      )}

      <Modal isOpen={showDetailModal} onClose={closeModal} title="Complaint Details" size="lg">
        {statusLoading ? (
          <div className="status-loading">
            <LoadingSpinner size="md" />
            <span>Loading complaint details...</span>
          </div>
        ) : complaintDetails ? (
          <div className="detail-container">
            <div className="detail-header">
              <div className="detail-icon">{getCategoryIcon(complaintDetails.category)}</div>
              <div className="detail-info">
                <h3 className="detail-title">{complaintDetails.title}</h3>
                <div className="detail-meta">
                  <StatusBadge status={complaintDetails.severity} type="severity" />
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{complaintDetails.location_lat}, {complaintDetails.location_lng}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="detail-section">
              <h4 className="detail-section-title">Description</h4>
              <p className="detail-description">{complaintDetails.description}</p>
            </div>
            <div className="detail-section">
              <h4 className="detail-section-title">Submitted</h4>
              <div className="detail-date">
                <Calendar className="detail-icon-sm" />
                <span>{new Date(complaintDetails.created_at).toLocaleDateString()}</span>
              </div>
              <div className="detail-reported-by">
                <User className="detail-icon-sm" />
                <span>{complaintDetails.user}</span>
              </div>
            </div>
            
            {complaintDetails.image && (
              <div className="detail-section">
                <h4 className="detail-section-title">Image</h4>
                <img
                  src={complaintDetails.image}
                  alt="Complaint"
                  className="detail-image"
                />
              </div>
            )}
            {complaintDetails.location_lat && complaintDetails.location_lng && (
              <div className="detail-map-container">
                <MapContainer
                  center={[parseFloat(complaintDetails.location_lat), parseFloat(complaintDetails.location_lng)]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: '250px', width: '100%', borderRadius: '8px', marginTop: '10px' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[parseFloat(complaintDetails.location_lat), parseFloat(complaintDetails.location_lng)]}>
                    <Popup>Complaint Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}
            <div className="assignment-section">
              <h4 className="detail-section-title">Assign Worker</h4>
              <select
                className="worker-select"
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
              >
                <option value="">-- Select Worker --</option>
                {availableWorkers.filter(w => w.active).map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} - {w.specialization}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignWorker}
                disabled={!selectedWorker || isAssigning}
                className="assign-button"
              >
                {isAssigning ? 'Assigning...' : <><CheckSquare className="assign-icon" /> Assign Worker</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="status-unavailable">
            <p>Status information is not available at this time.</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;