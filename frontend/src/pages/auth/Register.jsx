import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useForm } from '@hooks/useForm';
import { Button, Input, Alert, Select } from '@components/common';
import { isValidEmail, isStrongPassword } from '@utils/validators';

const Register = () => {
  const { registerWithRedirect, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (values) => {
    const errors = {};

    if (!values.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!values.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!isStrongPassword(values.password)) {
      errors.password =
        'Password must be at least 6 characters with 1 uppercase, 1 lowercase, and 1 number';
    }

    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!values.role) {
      errors.role = 'Please select a role';
    }

    return errors;
  };

  const handleSubmit = async (values) => {
    clearError();
    const { confirmPassword, ...registerData } = values;
    await registerWithRedirect(registerData);
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
  } = useForm(
    {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
    },
    handleSubmit,
    validate
  );

  const roleOptions = [
    { value: 'learner', label: 'Learner' },
    { value: 'trainer', label: 'Trainer' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Create account
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Join LMS Nexus to start learning
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible onDismiss={clearError} className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            name="firstName"
            placeholder="John"
            value={values.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.firstName && errors.firstName}
            leftIcon={<User className="w-4 h-4" />}
            required
          />

          <Input
            label="Last Name"
            type="text"
            name="lastName"
            placeholder="Doe"
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
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          leftIcon={<Mail className="w-4 h-4" />}
          required
          autoComplete="email"
        />

        <Select
          label="I want to"
          name="role"
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.role && errors.role}
          options={roleOptions}
          placeholder="Select your role"
          required
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          placeholder="••••••••"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword && errors.confirmPassword}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          }
          required
          autoComplete="new-password"
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
