import { useState, useEffect } from 'react';
import { Plus, Search, Users as UsersIcon, Shield, Wrench } from 'lucide-react';
import { usersAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    user: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
    },
    profile: {
      role: 'citizen',
      phone: '',
      address: '',
    },
  });

  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: 'citizen', label: 'Citizens' },
    { value: 'admin', label: 'Administrators' },
    { value: 'worker', label: 'Workers' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole]);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.user.first_name} ${user.user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.profile?.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-danger-600" />;
      case 'worker':
        return <Wrench className="w-4 h-4 text-warning-600" />;
      default:
        return <UsersIcon className="w-4 h-4 text-primary-600" />;
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-danger';
      case 'worker':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.addWorkerOrUser(newUser);
      setShowAddModal(false);
      setNewUser({
        user: {
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          password: '',
        },
        profile: {
          role: 'citizen',
          phone: '',
          address: '',
        },
      });
      fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleInputChange = (section, field, value) => {
    setNewUser(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and their roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="input"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <UsersIcon className="w-4 h-4 mr-2" />
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((userData) => (
            <div key={userData.user.id} className="card p-6 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {userData.user.first_name?.[0] || userData.user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {userData.user.first_name && userData.user.last_name
                        ? `${userData.user.first_name} ${userData.user.last_name}`
                        : userData.user.username}
                    </h3>
                    <p className="text-sm text-gray-500">{userData.user.email}</p>
                  </div>
                </div>
                {userData.profile && (
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(userData.profile.role)}
                    <span className={`badge ${getRoleBadge(userData.profile.role)}`}>
                      {userData.profile.role}
                    </span>
                  </div>
                )}
              </div>

              {userData.profile && (
                <div className="space-y-2 text-sm">
                  {userData.profile.phone && (
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium mr-2">Phone:</span>
                      <span>{userData.profile.phone}</span>
                    </div>
                  )}
                  {userData.profile.address && (
                    <div className="flex items-start text-gray-600">
                      <span className="font-medium mr-2">Address:</span>
                      <span className="line-clamp-2">{userData.profile.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedRole !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first user.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleAddUser} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                required
                className="input"
                value={newUser.user.username}
                onChange={(e) => handleInputChange('user', 'username', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                className="input"
                value={newUser.user.email}
                onChange={(e) => handleInputChange('user', 'email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                className="input"
                value={newUser.user.first_name}
                onChange={(e) => handleInputChange('user', 'first_name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                className="input"
                value={newUser.user.last_name}
                onChange={(e) => handleInputChange('user', 'last_name', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              className="input"
              value={newUser.user.password}
              onChange={(e) => handleInputChange('user', 'password', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role *
              </label>
              <select
                className="input"
                value={newUser.profile.role}
                onChange={(e) => handleInputChange('profile', 'role', e.target.value)}
              >
                <option value="citizen">Citizen</option>
                <option value="admin">Administrator</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                className="input"
                value={newUser.profile.phone}
                onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              className="input resize-none"
              rows={3}
              value={newUser.profile.address}
              onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Add User
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;