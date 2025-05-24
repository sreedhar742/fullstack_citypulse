import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { ComplaintStatus } from "../../types/complaints";
import complaintsService from "../../api/complaintsService";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

function Dashboard() {
  const { user } = useAuth();
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Get complaints (we'll filter on the frontend for now)
        const complaints = await complaintsService.getAllComplaints();

        // Get the 5 most recent complaints
        const recent = complaints.slice(0, 5);
        setRecentComplaints(recent);

        // Calculate stats
        setStats({
          total: complaints.length,
          pending: complaints.filter(
            (c) => c.status === ComplaintStatus.PENDING,
          ).length,
          inProgress: complaints.filter(
            (c) => c.status === ComplaintStatus.IN_PROGRESS,
          ).length,
          resolved: complaints.filter(
            (c) => c.status === ComplaintStatus.RESOLVED,
          ).length,
          closed: complaints.filter((c) => c.status === ComplaintStatus.CLOSED)
            .length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {user?.firstName || user?.username}
        </h1>
        <Link to="/complaints/new" className="btn btn-primary">
          <PlusCircle size={18} className="mr-2" />
          New Complaint
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-teal-100 dark:bg-teal-900 p-3 rounded-full">
              <FileText className="h-6 w-6 text-teal-700 dark:text-teal-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Complaints
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.total}
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <Clock className="h-6 w-6 text-yellow-700 dark:text-yellow-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.pending}
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                In Progress
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.inProgress}
              </h3>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-700 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Resolved
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.resolved}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent complaints */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Complaints
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        ) : recentComplaints.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentComplaints.map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="block p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-150"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      {complaint.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                      {complaint.description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={complaint.status} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No complaints yet"
            description="Create your first complaint to get started."
            icon={<FileText size={48} />}
            action={
              <Link to="/complaints/new" className="btn btn-primary">
                <PlusCircle size={18} className="mr-2" />
                New Complaint
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
