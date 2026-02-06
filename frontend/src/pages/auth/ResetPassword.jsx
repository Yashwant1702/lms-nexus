import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useForm } from '@hooks/useForm';
import { Button, Input, Alert } from '@components/common';
import { isStrongPassword } from '@utils/validators';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { resetPassword, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validate = (values) => {
    const errors = {};

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

    return errors;
  };

  const handleSubmit = async (values) => {
    clearError();
    try {
      await resetPassword(token, values.password);
      navigate('/login', {
        state: { message: 'Password reset successfully. Please login.' },
      });
    } catch (err) {
      console.error('Reset password error:', err);
    }
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
      password: '',
      confirmPassword: '',
    },
    handleSubmit,
    validate
  );

  if (!token) {
    return (
      <div className="text-center">
        <Alert variant="error" className="mb-4">
          Invalid or missing reset token
        </Alert>
        <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
          Back to login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Reset password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible onDismiss={clearError} className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="New Password"
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
          Reset password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;
