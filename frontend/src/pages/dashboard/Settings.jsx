import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useForm } from '@hooks/useForm';
import {
  User,
  Mail,
  Lock,
  Bell,
  Globe,
  Palette,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Tabs,
  Input,
  Button,
  Select,
  Checkbox,
  Alert,
  Avatar,
} from '@components/common';
import { isValidEmail } from '@utils/validators';
import toast from 'react-hot-toast';

const Settings = () => {
  const tabs = [
    { label: 'Profile', content: <ProfileSettings /> },
    { label: 'Account', content: <AccountSettings /> },
    { label: 'Notifications', content: <NotificationSettings /> },
    { label: 'Preferences', content: <PreferenceSettings /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <Tabs tabs={tabs} />
      </Card>
    </div>
  );
};

const ProfileSettings = () => {
  const { user, updateProfile, isLoading } = useAuth();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
    async (values) => {
      try {
        await updateProfile(values);
        toast.success('Profile updated successfully');
      } catch (error) {
        toast.error('Failed to update profile');
      }
    },
    (values) => {
      const errors = {};
      if (!values.firstName) errors.firstName = 'First name is required';
      if (!values.lastName) errors.lastName = 'Last name is required';
      if (!values.email) errors.email = 'Email is required';
      else if (!isValidEmail(values.email)) errors.email = 'Invalid email';
      return errors;
    }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar
          src={user?.avatarUrl}
          name={`${user?.firstName} ${user?.lastName}`}
          size="xl"
        />
        <div>
          <Button variant="secondary" size="sm">
            Change Avatar
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            JPG, PNG or GIF. Max 5MB
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.firstName && errors.firstName}
          leftIcon={<User className="w-4 h-4" />}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.lastName && errors.lastName}
          leftIcon={<User className="w-4 h-4" />}
          required
        />
      </div>

      <Input
        label="Email"
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.email && errors.email}
        leftIcon={<Mail className="w-4 h-4" />}
        required
        disabled
      />

      <div className="flex justify-end gap-3">
        <Button variant="secondary">Cancel</Button>
        <Button
          type="submit"
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

const AccountSettings = () => {
  const { updatePassword, isLoading } = useAuth();

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  } = useForm(
    {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    async (values) => {
      try {
        await updatePassword(values.currentPassword, values.newPassword);
        toast.success('Password updated successfully');
        reset();
      } catch (error) {
        toast.error('Failed to update password');
      }
    },
    (values) => {
      const errors = {};
      if (!values.currentPassword)
        errors.currentPassword = 'Current password is required';
      if (!values.newPassword) errors.newPassword = 'New password is required';
      if (values.newPassword !== values.confirmPassword)
        errors.confirmPassword = 'Passwords do not match';
      return errors;
    }
  );

  return (
    <div className="space-y-6">
      <Alert variant="info">
        Ensure your password is at least 6 characters with uppercase, lowercase, and numbers.
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Current Password"
          type="password"
          name="currentPassword"
          value={values.currentPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.currentPassword && errors.currentPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="New Password"
          type="password"
          name="newPassword"
          value={values.newPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.newPassword && errors.newPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword && errors.confirmPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    courseUpdates: true,
    assessmentReminders: true,
    achievementAlerts: true,
  });

  const handleSave = () => {
    toast.success('Notification settings saved');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Checkbox
          label="Email Notifications"
          checked={settings.emailNotifications}
          onChange={(e) =>
            setSettings({ ...settings, emailNotifications: e.target.checked })
          }
        />
        <Checkbox
          label="Push Notifications"
          checked={settings.pushNotifications}
          onChange={(e) =>
            setSettings({ ...settings, pushNotifications: e.target.checked })
          }
        />
        <Checkbox
          label="Course Updates"
          checked={settings.courseUpdates}
          onChange={(e) =>
            setSettings({ ...settings, courseUpdates: e.target.checked })
          }
        />
        <Checkbox
          label="Assessment Reminders"
          checked={settings.assessmentReminders}
          onChange={(e) =>
            setSettings({ ...settings, assessmentReminders: e.target.checked })
          }
        />
        <Checkbox
          label="Achievement Alerts"
          checked={settings.achievementAlerts}
          onChange={(e) =>
            setSettings({ ...settings, achievementAlerts: e.target.checked })
          }
        />
      </div>

      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

const PreferenceSettings = () => {
  return (
    <div className="space-y-6">
      <Select
        label="Language"
        options={[
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
        ]}
        defaultValue="en"
      />

      <Select
        label="Timezone"
        options={[
          { value: 'UTC', label: 'UTC' },
          { value: 'EST', label: 'Eastern Time' },
          { value: 'PST', label: 'Pacific Time' },
        ]}
        defaultValue="UTC"
      />

      <div className="flex justify-end">
        <Button variant="primary">Save Preferences</Button>
      </div>
    </div>
  );
};

export default Settings;
