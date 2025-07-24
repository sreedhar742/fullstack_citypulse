import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, Send } from 'lucide-react';
import { complaintsAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import './new-complaint.css';

const NewComplaint = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: '',
    location_lat: '',
    location_lng: '',
    image: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = [
    { value: 'garbage', label: 'Garbage Collection', icon: '🗑️' },
    { value: 'road', label: 'Road Issues', icon: '🛣️' },
    { value: 'water', label: 'Water Supply', icon: '💧' },
    { value: 'lights', label: 'Street Lights', icon: '💡' },
  ];

  const severities = [
    { value: 'low', label: 'Low Priority', description: 'Minor issue, can wait' },
    { value: 'medium', label: 'Medium Priority', description: 'Moderate issue, needs attention' },
    { value: 'high', label: 'High Priority', description: 'Urgent issue, immediate action needed' },
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
    setError('');
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_lat: position.coords.latitude.toString(),
            location_lng: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter coordinates manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      await complaintsAPI.create(submitData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/complaints');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="success-container">
        <div className="animate-bounce-in">
          <div className="success-icon">
            <Send className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="success-title">Complaint Submitted!</h2>
          <p className="success-message">
            Your complaint has been successfully submitted and will be reviewed by our team.
          </p>
          <p className="success-redirect">Redirecting to complaints page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-container animate-fade-in">
      {/* Header */}
      <div className="complaint-header">
        <button
          onClick={() => navigate('/complaints')}
          className="back-button"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="complaint-title">File New Complaint</h1>
          <p className="complaint-subtitle">Report an issue in your area</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="card card-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">
                Title *
              </label>
              <input
                type="text"
                name="title"
                required
                className="input"
                placeholder="Brief description of the issue"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="textarea"
                placeholder="Provide detailed information about the issue"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="card card-section">
          <h2 className="section-title">Category *</h2>
          <div className="category-grid">
            {categories.map((category) => (
              <label
                key={category.value}
                className={`category-option ${formData.category === category.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={handleChange}
                  className="category-radio"
                  required
                />
                <div className="category-icon">{category.icon}</div>
                <span className="category-label">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity Selection */}
        <div className="card card-section">
          <h2 className="section-title">Priority Level *</h2>
          <div className="space-y-3">
            {severities.map((severity) => (
              <label
                key={severity.value}
                className={`severity-option ${formData.severity === severity.value ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="severity"
                  value={severity.value}
                  checked={formData.severity === severity.value}
                  onChange={handleChange}
                  className="severity-radio"
                  required
                />
                <div>
                  <div className="severity-label">{severity.label}</div>
                  <div className="severity-description">{severity.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card card-section">
          <h2 className="section-title">Location *</h2>
          <div className="space-y-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="location-btn"
            >
              <MapPin className="location-btn-icon w-4 h-4" />
              Use Current Location
            </button>
            
            <div className="coords-grid">
              <div>
                <label className="form-label">
                  Latitude *
                </label>
                <input
                  type="number"
                  name="location_lat"
                  step="any"
                  required
                  className="input"
                  placeholder="0.000000"
                  value={formData.location_lat}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label">
                  Longitude *
                </label>
                <input
                  type="number"
                  name="location_lng"
                  step="any"
                  required
                  className="input"
                  placeholder="0.000000"
                  value={formData.location_lng}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="card card-section">
          <h2 className="section-title">Photo (Optional)</h2>
          <div className="image-upload-area">
            <Camera className="image-upload-icon w-8 h-8" />
            <label className="cursor-pointer">
              <span className="image-upload-text">
                Click to upload a photo or drag and drop
              </span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="image-upload-input"
              />
            </label>
            {formData.image && (
              <p className="image-selected">
                Selected: {formData.image.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-buttons">
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Send className="btn-icon w-4 h-4" />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewComplaint;