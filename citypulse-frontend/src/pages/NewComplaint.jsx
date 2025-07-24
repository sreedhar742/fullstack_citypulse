import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Camera, Send } from 'lucide-react';
import { complaintsAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';

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
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="animate-bounce-in">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your complaint has been successfully submitted and will be reviewed by our team.
          </p>
          <p className="text-sm text-gray-500">Redirecting to complaints page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/complaints')}
          className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">File New Complaint</h1>
          <p className="text-gray-600 mt-1">Report an issue in your area</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                className="input resize-none"
                placeholder="Provide detailed information about the issue"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category *</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <label
                key={category.value}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  formData.category === category.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={category.value}
                  checked={formData.category === category.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="text-2xl mr-3">{category.icon}</div>
                <span className="font-medium text-gray-900">{category.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity Selection */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Priority Level *</h2>
          <div className="space-y-3">
            {severities.map((severity) => (
              <label
                key={severity.value}
                className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  formData.severity === severity.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="severity"
                  value={severity.value}
                  checked={formData.severity === severity.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{severity.label}</div>
                  <div className="text-sm text-gray-600">{severity.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location *</h2>
          <div className="space-y-4">
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn-secondary w-full"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Use Current Location
            </button>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Photo (Optional)</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="text-sm text-gray-600">
                Click to upload a photo or drag and drop
              </span>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="sr-only"
              />
            </label>
            {formData.image && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {formData.image.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
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
            className="btn-primary flex items-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Send className="w-4 h-4" />
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