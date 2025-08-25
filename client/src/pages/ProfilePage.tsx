import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Bell, Shield, Save } from 'lucide-react';
import { useAppSelector } from '@/hooks';
import { Button, Input, Card, Badge } from '@/components/ui';
import { getRoleLabel } from '@/utils/helpers';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      phone: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password updated successfully');
      resetPassword();
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profile Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Display Name"
                  {...registerProfile('displayName')}
                  error={profileErrors.displayName?.message}
                  fullWidth
                />
                <Input
                  label="Email Address"
                  type="email"
                  {...registerProfile('email')}
                  error={profileErrors.email?.message}
                  fullWidth
                />
                <Input
                  label="Phone Number"
                  {...registerProfile('phone')}
                  error={profileErrors.phone?.message}
                  fullWidth
                />
                <div>
                  <label className="form-label">Role</label>
                  <div className="mt-1">
                    <Badge variant="primary" size="lg">
                      {user ? getRoleLabel(user.role) : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                leftIcon={<Save size={16} />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Change Password
              </h3>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <Input
                  label="Current Password"
                  type="password"
                  {...registerPassword('currentPassword')}
                  error={passwordErrors.currentPassword?.message}
                  fullWidth
                />
                <Input
                  label="New Password"
                  type="password"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                  fullWidth
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  {...registerPassword('confirmPassword')}
                  error={passwordErrors.confirmPassword?.message}
                  fullWidth
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    leftIcon={<Save size={16} />}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Two-Factor Authentication
              </h4>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">SMS Authentication</p>
                  <p className="text-sm text-gray-600">
                    Receive verification codes via SMS
                  </p>
                </div>
                <Button variant="secondary" size="sm">
                  Enable
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Active Sessions
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Current Session</p>
                    <p className="text-sm text-gray-600">
                      Chrome on macOS • Last active now
                    </p>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Mobile App</p>
                    <p className="text-sm text-gray-600">
                      iOS App • Last active 2 hours ago
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Revoke
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Preferences
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-600">
                    Receive email updates about your claims
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                  <p className="text-sm text-gray-600">
                    Get SMS alerts for urgent updates
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-primary-600" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-600">
                    Receive push notifications on mobile
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Weekly Summary</h4>
                  <p className="text-sm text-gray-600">
                    Get a weekly summary of your claims activity
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="primary" leftIcon={<Save size={16} />}>
                Save Preferences
              </Button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Privacy Settings
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                  <p className="text-sm text-gray-600">
                    Control who can see your profile information
                  </p>
                </div>
                <select className="form-input w-32">
                  <option>Private</option>
                  <option>Team Only</option>
                  <option>Public</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Activity Tracking</h4>
                  <p className="text-sm text-gray-600">
                    Allow system to track your activity for analytics
                  </p>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 text-primary-600" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Data Sharing</h4>
                  <p className="text-sm text-gray-600">
                    Share anonymized data for product improvement
                  </p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-primary-600" />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Data Management
              </h4>
              <div className="flex space-x-3">
                <Button variant="secondary" size="sm">
                  Download My Data
                </Button>
                <Button variant="ghost" size="sm" className="text-red-600">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">{user?.displayName}</p>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>
            </div>
            
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} className="mr-3" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            {renderTabContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
