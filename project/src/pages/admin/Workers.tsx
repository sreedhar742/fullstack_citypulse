import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Briefcase, Search, X } from "lucide-react";
import usersService from "../../api/usersService";
import complaintsService from "../../api/complaintsService";
import { User } from "../../types/auth";
import { Complaint } from "../../types/complaints";
import EmptyState from "../../components/ui/EmptyState";

function Workers() {
  const [workers, setWorkers] = useState<User[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<User[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch workers
        const workersData = await usersService.getAllWorkers();
        setWorkers(workersData);
        setFilteredWorkers(workersData);

        // Fetch complaints to get assignment data
        const complaintsData = await complaintsService.getAllComplaints();
        setComplaints(complaintsData);
      } catch (error) {
        console.error("Failed to fetch workers data:", error);
        toast.error("Failed to load workers");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const results = workers.filter(
        (worker) =>
          worker.username.toLowerCase().includes(query) ||
          worker.email.toLowerCase().includes(query) ||
          (worker.firstName &&
            worker.firstName.toLowerCase().includes(query)) ||
          (worker.lastName && worker.lastName.toLowerCase().includes(query)),
      );
      setFilteredWorkers(results);
    } else {
      setFilteredWorkers(workers);
    }
  }, [workers, searchQuery]);

  // Calculate stats for each worker
  const getWorkerStats = (workerId: number) => {
    const assignedComplaints = complaints.filter(
      (complaint) => complaint.assignedTo?.id === workerId,
    );

    const assignedCount = assignedComplaints.length;
    const resolvedCount = assignedComplaints.filter(
      (complaint) =>
        complaint.status === "resolved" || complaint.status === "closed",
    ).length;

    return {
      assignedCount,
      resolvedCount,
      pendingCount: assignedCount - resolvedCount,
    };
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Workers
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          View workers and their assigned complaints
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 card p-4">
        <div className="max-w-md">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search Workers
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="search"
              placeholder="Search by name or email..."
              className="input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Workers list */}
      {loading ? (
        <div className="p-6 text-center card">
          <p className="text-gray-500 dark:text-gray-400">Loading workers...</p>
        </div>
      ) : filteredWorkers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkers.map((worker) => {
            const stats = getWorkerStats(worker.id);

            return (
              <div key={worker.id} className="card">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      {worker.profilePicture ? (
                        <img
                          src={worker.profilePicture}
                          alt={worker.username}
                          className="h-12 w-12 rounded-full"
                        />
                      ) : (
                        <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {worker.firstName && worker.lastName
                          ? `${worker.firstName} ${worker.lastName}`
                          : worker.username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {worker.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Assigned complaints:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {stats.assignedCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Resolved:
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {stats.resolvedCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Pending:
                      </span>
                      <span className="font-medium text-yellow-600 dark:text-yellow-400">
                        {stats.pendingCount}
                      </span>
                    </div>
                  </div>

                  {stats.assignedCount > 0 && (
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                          <div
                            style={{
                              width: `${(stats.resolvedCount / stats.assignedCount) * 100}%`,
                            }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                          ></div>
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                        {Math.round(
                          (stats.resolvedCount / stats.assignedCount) * 100,
                        )}
                        % completed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No workers found"
          description={
            searchQuery
              ? "No workers match your search criteria."
              : "There are no workers in the system yet."
          }
          icon={<Briefcase size={48} />}
          action={
            searchQuery ? (
              <button
                onClick={() => setSearchQuery("")}
                className="btn btn-secondary"
              >
                Clear Search
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}

export default Workers;
