import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const Dashboard = () => {
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

      // Get recent complaints (last 5)
      setRecentComplaints(complaints.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
  ];

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening in your city.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card p-6 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-success-500 mr-1" />
                    <span className="text-sm text-success-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Complaints */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Complaints</h2>
              <Link to="/complaints" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentComplaints.length > 0 ? (
              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <div key={complaint.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-2xl">{getCategoryIcon(complaint.category)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {complaint.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {complaint.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <StatusBadge status={complaint.severity} type="severity" />
                        <span className="text-xs text-gray-400">•</span>
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>Location: {complaint.location_lat}, {complaint.location_lng}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
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

        {/* Quick Actions */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/complaints/new"
                className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-primary-100 group-hover:bg-primary-200 transition-colors">
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">File New Complaint</p>
                  <p className="text-xs text-gray-500">Report a new issue in your area</p>
                </div>
              </Link>

              <Link
                to="/users"
                className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-success-100 group-hover:bg-success-200 transition-colors">
                  <Users className="w-5 h-5 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Manage Users</p>
                  <p className="text-xs text-gray-500">Add or manage system users</p>
                </div>
              </Link>

              <Link
                to="/notifications"
                className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-warning-100 group-hover:bg-warning-200 transition-colors">
                  <AlertTriangle className="w-5 h-5 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">View Notifications</p>
                  <p className="text-xs text-gray-500">Check recent system notifications</p>
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