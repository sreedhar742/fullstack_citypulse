import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, Send, AlertCircle } from 'lucide-react';
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
    image: null, // base64 string
  });
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

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

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const base64 = await convertToBase64(files[0]);
      setFormData(prev => ({ ...prev, image: base64 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    setError('');
    if (name === 'location_lat' || name === 'location_lng') {
      setLocationError('');
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = err => reject(err);
    });
  };

  const validateLocation = () => {
    const lat = parseFloat(formData.location_lat);
    const lng = parseFloat(formData.location_lng);

    if (isNaN(lat) || isNaN(lng)) {
      setLocationError('Please provide valid coordinates');
      return false;
    }

    if (lat < -90 || lat > 90) {
      setLocationError('Latitude must be between -90 and 90');
      return false;
    }

    if (lng < -180 || lng > 180) {
      setLocationError('Longitude must be between -180 and 180');
      return false;
    }

    return true;
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocationLoading(true);
      setLocationError('');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_lat: position.coords.latitude.toString(),
            location_lng: position.coords.longitude.toString(),
          }));
          setIsLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to get your location. Please enter coordinates manually.');
          setIsLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateLocation()) return;

    setLoading(true);
    setError('');

    try {
      await complaintsAPI.create(formData); // send as JSON

      setSuccess(true);
      setTimeout(() => {
        navigate('/complaints');
      }, 2000);
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);

      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.location_lat) {
        setLocationError(error.response.data.location_lat[0]);
      } else if (error.response?.data?.location_lng) {
        setLocationError(error.response.data.location_lng[0]);
      } else if (error.response?.data?.image) {
        setError(`Image error: ${error.response.data.image[0]}`);
      } else {
        setError('Failed to submit complaint. Please try again.');
      }
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
      <div className="complaint-header">
        <button onClick={() => navigate('/complaints')} className="back-button">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 >File New Complaint</h1><br />
          <h3>Report an issue in your area</h3><br />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <div className="error-message">{error}</div>}

        {/* Basic Info */}
        <div className="card card-section">
          <h2 className="section-title">Basic Information</h2>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Title *</label>
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
              <label className="form-label">Description *</label>
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

        {/* Category & Severity */}
        <div className="card card-section">
          <h2 className="section-title">Category *</h2>
          <div className="category-grid">
            {categories.map((cat) => (
              <label key={cat.value} className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={formData.category === cat.value}
                  onChange={handleChange}
                  className="category-radio"
                  required
                />
                <div className="category-icon">{cat.icon}</div>
                <span className="category-label">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card card-section">
          <h2 className="section-title">Priority Level *</h2>
          <div className="space-y-3">
            {severities.map((s) => (
              <label key={s.value} className={`severity-option ${formData.severity === s.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="severity"
                  value={s.value}
                  checked={formData.severity === s.value}
                  onChange={handleChange}
                  className="severity-radio"
                  required
                />
                <div>
                  <div className="severity-label">{s.label}</div>
                  <div className="severity-description">{s.description}</div>
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
              disabled={isLocationLoading}
              className="location-btn"
            >
              {isLocationLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <MapPin className="location-btn-icon w-4 h-4" />
              )}
              {isLocationLoading ? 'Getting Location...' : 'Use Current Location'}
            </button>

            {locationError && (
              <div className="location-error">
                <AlertCircle className="error-icon" />
                <span>{locationError}</span>
              </div>
            )}

            <div className="coords-grid">
              <div>
                <label className="form-label">Latitude *</label>
                <input
                  type="number"
                  name="location_lat"
                  step="any"
                  required
                  className={`input ${locationError ? 'input-error' : ''}`}
                  placeholder="0.000000"
                  value={formData.location_lat}
                  onChange={handleChange}
                  min="-90"
                  max="90"
                />
              </div>
              <div>
                <label className="form-label">Longitude *</label>
                <input
                  type="number"
                  name="location_lng"
                  step="any"
                  required
                  className={`input ${locationError ? 'input-error' : ''}`}
                  placeholder="0.000000"
                  value={formData.location_lng}
                  onChange={handleChange}
                  min="-180"
                  max="180"
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
              <p className="image-selected">Image selected</p>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="form-buttons">
          <button type="button" onClick={() => navigate('/complaints')} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <LoadingSpinner size="sm" /> : (
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
