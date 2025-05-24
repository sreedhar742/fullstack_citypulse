import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import complaintsService from "../../api/complaintsService";
import usersService from "../../api/usersService";
import {
  Complaint,
  ComplaintStatus,
  StatusUpdateData,
  canUpdateStatus,
  getAvailableStatusOptions,
} from "../../types/complaints";
import { User as UserType, UserRole } from "../../types/auth";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

function ComplaintDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [workers, setWorkers] = useState<UserType[]>([]);

  // Status update form
  const [statusComment, setStatusComment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ComplaintStatus | "">(
    "",
  );
  const [selectedWorker, setSelectedWorker] = useState<number | "">("");

  useEffect(() => {
    const fetchComplaint = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await complaintsService.getComplaintById(parseInt(id));
        setComplaint(data);

        // If user is admin, fetch workers
        if (user?.role === UserRole.ADMIN) {
          const workersData = await usersService.getAllWorkers();
          setWorkers(workersData);
        }
      } catch (error) {
        console.error("Failed to fetch complaint:", error);
        toast.error("Failed to load complaint details");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, user?.role]);

  const handleAssignWorker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!complaint || !selectedWorker) return;

    try {
      setLoadingAction(true);
      const updatedComplaint = await complaintsService.assignComplaint(
        complaint.id,
        typeof selectedWorker === "string"
          ? parseInt(selectedWorker)
          : selectedWorker,
      );
      setComplaint(updatedComplaint);
      toast.success("Worker assigned successfully");
      setSelectedWorker("");
    } catch (error) {
      console.error("Failed to assign worker:", error);
      toast.error("Failed to assign worker");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!complaint || !selectedStatus) return;

    try {
      setLoadingAction(true);

      const statusData: StatusUpdateData = {
        status: selectedStatus,
        comment: statusComment,
      };

      const updatedComplaint = await complaintsService.updateComplaintStatus(
        complaint.id,
        statusData,
      );

      setComplaint(updatedComplaint);
      toast.success(`Status updated to ${selectedStatus}`);

      // Reset form
      setSelectedStatus("");
      setStatusComment("");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setLoadingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Loading complaint details...
        </p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <EmptyState
        title="Complaint not found"
        description="The complaint you're looking for does not exist or has been removed."
        action={
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </button>
        }
      />
    );
  }

  const availableStatusOptions = complaint
    ? getAvailableStatusOptions(complaint.status)
    : [];
  const canUpdate = user ? canUpdateStatus(user.role, complaint) : false;

  return (
    <div>
      <div className="mb-6 flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
          {complaint.title}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex justify-between mb-4">
              <StatusBadge status={complaint.status} size="lg" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Complaint #{complaint.id}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {complaint.title}
            </h2>

            <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>
                  {complaint.submittedBy.firstName ||
                    complaint.submittedBy.username}
                </span>
              </div>

              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4" />
                <span>{complaint.location}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {complaint.description}
              </p>
            </div>

            {complaint.images && complaint.images.length > 0 && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                  Images
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {complaint.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video rounded-md overflow-hidden"
                    >
                      <img
                        src={image}
                        alt={`Complaint image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status history */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status History
            </h3>

            {complaint.statusHistory && complaint.statusHistory.length > 0 ? (
              <div className="space-y-6">
                {complaint.statusHistory.map((update, index) => (
                  <div key={index} className="relative pb-6">
                    {/* Line connecting status updates */}
                    {index < complaint.statusHistory.length - 1 && (
                      <div className="absolute top-0 left-6 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                    )}

                    <div className="relative flex items-start space-x-3">
                      <div>
                        <div className="relative px-1">
                          <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                            <Clock className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">
                            <StatusBadge status={update.status} />
                            <span className="ml-2 font-medium">
                              {update.updatedBy.firstName ||
                                update.updatedBy.username}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(update.updatedAt).toLocaleString()}
                          </p>
                        </div>
                        {update.comment && (
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>{update.comment}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No status updates yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment info */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assignment
            </h3>

            {complaint.assignedTo ? (
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Assigned to:
                </p>
                <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-700 dark:text-teal-300 mr-3">
                    {complaint.assignedTo.firstName?.[0] ||
                      complaint.assignedTo.username[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {complaint.assignedTo.firstName &&
                      complaint.assignedTo.lastName
                        ? `${complaint.assignedTo.firstName} ${complaint.assignedTo.lastName}`
                        : complaint.assignedTo.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Worker
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No worker assigned yet.
              </p>
            )}

            {/* Assign worker form (admin only) */}
            {user?.role === UserRole.ADMIN && (
              <div className="mt-4">
                <form onSubmit={handleAssignWorker}>
                  <div className="mb-3">
                    <label
                      htmlFor="worker"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      {complaint.assignedTo
                        ? "Reassign to:"
                        : "Assign to worker:"}
                    </label>
                    <select
                      id="worker"
                      className="input w-full"
                      value={selectedWorker}
                      onChange={(e) => setSelectedWorker(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a worker
                      </option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.firstName && worker.lastName
                            ? `${worker.firstName} ${worker.lastName}`
                            : worker.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loadingAction || !selectedWorker}
                  >
                    {loadingAction ? "Assigning..." : "Assign Worker"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Update status form */}
          {canUpdate && availableStatusOptions.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Update Status
              </h3>

              <form onSubmit={handleStatusUpdate}>
                <div className="mb-3">
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    New Status
                  </label>
                  <select
                    id="status"
                    className="input w-full"
                    value={selectedStatus}
                    onChange={(e) =>
                      setSelectedStatus(e.target.value as ComplaintStatus)
                    }
                    required
                  >
                    <option value="" disabled>
                      Select new status
                    </option>
                    {availableStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Comment
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MessageSquare className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="comment"
                      rows={3}
                      className="input pl-10 w-full"
                      placeholder="Add a comment about this status change"
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loadingAction || !selectedStatus || !statusComment}
                >
                  {loadingAction ? "Updating..." : "Update Status"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ComplaintDetails;
