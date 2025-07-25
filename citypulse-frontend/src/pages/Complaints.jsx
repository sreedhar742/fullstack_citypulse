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
          <h1 className="text-3xl font-bold text-gray-900">Complaints</h1>
          <p className="text-gray-600 mt-1">Manage and track all citizen complaints</p>
        </div>
        <Link to="/complaints/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Complaint
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search complaints..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input"
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
            className="input"
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
          >
            {severities.map(severity => (
              <option key={severity.value} value={severity.value}>
                {severity.label}
              </option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            {filteredComplaints.length} of {complaints.length} complaints
          </div>
        </div>
      </div>

      {/* Complaints Grid */}
      {filteredComplaints.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="card hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getCategoryIcon(complaint.category)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {complaint.category}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewDetails(complaint)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {complaint.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={complaint.severity} type="severity" />
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>Location</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(complaint)}
                    className="btn-secondary text-xs px-3 py-1"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by filing your first complaint.'}
          </p>
          <Link to="/complaints/new" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
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
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">{getCategoryIcon(selectedComplaint.category)}</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {selectedComplaint.title}
                </h3>
                <div className="flex items-center space-x-4 mb-4">
                  <StatusBadge status={selectedComplaint.severity} type="severity" />
                  <span className="text-sm text-gray-500 capitalize">
                    {selectedComplaint.category}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-600">{selectedComplaint.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>
                    {selectedComplaint.location_lat}, {selectedComplaint.location_lng}
                  </span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Submitted</h4>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {selectedComplaint.image && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Image</h4>
                <img
                  src={selectedComplaint.image}
                  alt="Complaint"
                  className="w-full h-48 object-cover rounded-lg"
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