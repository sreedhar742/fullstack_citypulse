import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  Eye,
  MoreVertical
} from 'lucide-react';
import { complaintsAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatusBadge from '../components/UI/StatusBadge';
import Modal from '../components/UI/Modal';
import './complaints.css';

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'garbage', label: 'Garbage' },
    { value: 'road', label: 'Road' },
    { value: 'water', label: 'Water' },
    { value: 'lights', label: 'Street Lights' },
  ];

  const severities = [
    { value: 'all', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
  ];

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, searchTerm, selectedCategory, selectedSeverity]);

  const fetchComplaints = async () => {
    try {
      const response = await complaintsAPI.getAll();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = complaints;

    if (searchTerm) {
      filtered = filtered.filter(complaint =>
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(complaint => complaint.category === selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(complaint => complaint.severity === selectedSeverity);
    }

    setFilteredComplaints(filtered);
  };

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

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="complaints-container">
      {/* Header */}
      <div className="complaints-header">
        <div>
          <h1 className="complaints-title">Complaints</h1>
          <p className="complaints-subtitle">Manage and track all citizen complaints</p>
        </div>
        <Link to="/complaints/new" className="new-complaint-btn">
          <Plus className="new-complaint-icon" />
          New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search complaints..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="filter-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            {severities.map(severity => (
              <option key={severity.value} value={severity.value}>
                {severity.label}
              </option>
            ))}
          </select>

          <div className="filter-count">
            <Filter className="filter-count-icon" />
            {filteredComplaints.length} of {complaints.length} complaints
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length > 0 ? (
        <div className="complaints-grid">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card">
              <div className="card-content">
                <div className="card-header">
                  <div className="category-info">
                    <div className="category-icon">{getCategoryIcon(complaint.category)}</div>
                    <div>
                      <h3 className="complaint-title">
                        {complaint.title}
                      </h3>
                      <p className="complaint-category">
                        {complaint.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetails(complaint)}
                    className="more-btn"
                  >
                    <MoreVertical className="more-icon" />
                  </button>
                </div>

                <p className="complaint-description">
                  {complaint.description}
                </p>

                <div className="card-meta">
                  <StatusBadge status={complaint.severity} type="severity" />
                  <div className="card-location">
                    <MapPin className="location-icon" />
                    <span>Location</span>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="card-date">
                    <Calendar className="date-icon" />
                    <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(complaint)}
                    className="view-btn"
                  >
                    <Eye className="view-icon" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3 className="empty-title">No complaints found</h3>
          <p className="empty-message">
            {searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by filing your first complaint.'}
          </p>
          <Link to="/complaints/new" className="new-complaint-btn">
            <Plus className="new-complaint-icon" />
            File New Complaint
          </Link>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Complaint Details"
        size="lg"
      >
        {selectedComplaint && (
          <div className="detail-container">
            <div className="detail-header">
              <div className="detail-icon">{getCategoryIcon(selectedComplaint.category)}</div>
              <div className="detail-info">
                <h3 className="detail-title">
                  {selectedComplaint.title}
                </h3>
                <div className="detail-meta">
                  <StatusBadge status={selectedComplaint.severity} type="severity" />
                  <span className="detail-category">
                    {selectedComplaint.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-section-title">Description</h4>
              <p className="detail-description">{selectedComplaint.description}</p>
            </div>

            <div className="detail-grid">
              <div className="detail-section">
                <h4 className="detail-section-title">Location</h4>
                <div className="detail-location">
                  <MapPin className="detail-icon-sm" />
                  <span>
                    {selectedComplaint.location_lat}, {selectedComplaint.location_lng}
                  </span>
                </div>
              </div>
              <div className="detail-section">
                <h4 className="detail-section-title">Submitted</h4>
                <div className="detail-date">
                  <Calendar className="detail-icon-sm" />
                  <span>{new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {selectedComplaint.image && (
              <div className="detail-section">
                <h4 className="detail-section-title">Image</h4>
                <img
                  src={selectedComplaint.image}
                  alt="Complaint"
                  className="detail-image"
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Complaints;