import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { useForm } from '@hooks/useForm';
import { Button, Input, Alert } from '@components/common';
import { isValidEmail } from '@utils/validators';

const Login = () => {
  const { loginWithRedirect, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const validate = (values) => {
    const errors = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSubmit = async (values) => {
    clearError();
    await loginWithRedirect(values);
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
      email: '',
      password: '',
    },
    handleSubmit,
    validate
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Welcome back
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <Alert variant="error" dismissible onDismiss={clearError} className="mb-4">
          {error}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
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
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
