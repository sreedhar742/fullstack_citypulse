import { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  Filter, 
  X, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckSquare, 
  Briefcase,
  MapPin,
  MoreVertical,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { notificationsAPI, complaintsAPI, workersAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatusBadge from '../components/UI/StatusBadge';
import Modal from '../components/UI/Modal';
import './notifications.css';

// Import map components if needed
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [complaintStatus, setComplaintStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

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
          response = await notificationsAPI.getByUser();
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

  const handleNotificationClick = async (notification) => {
    if (!notification.complaint) return;
    console.log('Notification clicked:', notification);
    
    setSelectedNotification(notification);
    setStatusLoading(true);
    setShowDetailModal(true);
    
    try {
      // Mark notification as read
      // if (!notification.is_read) {
      //   await notificationsAPI.markAsRead(notification.id);
      //   // Update notification in state
      //   setNotifications(prevNotifications => 
      //     prevNotifications.map(n => 
      //       n.id === notification.id ? { ...n, is_read: true } : n
      //     )
      //   );
      // }
      
      // Fetch complaint status - this contains the complete complaint info
      const statusResponse = await complaintsAPI.getStatus(notification.complaint);
      console.log('Complaint Status:', statusResponse.data);
      setComplaintStatus(statusResponse.data);
      
      // Fetch available workers
      const workersResponse = await workersAPI.getAll();
      console.log('Available Workers:', workersResponse.data);
      setAvailableWorkers(workersResponse.data);
    } catch (error) {
      console.error('Error fetching complaint details:', error);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedWorker || !complaintStatus) return;
    
    setIsAssigning(true);
    try {
      // Call API to assign worker
      await complaintsAPI.assignWorker(complaintStatus.id, parseInt(selectedWorker));
      
      // Update complaint status
      setComplaintStatus(prev => ({
        ...prev,
        status: "assigned",
        assigned_to: availableWorkers.find(w => w.id === parseInt(selectedWorker))?.name || "Unknown Worker"
      }));
      
      // Wait a moment before closing modal
      setTimeout(() => {
        setShowDetailModal(false);
        setSelectedNotification(null);
        setComplaintStatus(null);
        setSelectedWorker("");
        
        // Refresh notifications
        fetchNotifications();
      }, 1500);
    } catch (error) {
      console.error("Error assigning worker:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
    setComplaintStatus(null);
    setSelectedWorker("");
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

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'garbage':
        return '🗑️';
      case 'road':
        return '🛣️';
      case 'water':
        return '💧';
      case 'lights':
        return '💡';
      default:
        return '📋';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="status-icon status-icon-pending" />;
      case 'in_progress':
        return <AlertTriangle className="status-icon status-icon-progress" />;
      case 'resolved':
        return <CheckCircle className="status-icon status-icon-resolved" />;
      case 'assigned':
        return <CheckSquare className="status-icon status-icon-assigned" />;
      default:
        return <Clock className="status-icon status-icon-pending" />;
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
              onClick={() => handleNotificationClick(notification)}
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

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={closeModal}
        title="Complaint Details"
        size="lg"
      >
        {(
          <div className="detail-container">
            {/* Loading State */}
            {statusLoading ? (
              <div className="status-loading">
                <LoadingSpinner size="md" />
                <span>Loading complaint details...</span>
              </div>
            ) : complaintStatus ? (
              <>
                {/* Complaint Header */}
                
                <div className="detail-header">
                  <div className="detail-icon">{getCategoryIcon(complaintStatus.category)}</div>
                  <div className="detail-info">
                    <h3 className="detail-title">{complaintStatus[0].title}</h3>
                    <div className="detail-meta">
                      {complaintStatus.severity && (
                        <StatusBadge status={complaintStatus.severity} type="severity" />
                      )}
                      <span className="detail-category">{complaintStatus[0].category}</span>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="status-section">
                  <h4 className="detail-section-title">Current Status</h4>
                  <div className="status-info">
                    <div className="status-header">
                      {getStatusIcon(complaintStatus.status)}
                      <div className="status-details">
                        <div className="status-label">
                          Status: <span className={`status-value status-${complaintStatus.status}`}>
                            {complaintStatus[0].status.replace('_', ' ')}
                          </span>
                        </div>
                        {complaintStatus.assigned_to && (
                          <div className="status-assignee">
                            Assigned to: <span className="assignee-name">{complaintStatus.assigned_to}</span>
                          </div>
                        )}
                        {complaintStatus.updated_at && (
                          <div className="status-updated">
                            Last updated: <span className="updated-time">
                              {new Date(complaintStatus.updated_at).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {complaintStatus.notes && (
                      <div className="status-notes">
                        <p className="notes-title">Notes:</p>
                        <p className="notes-content">{complaintStatus[0].description}</p>
                      </div>
                    )}
                    {complaintStatus.estimated_completion && (
                      <div className="estimated-completion">
                        <p className="completion-title">Estimated completion:</p>
                        <p className="completion-date">
                          {new Date(complaintStatus.estimated_completion).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="detail-section">
                  <h4 className="detail-section-title">Description</h4>
                  <p className="detail-description">{complaintStatus[0].description}</p>
                </div>

                {/* Location and Date Grid */}
                <div className="detail-grid">
                  {/* Location with Map */}
                  <div className="detail-section">
                    <h4 className="detail-section-title">Location</h4>
                    {complaintStatus[0].location_lat && complaintStatus[0].location_lng && (
                      <div className="detail-map-container">
                        <MapContainer
                          center={[
                            parseFloat(complaintStatus[0].location_lat),
                            parseFloat(complaintStatus[0].location_lng),
                          ]}
                          zoom={16}
                          scrollWheelZoom={false}
                          style={{ height: '250px', width: '100%', borderRadius: '8px', marginTop: '10px' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker
                            position={[
                              parseFloat(complaintStatus[0].location_lat),
                              parseFloat(complaintStatus[0].location_lng),
                            ]}
                          >
                            <Popup>Complaint Location</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    )}
                  </div>
                  
                  {/* Submission Date */}
                  <div className="detail-section">
                    <h4 className="detail-section-title">Submitted</h4>
                    <div className="detail-date">
                      <Calendar className="detail-icon-sm" />
                      <span>{new Date(complaintStatus[0].created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-reported-by">
                      <User className="detail-icon-sm" />
                      <span>Reported by: {complaintStatus[0].user}</span>
                    </div>
                  </div>
                </div>

                {/* Worker Assignment Section */}
                {(complaintStatus.status === 'pending' || !complaintStatus.assigned_to) && (
                  <div className="assignment-section">
                    <h4 className="detail-section-title">Assign Worker</h4>
                    <div className="assignment-form">
                      <div className="worker-select-container">
                        <label htmlFor="worker-select" className="worker-select-label">Select Worker:</label>
                        <select
                          id="worker-select"
                          value={selectedWorker}
                          onChange={(e) => setSelectedWorker(e.target.value)}
                          className="worker-select"
                        >
                          <option value="">-- Select Worker --</option>
                          {availableWorkers
                            .filter(worker => worker.active)
                            .map(worker => (
                              <option key={worker.id} value={worker.id}>
                                {worker.name} - {worker.specialization}
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      <button
                        onClick={handleAssignWorker}
                        disabled={!selectedWorker || isAssigning}
                        className="assign-button"
                      >
                        {isAssigning ? (
                          <>
                            <LoadingSpinner size="sm" />
                            <span>Assigning...</span>
                          </>
                        ) : (
                          <>
                            <CheckSquare className="assign-icon" />
                            Assign Worker
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="status-unavailable">
                <p>Status information is not available at this time.</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Notifications;