import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, PlusCircle, Search, X } from "lucide-react";
import complaintsService from "../../api/complaintsService";
import {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
} from "../../types/complaints";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";

function Complaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "">("");
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "">(
    "",
  );

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await complaintsService.getAllComplaints();
        setComplaints(data);
        setFilteredComplaints(data);
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  useEffect(() => {
    // Apply filters
    let results = complaints;

    if (statusFilter) {
      results = results.filter(
        (complaint) => complaint.status === statusFilter,
      );
    }

    if (categoryFilter) {
      results = results.filter(
        (complaint) => complaint.category === categoryFilter,
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (complaint) =>
          complaint.title.toLowerCase().includes(query) ||
          complaint.description.toLowerCase().includes(query) ||
          complaint.location.toLowerCase().includes(query),
      );
    }

    setFilteredComplaints(results);
  }, [complaints, statusFilter, categoryFilter, searchQuery]);

  const resetFilters = () => {
    setStatusFilter("");
    setCategoryFilter("");
    setSearchQuery("");
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Complaints
        </h1>
        <Link to="/complaints/new" className="btn btn-primary">
          <PlusCircle size={18} className="mr-2" />
          New Complaint
        </Link>
      </div>

      {/* Filters and search */}
      <div className="mb-6 card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search complaints..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className="input w-full"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ComplaintStatus | "")
              }
            >
              <option value="">All Statuses</option>
              <option value={ComplaintStatus.PENDING}>Pending</option>
              <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
              <option value={ComplaintStatus.RESOLVED}>Resolved</option>
              <option value={ComplaintStatus.CLOSED}>Closed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              className="input w-full"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as ComplaintCategory | "")
              }
            >
              <option value="">All Categories</option>
              <option value={ComplaintCategory.ROAD}>Road</option>
              <option value={ComplaintCategory.WATER}>Water</option>
              <option value={ComplaintCategory.ELECTRICITY}>Electricity</option>
              <option value={ComplaintCategory.SANITATION}>Sanitation</option>
              <option value={ComplaintCategory.PUBLIC_PROPERTY}>
                Public Property
              </option>
              <option value={ComplaintCategory.OTHERS}>Others</option>
            </select>
          </div>
        </div>

        {(statusFilter || categoryFilter || searchQuery) && (
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Active filters:
            </span>

            {statusFilter && (
              <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm mr-2">
                Status: {statusFilter.replace("_", " ")}
                <button
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setStatusFilter("")}
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {categoryFilter && (
              <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm mr-2">
                Category: {categoryFilter.replace("_", " ")}
                <button
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setCategoryFilter("")}
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm mr-2">
                Search: {searchQuery}
                <button
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              </span>
            )}

            <button
              className="text-sm text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400"
              onClick={resetFilters}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Complaints list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Loading complaints...
            </p>
          </div>
        ) : filteredComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredComplaints.map((complaint) => (
                  <tr
                    key={complaint.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/complaints/${complaint.id}`}
                        className="text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 font-medium"
                      >
                        {complaint.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {complaint.category.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {complaint.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={complaint.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No complaints found"
            description={
              statusFilter || categoryFilter || searchQuery
                ? "Try adjusting your filters to see more results."
                : "Create your first complaint to get started."
            }
            icon={<FileText size={48} />}
            action={
              statusFilter || categoryFilter || searchQuery ? (
                <button onClick={resetFilters} className="btn btn-secondary">
                  Clear Filters
                </button>
              ) : (
                <Link to="/complaints/new" className="btn btn-primary">
                  <PlusCircle size={18} className="mr-2" />
                  New Complaint
                </Link>
              )
            }
          />
        )}
      </div>
    </div>
  );
}

export default Complaints;
