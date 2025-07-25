import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { complaintsAPI, usersAPI, workersAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import StatusBadge from '../components/UI/StatusBadge';
import './dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
    totalWorkers: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [complaintsRes, usersRes, workersRes] = await Promise.all([
        complaintsAPI.getAll(),
        usersAPI.getAll(),
        workersAPI.getAll(),
      ]);

      const complaints = complaintsRes.data;
      const users = usersRes.data;
      const workers = workersRes.data;

      setStats({
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter(c => c.status === 'pending').length,
        resolvedComplaints: complaints.filter(c => c.status === 'resolved').length,
        totalUsers: users.length,
        totalWorkers: workers.length,
      });

      setRecentComplaints(complaints.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatClick = (title) => {
    if (title === 'Total Users') {
      navigate('/users');
    } else if (title === 'Total Workers') {
      navigate('/workers');
    }
  };

  const statCards = [
    {
      title: 'Total Complaints',
      value: stats.totalComplaints,
      icon: FileText,
      color: 'primary',
      change: '+12%',
    },
    {
      title: 'Pending',
      value: stats.pendingComplaints,
      icon: Clock,
      color: 'warning',
      change: '-5%',
    },
    {
      title: 'Resolved',
      value: stats.resolvedComplaints,
      icon: CheckCircle,
      color: 'success',
      change: '+18%',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'primary',
      change: '+8%',
    },
    {
      title: 'Total Workers',
      value: stats.totalWorkers,
      icon: Users,
      color: 'secondary',
      change: '+10%',
    },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'garbage': return '🗑️';
      case 'road': return '🛣️';
      case 'water': return '💧';
      case 'lights': return '💡';
      default: return '📋';
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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening in your city.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="dashboard-stats">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="card stat-card cursor-pointer hover:shadow-lg transition"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleStatClick(stat.title)}
            >
              <div className="stat-card-header">
                <div>
                  <p className="stat-card-title">{stat.title}</p>
                  <p className="stat-card-value">{stat.value}</p>
                  <div className="stat-card-change">
                    <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`stat-card-icon-container bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-activity">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Complaints</h2>
            <Link to="/complaints" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="card-body">
            {recentComplaints.length > 0 ? (
              <div className="complaints-list">
                {recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="complaint-item">
                    <div className="complaint-icon">{getCategoryIcon(complaint.category)}</div>
                    <div className="complaint-content">
                      <p className="complaint-title">{complaint.title}</p>
                      <p className="complaint-description">{complaint.description}</p>
                      <div className="complaint-meta">
                        <StatusBadge status={complaint.severity} type="severity" />
                        <span className="text-xs text-gray-400">•</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>Location: {complaint.location_lat}, {complaint.location_lng}</span>
                        </div>
                      </div>
                    </div>
                    <div className="complaint-date">
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent complaints</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="actions-grid">
              <Link to="/complaints/new" className="action-item">
                <div className="action-icon-container bg-primary-100">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div className="action-content">
                  <p className="action-title">File New Complaint</p>
                  <p className="action-description">Report a new issue in your area</p>
                </div>
              </Link>
              <Link to="/users" className="action-item">
                <div className="action-icon-container bg-success-100">
                  <Users className="w-5 h-5 text-success-600" />
                </div>
                <div className="action-content">
                  <p className="action-title">Manage Users</p>
                  <p className="action-description">Add or manage system users</p>
                </div>
              </Link>
              <Link to="/notifications" className="action-item">
                <div className="action-icon-container bg-warning-100">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                </div>
                <div className="action-content">
                  <p className="action-title">View Notifications</p>
                  <p className="action-description">Check recent system notifications</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
