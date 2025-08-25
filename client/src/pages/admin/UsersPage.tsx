import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import { Button, Input, Select, Card, Badge, Modal, LoadingSpinner } from '@/components/ui';
import { usersApi } from '@/utils/api';
import { formatDate, getRoleLabel } from '@/utils/helpers';
import { User, UserRole } from '@/types';
import toast from 'react-hot-toast';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersApi.getUsers(roleFilter || undefined);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await usersApi.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'POLICYHOLDER', label: 'Policyholder' },
    { value: 'ADJUSTER', label: 'Adjuster' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'SUPERVISOR': return 'warning';
      case 'ADJUSTER': return 'primary';
      case 'POLICYHOLDER': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <Button
          variant="primary"
          onClick={handleCreateUser}
          leftIcon={<Plus size={16} />}
        >
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          <Select
            options={roleOptions}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
            className="w-40"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.displayName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge 
                      variant={getRoleBadgeVariant(user.role) as any}
                      size="sm"
                    >
                      {getRoleLabel(user.role)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                        leftIcon={<Edit size={14} />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        leftIcon={<Trash2 size={14} />}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </Card>

      {/* User Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? 'Edit User' : 'Add New User'}
        size="md"
      >
        <UserForm
          user={editingUser}
          onSave={(user) => {
            if (editingUser) {
              setUsers(users.map(u => u.id === user.id ? user : u));
            } else {
              setUsers([...users, user]);
            }
            setShowUserModal(false);
            toast.success(`User ${editingUser ? 'updated' : 'created'} successfully`);
          }}
          onCancel={() => setShowUserModal(false)}
        />
      </Modal>
    </div>
  );
};

// User Form Component
interface UserFormProps {
  user: User | null;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    role: user?.role || 'POLICYHOLDER' as UserRole,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let savedUser: User;
      if (user) {
        const response = await usersApi.updateUser(user.id, formData);
        savedUser = response.data.data;
      } else {
        const response = await usersApi.createUser(formData);
        savedUser = response.data.data;
      }
      onSave(savedUser);
    } catch (error) {
      toast.error(`Failed to ${user ? 'update' : 'create'} user`);
    } finally {
      setSaving(false);
    }
  };

  const roleOptions = [
    { value: 'POLICYHOLDER', label: 'Policyholder' },
    { value: 'ADJUSTER', label: 'Adjuster' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Display Name"
        value={formData.displayName}
        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
        required
        fullWidth
      />
      
      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
        fullWidth
      />
      
      <Select
        label="Role"
        options={roleOptions}
        value={formData.role}
        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
        fullWidth
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {user ? 'Update' : 'Create'} User
        </Button>
      </div>
    </form>
  );
};

export default UsersPage;
