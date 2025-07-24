import { useState, useEffect } from 'react';
import { Plus, Search, Users as UsersIcon, Shield, Wrench } from 'lucide-react';
import { usersAPI } from '../utils/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import Modal from '../components/UI/Modal';
import './users.css';

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
        return <Shield className="role-icon role-icon-admin" />;
      case 'worker':
        return <Wrench className="role-icon role-icon-worker" />;
      default:
        return <UsersIcon className="role-icon role-icon-citizen" />;
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
      <div className="loading-container">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Header */}
      <div className="users-header">
        <div>
          <h1 className="users-title">Users</h1>
          <p className="users-subtitle">Manage system users and their roles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="add-user-btn"
        >
          <Plus className="btn-icon w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="role-select"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          <div className="user-count">
            <UsersIcon className="count-icon" />
            {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="users-grid">
          {filteredUsers.map((userData) => (
            <div key={userData.user.id} className="user-card">
              <div className="user-card-header">
                <div className="user-info">
                  <div className="user-avatar">
                    <span className="avatar-text">
                      {userData.user.first_name?.[0] || userData.user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="user-name">
                      {userData.user.first_name && userData.user.last_name
                        ? `${userData.user.first_name} ${userData.user.last_name}`
                        : userData.user.username}
                    </h3>
                    <p className="user-email">{userData.user.email}</p>
                  </div>
                </div>
                {userData.profile && (
                  <div className="user-role">
                    {getRoleIcon(userData.profile.role)}
                    <span className={`badge ${getRoleBadge(userData.profile.role)}`}>
                      {userData.profile.role}
                    </span>
                  </div>
                )}
              </div>

              {userData.profile && (
                <div className="user-details">
                  {userData.profile.phone && (
                    <div className="detail-row">
                      <span className="detail-label">Phone:</span>
                      <span className="detail-value">{userData.profile.phone}</span>
                    </div>
                  )}
                  {userData.profile.address && (
                    <div className="address-row">
                      <span className="detail-label">Address:</span>
                      <span className="address-value">{userData.profile.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3 className="empty-title">No users found</h3>
          <p className="empty-message">
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
        <form onSubmit={handleAddUser} className="form-grid">
          <div className="form-grid-2">
            <div>
              <label className="form-label">
                Username *
              </label>
              <input
                type="text"
                required
                className="form-input"
                value={newUser.user.username}
                onChange={(e) => handleInputChange('user', 'username', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">
                Email *
              </label>
              <input
                type="email"
                required
                className="form-input"
                value={newUser.user.email}
                onChange={(e) => handleInputChange('user', 'email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">
                First Name
              </label>
              <input
                type="text"
                className="form-input"
                value={newUser.user.first_name}
                onChange={(e) => handleInputChange('user', 'first_name', e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">
                Last Name
              </label>
              <input
                type="text"
                className="form-input"
                value={newUser.user.last_name}
                onChange={(e) => handleInputChange('user', 'last_name', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">
              Password *
            </label>
            <input
              type="password"
              required
              className="form-input"
              value={newUser.user.password}
              onChange={(e) => handleInputChange('user', 'password', e.target.value)}
            />
          </div>

          <div className="form-grid-2">
            <div>
              <label className="form-label">
                Role *
              </label>
              <select
                className="form-select"
                value={newUser.profile.role}
                onChange={(e) => handleInputChange('profile', 'role', e.target.value)}
              >
                <option value="citizen">Citizen</option>
                <option value="admin">Administrator</option>
                <option value="worker">Worker</option>
              </select>
            </div>
            <div>
              <label className="form-label">
                Phone
              </label>
              <input
                type="tel"
                className="form-input"
                value={newUser.profile.phone}
                onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">
              Address
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={newUser.profile.address}
              onChange={(e) => handleInputChange('profile', 'address', e.target.value)}
            />
          </div>

          <div className="form-actions">
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