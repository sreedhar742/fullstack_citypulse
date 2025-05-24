import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, ShieldAlert, User as UserIcon, X } from "lucide-react";
import usersService from "../../api/usersService";
import { User, UserRole } from "../../types/auth";
import EmptyState from "../../components/ui/EmptyState";

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersService.getAllUsers();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    // Apply filters
    let results = users;

    if (roleFilter) {
      results = results.filter((user) => user.role === roleFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.firstName && user.firstName.toLowerCase().includes(query)) ||
          (user.lastName && user.lastName.toLowerCase().includes(query)),
      );
    }

    setFilteredUsers(results);
  }, [users, roleFilter, searchQuery]);

  const handleRoleChange = async (userId: number) => {
    try {
      const updatedUser = await usersService.updateUserRole(
        userId,
        selectedRole,
      );

      // Update the local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: updatedUser.role } : user,
        ),
      );

      setEditingUserId(null);
      toast.success(`User role updated to ${selectedRole}`);
    } catch (error) {
      console.error("Failed to update user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const resetFilters = () => {
    setRoleFilter("");
    setSearchQuery("");
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage Users
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          View and manage user accounts and permissions
        </p>
      </div>

      {/* Filters and search */}
      <div className="mb-6 card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Search users..."
                className="input pl-10 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Filter by Role
            </label>
            <select
              id="role"
              className="input w-full"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | "")}
            >
              <option value="">All Roles</option>
              <option value={UserRole.USER}>User</option>
              <option value={UserRole.WORKER}>Worker</option>
              <option value={UserRole.ADMIN}>Admin</option>
            </select>
          </div>
        </div>

        {(roleFilter || searchQuery) && (
          <div className="mt-4 flex items-center">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
              Active filters:
            </span>

            {roleFilter && (
              <span className="inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-sm mr-2">
                Role: {roleFilter}
                <button
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  onClick={() => setRoleFilter("")}
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

      {/* Users list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {user.profilePicture ? (
                            <img
                              src={user.profilePicture}
                              alt={user.username}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user.id ? (
                        <select
                          className="input"
                          value={selectedRole}
                          onChange={(e) =>
                            setSelectedRole(e.target.value as UserRole)
                          }
                          autoFocus
                        >
                          <option value={UserRole.USER}>User</option>
                          <option value={UserRole.WORKER}>Worker</option>
                          <option value={UserRole.ADMIN}>Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${
                            user.role === UserRole.ADMIN
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                              : user.role === UserRole.WORKER
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          }`}
                        >
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.dateJoined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUserId === user.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleRoleChange(user.id)}
                            className="text-teal-600 dark:text-teal-500 hover:text-teal-800 dark:hover:text-teal-400"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(user.id);
                            setSelectedRole(user.role);
                          }}
                          className="text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400"
                        >
                          Change Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No users found"
            description={
              roleFilter || searchQuery
                ? "Try adjusting your filters to see more results."
                : "There are no users in the system yet."
            }
            icon={<ShieldAlert size={48} />}
            action={
              roleFilter || searchQuery ? (
                <button onClick={resetFilters} className="btn btn-secondary">
                  Clear Filters
                </button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}

export default Users;
